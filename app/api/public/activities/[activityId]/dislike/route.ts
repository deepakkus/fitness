// app/api/public/activities/[activityId]/dislike/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { activityId: string } }) {
  const { activityId } = params;
  const activity_id = BigInt(activityId);

  if (!activity_id) {
    return NextResponse.json({ error: "Params Missing activityId" }, { status: 401 });
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const user_id = BigInt(token.user.id);

  try {
    // Check for an active like and remove it
    const existingLike = await prisma.activity_likes.findFirst({
      where: {
        activity_id: activity_id,
        added_by: user_id,
        like_dislike: true,
        deleted_at: null, // Only active likes
      },
    });

    if (existingLike) {
      await prisma.activity_likes.update({
        where: { id: existingLike.id },
        data: { deleted_at: new Date() },
      });
    }

    // Check for an active dislike
    const existingDislike = await prisma.activity_likes.findFirst({
      where: {
        activity_id: activity_id,
        added_by: user_id,
        like_dislike: false,
        deleted_at: null, // Only active dislikes
      },
    });

    if (existingDislike) {
      // Soft-delete the dislike
      await prisma.activity_likes.update({
        where: { id: existingDislike.id },
        data: { deleted_at: new Date() },
      });
      return NextResponse.json({ action: "removed" });
    } else {
      // Add a new dislike
      await prisma.activity_likes.create({
        data: {
          activity_id: activity_id,
          like_dislike: false,
          added_by: user_id,
        },
      });
      return NextResponse.json({ action: "added" });
    }
  } catch (error) {
    console.error("Error handling dislike:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { activityId: string } }) {
  const { activityId } = params;
  const activity_id = BigInt(activityId);

  if (!activity_id) {
    return NextResponse.json({ error: "Params Missing activityId" }, { status: 400 });
  }

  try {
    // Count only active dislikes (like_dislike: false, deleted_at: null)
    const dislikeCount = await prisma.activity_likes.count({
      where: {
        activity_id: activity_id,
        like_dislike: false,
        deleted_at: null,
      },
    });

    return NextResponse.json({ count: dislikeCount || 0 });
  } catch (error) {
    console.error("Error fetching dislike count:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}