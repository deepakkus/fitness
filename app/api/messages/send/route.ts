//app/api/messages/send/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import prisma from "@/lib/prisma";
// import logger from "@/lib/logger";

// export async function POST(request: NextRequest) {
//   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

//   if (!token || !token.user || !token.user.id) {
//     return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//   }

//   const user_id = BigInt(token.user.id);

//   try {
//     const data = await request.json();
//     const { activity_id, messages: messageText } = data;
//     if (!activity_id) {
//       return NextResponse.json({ error: "Missing required fields activity_id" }, { status: 400 });
//     }

//     // Create a new message
//     const newMessage = await prisma.messages.create({
//       data: {
//         activity_id: BigInt(activity_id),
//         added_by: user_id,
//         message: messageText || "",
//       },
//     });

//     return NextResponse.json({
//       message: "Message Send",
//       newMessage: {
//         id: newMessage.id,
//         activity_id: newMessage.activity_id,
//         added_by: newMessage.added_by,
//         created_at: newMessage.created_at,
//       },
//     });
//   } catch (error) {
//     logger.error(`Error sending message:${error}`);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }



//app/api/messages/send/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { createOrUpdateNotifications } from "@/lib/notification-utils";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const user_id = BigInt(token.user.id);

  try {
    const data = await request.json();
    const { activity_id, messages: messageText } = data;
    if (!activity_id) {
      return NextResponse.json({ error: "Missing required fields activity_id" }, { status: 400 });
    }

    // Create a new message
    const newMessage = await prisma.messages.create({
      data: {
        activity_id: BigInt(activity_id),
        added_by: user_id,
        message: messageText || "",
      },
    });

    // Get the activity details
    const activity = await prisma.activities.findUnique({
      where: { id: BigInt(activity_id) },
      select: { title: true, added_by: true, is_event: true }
    });
    
    if (activity) {
      // Create notifications for all members except the sender
      const notificationIds = await createOrUpdateNotifications({
        activityId: activity_id,
        actionType: 'message',
        actorId: user_id,
        // No need to exclude activity creator for messages
        // We're only excluding the sender
        excludeIds: [user_id],
        title: activity.title,
        isEvent: activity.is_event,
        messagePreview: messageText?.substring(0, 50) || "",
        priority: 2, // Higher priority for messages
        customActionUrl: '/messages'
      });
      
      logger.info(`Created ${notificationIds.length} message notifications`);
    }

    return NextResponse.json({
      message: "Message Send",
      newMessage: {
        id: newMessage.id,
        activity_id: newMessage.activity_id,
        added_by: newMessage.added_by,
        created_at: newMessage.created_at,
      },
    });
  } catch (error) {
    logger.error(`Error sending message:${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
