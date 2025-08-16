import { NextResponse } from "next/server";

// Disable logs API for Vercel
export async function GET() {
  return NextResponse.json(
    { error: "Logs API is disabled on this environment" },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Logs API is disabled on this environment" },
    { status: 403 }
  );
}
