import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";
import { getUserByUsername } from "@/lib/db";
import { compare } from "bcryptjs";

// Simple exports for route configuration
export const dynamic = "auto";
export const fetchCache = "default-no-store";

// Simple GET handler
export async function GET() {
  return new Response(JSON.stringify({ message: "Login API route" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Simplified POST handler
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { username, password } = body;

    // Basic validation
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user
    const user = await getUserByUsername(username);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid username or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify password
    const passwordValid = await compare(password, user.passwordHash);
    if (!passwordValid) {
      return new Response(
        JSON.stringify({ error: "Invalid username or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create token
    const secret = process.env.JWT_SECRET || "fallback-secret-for-dev-only";
    const token = sign({ userId: user.id, username: user.username }, secret, {
      expiresIn: "7d",
    });

    // Create response
    const response = new Response(
      JSON.stringify({
        message: "Logged in successfully",
        username: user.username,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

    // Set cookies manually
    const cookieOptions = `HttpOnly; Path=/; Max-Age=${
      7 * 24 * 60 * 60
    }; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

    response.headers.set("Set-Cookie", `token=${token}; ${cookieOptions}`);
    response.headers.append(
      "Set-Cookie",
      `auth_state=true; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
