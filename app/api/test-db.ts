import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  try {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });

    const result = await pool.query("SELECT NOW() as time");

    await pool.end();

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      time: result.rows[0].time,
      connectionString: process.env.POSTGRES_URL ? "Configured" : "Missing",
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        connectionString: process.env.POSTGRES_URL ? "Configured" : "Missing",
      },
      { status: 500 }
    );
  }
}
