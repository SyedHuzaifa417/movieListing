import { NextResponse } from "next/server";
import { getMovies, addMovie } from "@/lib/db";

export async function GET(request: Request) {
  try {
    console.log("GET /api/movies");
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "all";
    const rating = searchParams.get("rating") || "all";

    console.log(`Search: ${search}, Genre: ${genre}, Rating: ${rating}`);

    const movies = await getMovies(search, genre, rating);
    console.log(`Movies: ${JSON.stringify(movies)}`);

    return NextResponse.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/movies");
    const data = await request.json();
    console.log(`Data: ${JSON.stringify(data)}`);

    if (!data.name || !data.genre || !data.rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const movie = await addMovie(data.name, data.genre, data.rating);
    console.log(`Movie: ${JSON.stringify(movie)}`);

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error adding movie:", error);
    return NextResponse.json({ error: "Failed to add movie" }, { status: 500 });
  }
}
