import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const user_id = BigInt(token.user.id);

    const { oldPassword, newPassword, confirmPassword } = await request.json();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
    }

    // Fetch the user from the database
    const user = await prisma.users.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Old password is incorrect." }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.users.update({
      where: { id: user_id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
  } catch (error) {
    logger.error(`Password change error:${error}`);
    return NextResponse.json({ error: "An error occurred while changing password." }, { status: 500 });
  }
}
