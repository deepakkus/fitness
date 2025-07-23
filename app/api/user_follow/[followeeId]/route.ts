// app/api/user_follow/[followeeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma"; // Ensure your Prisma client is configured correctly
import logger from "@/lib/logger";

export async function POST(request: NextRequest, { params }: { params: { followeeId: string } }) {
  try {
    const { followeeId } = params;
    if (!followeeId) {
      return NextResponse.json({ error: "Params Missing followee_id" }, { status: 400 });
    }
    const followee_id = BigInt(followeeId);

    // Extract token from the request
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // Ensure the token is valid and contains the user ID
    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const followerId = BigInt(token.user.id);

    // Prevent users from following themselves
    if (followerId === followee_id) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    // Check if the follower-followee relationship already exists
    const existingFollow = await prisma.user_followers.findFirst({
      where: {
        follower_id: followerId,
        followee_id: followee_id,
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: "You are already following this user" }, { status: 400 });
    }

    // Create the follow relationship
    const follow = await prisma.user_followers.create({
      data: {
        follower_id: followerId,
        followee_id: followee_id,
      },
    });

    return NextResponse.json({
      message: "Successfully followed the user",
      data: follow,
    });
  } catch (error) {
    logger.error(`Error processing follow request:${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
