// // app/api/public/activities/[activityId]/like/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import prisma from "@/lib/prisma";

// export async function POST(request: NextRequest, { params }: { params: { activityId: string } }) {
//   const { activityId } = params;
//   const activity_id = BigInt(activityId);

//   if (!activity_id) {
//     return NextResponse.json({ error: "Params Missing activityId" }, { status: 401 });
//   }

//   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
//   if (!token || !token.user || !token.user.id) {
//     return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//   }

//   const user_id = BigInt(token.user.id);

//   try {
//     // Check if the user has disliked the activity (active dislike)
//     const existingDislike = await prisma.activity_likes.findFirst({
//       where: {
//         activity_id: activity_id,
//         added_by: user_id,
//         like_dislike: false,
//         deleted_at: null, // Only active dislikes
//       },
//     });

//     // Soft-delete the dislike if it exists
//     if (existingDislike) {
//       await prisma.activity_likes.update({
//         where: { id: existingDislike.id },
//         data: { deleted_at: new Date() },
//       });
//     }

//     // Check if the user has an active like
//     const existingLike = await prisma.activity_likes.findFirst({
//       where: {
//         activity_id: activity_id,
//         added_by: user_id,
//         like_dislike: true,
//         deleted_at: null, // Only active likes
//       },
//     });

//     if (existingLike) {
//       // Soft-delete the existing like
//       await prisma.activity_likes.update({
//         where: { id: existingLike.id },
//         data: { deleted_at: new Date() },
//       });
//       return NextResponse.json({ action: "removed" });
//     } else {
//       // Check if the user has ever liked before (including soft-deleted likes)
//       const hasLikedBefore = await prisma.activity_likes.findFirst({
//         where: {
//           activity_id: activity_id,
//           added_by: user_id,
//           like_dislike: true,
//         },
//       });
//       const isFirstLike = !hasLikedBefore;

//       // Add a new like
//       await prisma.activity_likes.create({
//         data: {
//           activity_id: activity_id,
//           like_dislike: true,
//           added_by: user_id,
//         },
//       });

//       return NextResponse.json({ action: "added", isFirstLike });
//     }
//   } catch (error) {
//     console.error("Error handling like/dislike:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// export async function GET(request: NextRequest, { params }: { params: { activityId: string } }) {
//   const { activityId } = params;
//   const activity_id = BigInt(activityId);

//   if (!activity_id) {
//     return NextResponse.json({ error: "Params Missing activityId" }, { status: 400 });
//   }

//   try {
//     // Count only active likes (deleted_at: null)
//     const likeCount = await prisma.activity_likes.count({
//       where: {
//         activity_id: activity_id,
//         like_dislike: true,
//         deleted_at: null,
//       },
//     });

//     return NextResponse.json({ count: likeCount || 0 });
//   } catch (error) {
//     console.error("Error fetching like count:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }


// app/api/public/activities/[activityId]/like/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { createOrUpdateNotifications } from "@/lib/notification-utils";

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
    // Check if the user has disliked the activity (active dislike)
    const existingDislike = await prisma.activity_likes.findFirst({
      where: {
        activity_id: activity_id,
        added_by: user_id,
        like_dislike: false,
        deleted_at: null, // Only active dislikes
      },
    });

    // Soft-delete the dislike if it exists
    if (existingDislike) {
      await prisma.activity_likes.update({
        where: { id: existingDislike.id },
        data: { deleted_at: new Date() },
      });
    }

    // Check if the user has an active like
    const existingLike = await prisma.activity_likes.findFirst({
      where: {
        activity_id: activity_id,
        added_by: user_id,
        like_dislike: true,
        deleted_at: null, // Only active likes
      },
    });

    if (existingLike) {
      // Soft-delete the existing like
      await prisma.activity_likes.update({
        where: { id: existingLike.id },
        data: { deleted_at: new Date() },
      });
      return NextResponse.json({ action: "removed" });
    } else {
      // Check if the user has ever liked before (including soft-deleted likes)
      const hasLikedBefore = await prisma.activity_likes.findFirst({
        where: {
          activity_id: activity_id,
          added_by: user_id,
          like_dislike: true,
        },
      });
      const isFirstLike = !hasLikedBefore;

      // Add a new like
      await prisma.activity_likes.create({
        data: {
          activity_id: activity_id,
          like_dislike: true,
          added_by: user_id,
        },
      });

      // Get the activity to check the owner and get details
      const activity = await prisma.activities.findUnique({
        where: { id: activity_id },
        select: { 
          id: true,
          added_by: true, 
          title: true,
          is_event: true 
        }
      });
      
      if (activity) {
        // Create notifications for all members except creator and liker
        await createOrUpdateNotifications({
          activityId: activityId,
          actionType: 'like',
          actorId: user_id,
          activityCreatorId: activity.added_by,
          title: activity.title,
          isEvent: activity.is_event
        });
      }

      return NextResponse.json({ action: "added", isFirstLike });
    }
  } catch (error) {
    console.error("Error handling like/dislike:", error);
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
    // Count only active likes (deleted_at: null)
    const likeCount = await prisma.activity_likes.count({
      where: {
        activity_id: activity_id,
        like_dislike: true,
        deleted_at: null,
      },
    });

    return NextResponse.json({ count: likeCount || 0 });
  } catch (error) {
    console.error("Error fetching like count:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}