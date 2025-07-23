import { NextRequest, NextResponse } from "next/server";
import { authenticateGoogleUser } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json();

    // Authenticate or create Google user and generate tokens
    const authData = await authenticateGoogleUser(profile);

    return NextResponse.json(authData, { status: 200 });
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.json({ error: "Google login failed" }, { status: 500 });
  }
}
