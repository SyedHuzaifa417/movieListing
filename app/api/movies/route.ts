import { NextRequest, NextResponse } from "next/server";
import { createMovie, getMovies } from "@/lib/db";
import { cookies } from "next/headers";
import * as jose from "jose";

async function getUserId(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    const { payload } = await jose.jwtVerify(token, secret);

    return payload.userId as string;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const rating = searchParams.get("rating") || "";

    const movies = await getMovies({
      userId,
      search,
      genre: genre !== "all" ? genre : "",
      rating: rating !== "all" ? rating : "",
    });

    return NextResponse.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await req.json();

    if (!data.name || !data.genre || !data.rating) {
      return NextResponse.json(
        { error: "Name, genre, and rating are required" },
        { status: 400 }
      );
    }

    const movie = await createMovie({
      name: data.name,
      genre: data.genre,
      rating: data.rating,
      userId,
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error("Error creating movie:", error);
    return NextResponse.json(
      { error: "Failed to create movie" },
      { status: 500 }
    );
  }
}
