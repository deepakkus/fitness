// app/api/notifications/route.ts - Updated processing section
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
    const pageSize = 20; // Limit number of notifications per type for performance

    // Get notifications from the new table
    const newNotificationsRaw = await prisma.notifications.findMany({
      where: {
        recipient_id: user_id,
        recipient_type: "user",
        deleted_at: null,
      },
      orderBy: { created_at: "desc" },
      take: 100, // Reasonable limit to prevent excessive data
    });


    // Get user information for user triggerers
    const userTriggererIds = newNotificationsRaw
      .filter(notification => notification.triggerer_type === "user")
      .map(notification => BigInt(notification.triggerer_id.toString()));

    const users = await prisma.users.findMany({
      where: { id: { in: userTriggererIds.length > 0 ? userTriggererIds : [BigInt(0)] } },
      select: { id: true, name: true, profile_picture: true },
    });

    const userMap = Object.fromEntries(
      users.map(user => [user.id.toString(), user])
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Process notifications
    const processedNotifications = newNotificationsRaw.map(notification => {
      const triggererUser = notification.triggerer_type === "user" 
        ? userMap[notification.triggerer_id.toString()] 
        : null;
      
      let metadata = {};
      try {
        if (typeof notification.metadata === "string") {
          metadata = JSON.parse(notification.metadata);
        } else if (typeof notification.metadata === "object" && notification.metadata !== null) {
          metadata = notification.metadata;
        }
      } catch (e) {
        console.error("Error parsing notification metadata:", e);
        metadata = {};
      }
      
      let meaningful_text = "";
      
      // Check if this is an aggregated notification with count > 1
      const isAggregated = metadata.count && metadata.count > 1;
      
      switch (notification.notification_type) {
        case "message":
          if (isAggregated) {
            meaningful_text = `${metadata.count} new messages in this activity`;
          } else {
            meaningful_text = triggererUser ? `${triggererUser.name} sent a message` : "You received a message";
          }
          break;
        case "comment":
          if (isAggregated) {
            meaningful_text = `${metadata.count} users commented on your activity`;
          } else {
            meaningful_text = triggererUser ? `${triggererUser.name} commented on the activity` : "Someone commented on the activity";
          }
          break;
        case "like":
          if (isAggregated) {
            meaningful_text = `${metadata.count} users liked your activity`;
          } else {
            meaningful_text = triggererUser ? `${triggererUser.name} liked the activity` : "Someone liked the activity";
          }
          break;
        case "activity_join":
          meaningful_text = triggererUser ? `${triggererUser.name} requested to join` : "Someone requested to join";
          break;
        case "join_request_voting":
          meaningful_text = triggererUser ? `${triggererUser.name} requested to join` : "Someone requested to join";
          break;
        case "join_request_accepted":
          meaningful_text = "Your request to join the activity was accepted!";
          break;
        case "order":
          meaningful_text = metadata.title || "New order received";
          break;
        default:
          meaningful_text = notification.notification_type;
      }

      // Build media thumbnail URL or use triggerer's profile picture
      let mediaThumbnail = "";
      if (notification.media_thumbnail) {
        mediaThumbnail = `${baseUrl}/api/images/${notification.media_thumbnail}`;
      } else if (triggererUser?.profile_picture) {
        mediaThumbnail = `${baseUrl}/api/images/${triggererUser.profile_picture}`;
      }

      return {
        id: notification.id.toString(),
        row_id: notification.id.toString(),
        recipient_id: notification.recipient_id.toString(),
        recipient_type: notification.recipient_type,
        triggerer_id: notification.triggerer_id.toString(),
        triggerer_type: notification.triggerer_type,
        notification_type: notification.notification_type,
        media_thumbnail: mediaThumbnail,
        notification_timestamp: notification.created_at,
        read_at: notification.read_at,
        title: metadata.title || "",
        meaningful_text,
        activity_id: metadata.activityId,
        activity_type: metadata.activityType,
        action_url: notification.action_url,
        isAggregated: isAggregated,
        count: metadata.count || 1,
        metadata,
      };
    });

    // IMPORTANT FIX: Group notifications correctly
    const groupedNotifications = {
      message: processedNotifications.filter(n => n.notification_type === "message").slice(0, pageSize),
      comment: processedNotifications.filter(n => n.notification_type === "comment").slice(0, pageSize),
      like: processedNotifications.filter(n => n.notification_type === "like").slice(0, pageSize),
      activity_join: processedNotifications.filter(n => 
        ["join_request_voting", "join_request_accepted", "activity_join"].includes(n.notification_type)
      ).slice(0, pageSize),
      order: processedNotifications.filter(n => n.notification_type === "order").slice(0, pageSize),
      post: processedNotifications.filter(n => n.notification_type === "post").slice(0, pageSize),
    };

    // console.log("Grouped notifications:", {
    //   message: groupedNotifications.message.length,
    //   comment: groupedNotifications.comment.length,
    //   like: groupedNotifications.like.length,
    //   activity_join: groupedNotifications.activity_join.length,
    // });

    return NextResponse.json(groupedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}