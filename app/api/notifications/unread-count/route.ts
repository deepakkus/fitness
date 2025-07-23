// app/api/notifications/unread-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const user_id = BigInt(token.user.id);

    // Count unread notifications by type
    const [messageCount, commentCount, likeCount, activityJoinCount, orderCount, totalCount] = await prisma.$transaction([
      prisma.notifications.count({
        where: {
          recipient_id: user_id,
          recipient_type: "user",
          notification_type: "message",
          read_at: null,
          deleted_at: null,
        },
      }),
      prisma.notifications.count({
        where: {
          recipient_id: user_id,
          recipient_type: "user",
          notification_type: "comment",
          read_at: null,
          deleted_at: null,
        },
      }),
      prisma.notifications.count({
        where: {
          recipient_id: user_id,
          recipient_type: "user",
          notification_type: "like",
          read_at: null,
          deleted_at: null,
        },
      }),
      prisma.notifications.count({
        where: {
          recipient_id: user_id,
          recipient_type: "user",
          notification_type: {
            in: ["join_request_voting", "join_request_accepted", "activity_join"],
          },
          read_at: null,
          deleted_at: null,
        },
      }),
      prisma.notifications.count({
        where: {
          recipient_id: user_id,
          recipient_type: "user",
          notification_type: "order",
          read_at: null,
          deleted_at: null,
        },
      }),
      prisma.notifications.count({
        where: {
          recipient_id: user_id,
          recipient_type: "user",
          read_at: null,
          deleted_at: null,
        },
      }),
    ]);

    // console.log("Unread counts:", {
    //   message: messageCount,
    //   comment: commentCount,
    //   like: likeCount,
    //   activity_join: activityJoinCount,
    //   order: orderCount,
    //   total: totalCount
    // });

    return NextResponse.json({
      message: messageCount,
      comment: commentCount,
      like: likeCount,
      activity_join: activityJoinCount,
      order: orderCount,
      total: totalCount,
      lastViewed: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching unread counts:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}