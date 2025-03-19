import { NextRequest, NextResponse } from "next/server";
import { deleteMovie, updateMovie } from "@/lib/db";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Delete movie
    await deleteMovie(params.id, userId);

    return NextResponse.json(
      { message: "Movie deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting movie:", error);

    if (
      error instanceof Error &&
      error.message === "Movie not found or not owned by user"
    ) {
      return NextResponse.json(
        { error: "Movie not found or you don't have permission to delete it" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete movie" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, genre, rating } = await request.json();

    // Get token from cookie
    const token = request.headers
      .get("cookie")
      ?.split("token=")[1]
      ?.split(";")[0];

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    verify(token, JWT_SECRET);

    const movie = await updateMovie(params.id, name, genre);
    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error updating movie:", error);
    return NextResponse.json(
      { error: "Failed to update movie" },
      { status: 500 }
    );
  }
}
