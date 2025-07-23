//app/api/mob/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Authenticate user and generate tokens
    const authData = await authenticateUser(email, password);

    return NextResponse.json(authData, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
