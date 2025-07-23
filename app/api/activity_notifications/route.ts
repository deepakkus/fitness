


// // app/api/activity_notifications/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import prisma from "@/lib/prisma";

// interface Notification {
//   row_id: string;
//   recipient_id: string;
//   recipient_type: string;
//   trigeree_id: string;
//   trigeree_type: string;
//   notification_type: string;
//   media_thumbnail: string;
//   notification_timestamp: Date;
//   title: string;
//   meaningful_text: string;
//   activity_id?: string; // Added activity_id
// }

// interface GroupedNotifications {
//   message: Notification[];
//   comment: Notification[];
//   like: Notification[];
//   activity_join: Notification[];
// }

// export async function GET(request: NextRequest) {
//   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
//   if (!token || !token.user || !token.user.id) {
//     return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//   }

//   try {
//     const user_id = BigInt(token.user.id);

//     // Fetch notifications
//     const notifications = await prisma.activity_notifications.findMany({
//       where: {
//         recipient_id: user_id,
//         recipient_type: "user",
//         OR: [{ trigeree_type: "activity" }, { trigeree_type: "user", trigeree_id: { not: user_id } }],
//       },
//       orderBy: { notification_timestamp: "desc" },
//     });

//     // Get user trigerees for names
//     const userTrigerees = notifications
//       .filter((notification) => notification.trigeree_type === "user")
//       .map((notification) => BigInt(`${notification.trigeree_id}`));

//     // Fetch user names
//     const users = await prisma.users.findMany({
//       where: { id: { in: userTrigerees } },
//       select: { id: true, name: true },
//     });

//     // Get related activity IDs for comments and likes
//     const commentAndLikeNotifications = notifications.filter(
//       n => n.notification_type === "comment" || n.notification_type === "like"
//     );

//     // Fetch related activity IDs
//     const activityData = await prisma.activity_comments.findMany({
//       where: {
//         added_by: { in: commentAndLikeNotifications.map(n => BigInt(n.trigeree_id)) }
//       },
//       select: {
//         activity_id: true,
//         added_by: true,
//       }
//     });

//     const activityLikes = await prisma.activity_likes.findMany({
//       where: {
//         added_by: { in: commentAndLikeNotifications.map(n => BigInt(n.trigeree_id)) }
//       },
//       select: {
//         activity_id: true,
//         added_by: true,
//       }
//     });

//     // Create lookup maps
//     const userMap = Object.fromEntries(users.map((user) => [user.id, user.name]));
//     const commentActivityMap = Object.fromEntries(
//       activityData.map(data => [data.added_by.toString(), data.activity_id.toString()])
//     );
//     const likeActivityMap = Object.fromEntries(
//       activityLikes.map(data => [data.added_by.toString(), data.activity_id.toString()])
//     );

//     const baseUrl = process.env.APP_URL;

//     // Process notifications with activity IDs
//     const processedNotifications = notifications.map((notification) => {
//       let meaningful_text = "";
//       let activity_id: string | undefined;

//       switch (notification.notification_type) {
//         case "message":
//           meaningful_text = `${userMap[`${notification.trigeree_id}`]} sent a message`;
//           break;
//         case "comment":
//           meaningful_text = `${userMap[`${notification.trigeree_id}`]} commented on the activity`;
//           activity_id = commentActivityMap[notification.trigeree_id.toString()];
//           break;
//         case "like":
//           meaningful_text = `${userMap[`${notification.trigeree_id}`]} liked the activity`;
//           activity_id = likeActivityMap[notification.trigeree_id.toString()];
//           break;
//         case "join_request_voting":
//           meaningful_text = `${userMap[`${notification.trigeree_id}`]} requested to Join:`;
//           break;
//         case "join_request_accepted":
//           meaningful_text = `You got accepted into group:`;
//           break;
//       }

//       return {
//         ...notification,
//         row_id: notification.row_id.toString(),
//         recipient_id: notification.recipient_id.toString(),
//         trigeree_id: notification.trigeree_id.toString(),
//         title: notification.title,
//         activity_id,
//         media_thumbnail: notification.media_thumbnail
//           ? notification.media_thumbnail.split(",").map((thumbnail) => `${baseUrl}/api/images/${thumbnail.trim()}`)[0]
//           : "",
//         meaningful_text,
//       };
//     });

//     // Group notifications
//     const groupedNotifications: GroupedNotifications = {
//       message: processedNotifications.filter((n) => n.notification_type === "message"),
//       comment: processedNotifications.filter((n) => n.notification_type === "comment"),
//       like: processedNotifications.filter((n) => n.notification_type === "like"),
//       activity_join: processedNotifications.filter((n) =>
//         ["join_request_voting", "join_request_accepted"].includes(n.notification_type)
//       ),
//     };

//     return NextResponse.json(groupedNotifications);
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
//   }
// }





// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import prisma from "@/lib/prisma";

// interface Notification {
//   row_id: string;
//   recipient_id: string;
//   recipient_type: string;
//   trigeree_id: string;
//   trigeree_type: string;
//   notification_type: string;
//   media_thumbnail: string;
//   notification_timestamp: Date;
//   title: string;
//   meaningful_text: string;
//   activity_id?: string;
//   activity_type?: 'event' | 'post';
// }

// interface GroupedNotifications {
//   message: Notification[];
//   comment: Notification[];
//   like: Notification[];
//   activity_join: Notification[];
// }

// export async function GET(request: NextRequest) {
//   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
//   if (!token || !token.user || !token.user.id) {
//     return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//   }

//   try {
//     const user_id = BigInt(token.user.id);

//     // Fetch notifications
//     const notifications = await prisma.activity_notifications.findMany({
//       where: {
//         recipient_id: user_id,
//         recipient_type: "user",
//         OR: [{ trigeree_type: "activity" }, { trigeree_type: "user", trigeree_id: { not: user_id } }],
//       },
//       orderBy: { notification_timestamp: "desc" },
//     });

//     // Get user trigerees for names
//     const userTrigerees = notifications
//       .filter((notification) => notification.trigeree_type === "user")
//       .map((notification) => BigInt(`${notification.trigeree_id}`));

//     // Fetch user names
//     const users = await prisma.users.findMany({
//       where: { id: { in: userTrigerees } },
//       select: { id: true, name: true },
//     });

//     // Get related activity IDs for comments and likes
//     const commentAndLikeNotifications = notifications.filter(
//       n => n.notification_type === "comment" || n.notification_type === "like"
//     );

//     // Fetch related activity IDs and types
//     const activityData = await prisma.activity_comments.findMany({
//       where: {
//         added_by: { in: commentAndLikeNotifications.map(n => BigInt(n.trigeree_id)) }
//       },
//       select: {
//         activity_id: true,
//         added_by: true,
//         activities: {
//           select: {
//             is_event: true
//           }
//         }
//       }
//     });

//     const activityLikes = await prisma.activity_likes.findMany({
//       where: {
//         added_by: { in: commentAndLikeNotifications.map(n => BigInt(n.trigeree_id)) }
//       },
//       select: {
//         activity_id: true,
//         added_by: true,
//         activities: {
//           select: {
//             is_event: true
//           }
//         }
//       }
//     });

//     // Create lookup maps
//     const userMap = Object.fromEntries(users.map((user) => [user.id, user.name]));
//     const commentActivityMap = Object.fromEntries(
//       activityData.map(data => [
//         data.added_by.toString(),
//         {
//           id: data.activity_id.toString(),
//           type: data.activities.is_event ? 'event' : 'post'
//         }
//       ])
//     );
//     const likeActivityMap = Object.fromEntries(
//       activityLikes.map(data => [
//         data.added_by.toString(),
//         {
//           id: data.activity_id.toString(),
//           type: data.activities.is_event ? 'event' : 'post'
//         }
//       ])
//     );

//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

//     // Process notifications with activity IDs and types
//     const processedNotifications = notifications.map((notification) => {
//       let meaningful_text = "";
//       let activity_id: string | undefined;
//       let activity_type: 'event' | 'post' | undefined;

//       switch (notification.notification_type) {
//         case "message":
//           meaningful_text = `${userMap[`${notification.trigeree_id}`]} sent a message`;
//           break;
//         case "comment":
//           meaningful_text = `${userMap[`${notification.trigeree_id}`]} commented on the activity`;
//           const commentActivity = commentActivityMap[notification.trigeree_id.toString()];
//           if (commentActivity) {
//             activity_id = commentActivity.id;
//             activity_type = commentActivity.type;
//           }
//           break;
//         case "like":
//           meaningful_text = `${userMap[`${notification.trigeree_id}`]} liked the activity`;
//           const likeActivity = likeActivityMap[notification.trigeree_id.toString()];
//           if (likeActivity) {
//             activity_id = likeActivity.id;
//             activity_type = likeActivity.type;
//           }
//           break;
//         case "join_request_voting":
//           meaningful_text = `${userMap[`${notification.trigeree_id}`]} requested to Join:`;
//           break;
//         case "join_request_accepted":
//           meaningful_text = `You got accepted into group:`;
//           break;
//       }

//       return {
//         ...notification,
//         row_id: notification.row_id.toString(),
//         recipient_id: notification.recipient_id.toString(),
//         trigeree_id: notification.trigeree_id.toString(),
//         title: notification.title,
//         activity_id,
//         activity_type,
//         media_thumbnail: notification.media_thumbnail
//           ? notification.media_thumbnail.split(",").map((thumbnail) => `${baseUrl}/api/images/${thumbnail.trim()}`)[0]
//           : "",
//         meaningful_text,
//       };
//     });

//     // Group notifications
//     const groupedNotifications: GroupedNotifications = {
//       message: processedNotifications.filter((n) => n.notification_type === "message"),
//       comment: processedNotifications.filter((n) => n.notification_type === "comment"),
//       like: processedNotifications.filter((n) => n.notification_type === "like"),
//       activity_join: processedNotifications.filter((n) =>
//         ["join_request_voting", "join_request_accepted"].includes(n.notification_type)
//       ),
//     };

//     return NextResponse.json(groupedNotifications);
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
//   }
// }







import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

interface Notification {
  row_id: string;
  recipient_id: string;
  recipient_type: string;
  trigeree_id: string;
  trigeree_type: string;
  notification_type: string;
  media_thumbnail: string;
  notification_timestamp: Date;
  title: string;
  meaningful_text: string;
  activity_id?: string;
  activity_type?: 'event' | 'post';
}

interface GroupedNotifications {
  message: Notification[];
  comment: Notification[];
  like: Notification[];
  activity_join: Notification[];
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const user_id = BigInt(token.user.id);

    // Fetch notifications
    const allNotifications = await prisma.activity_notifications.findMany({
      where: {
        recipient_id: user_id,
        recipient_type: "user",
        OR: [{ trigeree_type: "activity" }, { trigeree_type: "user", trigeree_id: { not: user_id } }],
      },
      orderBy: { notification_timestamp: "desc" },
    });

    // Deduplicate notifications - this fixes the multiple notifications issue
    const uniqueNotifications = {};
    for (const notification of allNotifications) {
      // Create a unique key for each notification by relevant attributes
      const timestamp = new Date(notification.notification_timestamp).getTime();
      const roundedTimestamp = Math.floor(timestamp / 1000) * 1000; // Round to nearest second
      
      const key = `${notification.notification_type}_${notification.trigeree_id}_${notification.trigeree_type}_${roundedTimestamp}_${notification.title}`;
      
      // Only keep one notification per key (first one encountered)
      if (!uniqueNotifications[key]) {
        uniqueNotifications[key] = notification;
      }
    }

    // Convert back to array
    const notifications = Object.values(uniqueNotifications);

    // Get user trigerees for names
    const userTrigerees = notifications
      .filter((notification) => notification.trigeree_type === "user")
      .map((notification) => BigInt(`${notification.trigeree_id}`));

    // Fetch user names
    const users = await prisma.users.findMany({
      where: { id: { in: userTrigerees } },
      select: { id: true, name: true },
    });

    // Get related activity IDs for comments and likes
    const commentAndLikeNotifications = notifications.filter(
      n => n.notification_type === "comment" || n.notification_type === "like"
    );

    // Fetch related activity IDs and types
    const activityData = await prisma.activity_comments.findMany({
      where: {
        added_by: { in: commentAndLikeNotifications.map(n => BigInt(n.trigeree_id)) }
      },
      select: {
        activity_id: true,
        added_by: true,
        activities: {
          select: {
            is_event: true
          }
        }
      }
    });

    const activityLikes = await prisma.activity_likes.findMany({
      where: {
        added_by: { in: commentAndLikeNotifications.map(n => BigInt(n.trigeree_id)) }
      },
      select: {
        activity_id: true,
        added_by: true,
        activities: {
          select: {
            is_event: true
          }
        }
      }
    });

    // Create lookup maps
    const userMap = Object.fromEntries(users.map((user) => [user.id, user.name]));
    const commentActivityMap = Object.fromEntries(
      activityData.map(data => [
        data.added_by.toString(),
        {
          id: data.activity_id.toString(),
          type: data.activities.is_event ? 'event' : 'post'
        }
      ])
    );
    const likeActivityMap = Object.fromEntries(
      activityLikes.map(data => [
        data.added_by.toString(),
        {
          id: data.activity_id.toString(),
          type: data.activities.is_event ? 'event' : 'post'
        }
      ])
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Process notifications with activity IDs and types
    const processedNotifications = notifications.map((notification) => {
      let meaningful_text = "";
      let activity_id: string | undefined;
      let activity_type: 'event' | 'post' | undefined;

      switch (notification.notification_type) {
        case "message":
          meaningful_text = `${userMap[`${notification.trigeree_id}`]} sent a message`;
          break;
        case "comment":
          meaningful_text = `${userMap[`${notification.trigeree_id}`]} commented on the activity`;
          const commentActivity = commentActivityMap[notification.trigeree_id.toString()];
          if (commentActivity) {
            activity_id = commentActivity.id;
            activity_type = commentActivity.type;
          }
          break;
        case "like":
          meaningful_text = `${userMap[`${notification.trigeree_id}`]} liked the activity`;
          const likeActivity = likeActivityMap[notification.trigeree_id.toString()];
          if (likeActivity) {
            activity_id = likeActivity.id;
            activity_type = likeActivity.type;
          }
          break;
        case "join_request_voting":
          meaningful_text = `${userMap[`${notification.trigeree_id}`]} requested to Join:`;
          break;
        case "join_request_accepted":
          meaningful_text = `You got accepted into group:`;
          break;
      }

      return {
        ...notification,
        row_id: notification.row_id.toString(),
        recipient_id: notification.recipient_id.toString(),
        trigeree_id: notification.trigeree_id.toString(),
        title: notification.title,
        activity_id,
        activity_type,
        media_thumbnail: notification.media_thumbnail
          ? notification.media_thumbnail.split(",").map((thumbnail) => `${baseUrl}/api/images/${thumbnail.trim()}`)[0]
          : "",
        meaningful_text,
      };
    });

    // Group notifications
    const groupedNotifications: GroupedNotifications = {
      message: processedNotifications.filter((n) => n.notification_type === "message"),
      comment: processedNotifications.filter((n) => n.notification_type === "comment"),
      like: processedNotifications.filter((n) => n.notification_type === "like"),
      activity_join: processedNotifications.filter((n) =>
        ["join_request_voting", "join_request_accepted"].includes(n.notification_type)
      ),
    };

    return NextResponse.json(groupedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}