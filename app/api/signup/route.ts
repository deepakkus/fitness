import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma"; // Adjust the import path based on your project structure
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body; 

    if (!name || name.trim() === "") { 
      return NextResponse.json({ status: "error", message: "Name is required and cannot be empty." }, { status: 400 });
    }
    if (!email || !password) {
      return NextResponse.json({ status: "error", message: "Email and password are required." }, { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ status: "error", message: "Email already in use." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        name: name.trim(), 
        email,
        password: hashedPassword,
        is_active: true,
      },
    });

    return NextResponse.json({ status: "success", message: "Account created successfully." }, { status: 201 });
  } catch (error) {
    logger.error(`Signup error:${error}`);
    return NextResponse.json({ status: "error", message: "An error occurred during signup." }, { status: 500 });
  }
}