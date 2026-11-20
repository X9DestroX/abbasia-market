
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      provider: "Supabase PostgreSQL",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: "Database connection failed. Check server logs.",
      },
      { status: 503 }
    );
  }
}
