import { NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/db";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

// App Router specific configuration
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ message: "Login API endpoint" });
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Create token
    const secret = process.env.JWT_SECRET || "fallback-secret-for-dev-only";
    const token = sign({ userId: user.id, username: user.username }, secret, {
      expiresIn: "7d",
    });

    // Create response with cookies
    const response = NextResponse.json({
      message: "Logged in successfully",
      username: user.username,
    });

    // Set cookies using NextResponse
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set("auth_state", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
