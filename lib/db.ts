import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function query(text: string, params: any[] = []) {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

export async function createMoviesTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        genre TEXT NOT NULL,
        rating TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Movies table created successfully");
  } catch (error) {
    console.error("Error creating movies table:", error);
    throw error;
  }
}

export async function getMovies(search = "", genre = "all", rating = "all") {
  try {
    let queryText = "SELECT * FROM movies WHERE 1=1";
    const values: any[] = [];
    let valueIndex = 1;

    if (search) {
      queryText += ` AND name ILIKE $${valueIndex}`;
      values.push(`%${search}%`);
      valueIndex++;
    }

    if (genre !== "all") {
      queryText += ` AND genre = $${valueIndex}`;
      values.push(genre);
      valueIndex++;
    }

    if (rating !== "all") {
      queryText += ` AND rating >= $${valueIndex}`;
      values.push(rating);
      valueIndex++;
    }

    queryText += " ORDER BY created_at DESC";

    console.log("Query:", queryText);
    console.log("Values:", values);

    const result = await query(queryText, values);
    return result.rows;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
}

export async function addMovie(name: string, genre: string, rating: string) {
  try {
    const result = await query(
      "INSERT INTO movies (name, genre, rating) VALUES ($1, $2, $3) RETURNING *",
      [name, genre, rating]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error adding movie:", error);
    throw error;
  }
}
