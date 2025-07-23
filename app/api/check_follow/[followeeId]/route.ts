// app/api/check_follow/[followeeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { followeeId: string } }) {
  try {
    const { followeeId } = params;
    if (!followeeId) {
      return NextResponse.json({ error: "Missing followeeId parameter" }, { status: 400 });
    }
    const followee_id = BigInt(followeeId);

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ isFollowing: false }, { status: 401 }); 
    }

    const followerId = BigInt(token.user.id);

    const existingFollow = await prisma.user_followers.findFirst({
      where: {
        follower_id: followerId,
        followee_id: followee_id,
      },
    });

    return NextResponse.json({ isFollowing: !!existingFollow });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}