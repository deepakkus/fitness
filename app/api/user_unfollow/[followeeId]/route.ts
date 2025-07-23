// app/api/user_unfollow/[followeeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export async function DELETE(request: NextRequest, { params }: { params: { followeeId: string } }) {
  try {
    const { followeeId } = params;
    if (!followeeId) {
      return NextResponse.json({ error: "Missing followeeId parameter" }, { status: 400 });
    }
    const followee_id = BigInt(followeeId);

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const followerId = BigInt(token.user.id);

    const existingFollow = await prisma.user_followers.findFirst({
      where: {
        follower_id: followerId,
        followee_id: followee_id,
      },
    });

    if (!existingFollow) {
      return NextResponse.json({ error: "You are not following this user" }, { status: 400 });
    }

    await prisma.user_followers.delete({
      where: {
        id: existingFollow.id,
      },
    });

    return NextResponse.json({ message: "Successfully unfollowed the user" });
  } catch (error) {
    logger.error(`Error processing unfollow request:${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}