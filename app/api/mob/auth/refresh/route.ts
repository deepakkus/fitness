import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    // Refresh the access token
    const newAccessToken = await refreshAccessToken(refreshToken);

    return NextResponse.json(newAccessToken, { status: 200 });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 403 });
  }
}
