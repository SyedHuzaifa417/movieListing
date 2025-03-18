import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const genre = searchParams.get("genre") || "all";
  const rating = searchParams.get("rating") || "all";

  try {
    let query = `SELECT * FROM movies WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    if (genre !== "all") {
      params.push(genre);
      query += ` AND genre = $${params.length}`;
    }

    if (rating !== "all") {
      params.push(rating);
      query += ` AND rating >= $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await sql.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

// Add a new movie
export async function POST(request: Request) {
  try {
    const { name, genre, rating } = await request.json();

    if (!name || !genre || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      INSERT INTO movies (name, genre, rating)
      VALUES (${name}, ${genre}, ${rating})
      RETURNING *;
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to add movie" }, { status: 500 });
  }
}
