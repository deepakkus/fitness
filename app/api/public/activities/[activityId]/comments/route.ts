// /* eslint-disable @typescript-eslint/no-unused-vars */
// // app/api/public/activities/[activityId]/like/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import prisma from "@/lib/prisma";

// /**
//  * @swagger
//  * /api/public/activities/{activityId}/like:
//  *   activity:
//  *     summary: Toggle a like for a activity (activity)
//  *     description: Toggles a like for a specific activity by a logged-in user. If a dislike exists, it will be removed before liking.
//  *     parameters:
//  *       - name: activityId
//  *         in: path
//  *         required: true
//  *         description: The ID of the activity to like
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Like added or removed successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *       401:
//  *         description: Unauthorized access
//  *       500:
//  *         description: Internal server error
//  */

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
//   const { comment, rating } = await request.json();

//   try {

//     // Check if user has already commented on this activity
//     const existingComment = await prisma.activity_comments.findFirst({
//       where: {
//         activity_id: activity_id,
//         added_by: user_id
//       }
//     });

//     if (existingComment) {
//       return NextResponse.json({ error: "You have already provided feedback for this activity" }, { status: 400 });
//     }
    
//     // If no like exists, add a new like
//     const newComment = await prisma.activity_comments.create({
//       data: {
//         activity_id: activity_id,
//         comment,
//         rating,
//         added_by: user_id,
//       },
//     });
//     if (!newComment) {
//       return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
//     }
//     const user = await prisma.users.findUnique({
//       where: { id: newComment.added_by },
//       select: {
//         id: true,
//         name: true,
//         profile_picture: true,
//       },
//     });
//     let name = "";
//     let profile_picture = "";
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

//     if (user) {
//       name = `${user?.name}`;
//       profile_picture = `${baseUrl}/api/images/${user?.profile_picture}`;
//     }

//     const commentData = {
//       id: newComment.id,
//       comment: newComment.comment,
//       rating: newComment.rating,
//       added_by: newComment.added_by,
//       name: name,
//       profile_picture: profile_picture,
//       created_at: comment.created_at,
//     };

//     return NextResponse.json({ commentData });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
//   }
// }

// /**
//  * @swagger
//  * /api/public/activities/{activityId}/like:
//  *   get:
//  *     summary: Get like count for a activity (activity)
//  *     description: Returns the total number of likes for a specific activity.
//  *     parameters:
//  *       - name: activityId
//  *         in: path
//  *         required: true
//  *         description: The ID of the activity to get the like count for
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Total like count
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 count:
//  *                   type: integer
//  *       500:
//  *         description: Internal server error
//  */
// interface Comments {
//   items: number;
//   type: string;
//   data: CommentData[];
// }

// interface CommentData {
//   id: string;
//   comment: string;
//   rating: number;
//   added_by: string;
//   name: string;
//   profile_picture: string;
//   created_at: string;
// }

// export async function GET(request: NextRequest, { params }: { params: { activityId: string } }) {
//   const { activityId } = params;
//   const activity_id = BigInt(activityId);

//   if (!activity_id) {
//     return NextResponse.json({ error: "Params Missing activityId" }, { status: 400 });
//   }

//   try {
//     // Count the number of likes (like_dislike: true) for the activity

//     const comments = await prisma.activity_comments.findMany({
//       where: {
//         activity_id: activity_id,
//       },
//       select: {
//         id: true,
//         comment: true,
//         rating: true,
//         added_by: true,
//         created_at: true,
//         users: {
//           select: {
//             id: true,
//             name: true,
//             profile_picture: true,
//           },
//         },
//       },
//     });
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

//     const commentData = comments.map((comment) => {
//       return {
//         id: comment.id,
//         comment: comment.comment,
//         rating: comment.rating,
//         added_by: comment.added_by,
//         name: comment.users?.name,
//         profile_picture: `${baseUrl}/api/images/${comment.users?.profile_picture}`,
//         created_at: comment.created_at,
//       };
//     });

//     const commentResponse = {
//       items: comments.length,
//       type: "comment",
//       commentData,
//     };

//     return NextResponse.json(commentResponse);
//   } catch (error) {
//     console.error("Error fetching like count:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }




/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/public/activities/[activityId]/comments/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { createOrUpdateNotifications } from "@/lib/notification-utils";

/**
 * @swagger
 * /api/public/activities/{activityId}/comments:
 *   post:
 *     summary: Add a comment to an activity
 *     description: Adds a new comment to a specific activity by a logged-in user
 *     parameters:
 *       - name: activityId
 *         in: path
 *         required: true
 *         description: The ID of the activity to comment on
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */

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
  const { comment, rating } = await request.json();

  // Check if user is a member of the activity
const isMember = await prisma.activity_members.findFirst({
  where: {
    activity_id: activity_id,
    user_id: user_id,
    deleted_at: null
  }
});

if (!isMember) {
  return NextResponse.json({ error: "You must be a member of this activity to comment" }, { status: 403 });
}

  try {
    // Check if user has already commented on this activity
    const existingComment = await prisma.activity_comments.findFirst({
      where: {
        activity_id: activity_id,
        added_by: user_id
      }
    });

    if (existingComment) {
      return NextResponse.json({ error: "You have already provided feedback for this activity" }, { status: 400 });
    }
    
    // Create the new comment
    const newComment = await prisma.activity_comments.create({
      data: {
        activity_id: activity_id,
        comment,
        rating,
        added_by: user_id,
      },
    });
    if (!newComment) {
      return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }

    // Get the activity details
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
      // Create notifications for all members except creator and commenter
      await createOrUpdateNotifications({
        activityId: activityId,
        actionType: 'comment',
        actorId: user_id,
        activityCreatorId: activity.added_by,
        title: activity.title,
        isEvent: activity.is_event
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: newComment.added_by },
      select: {
        id: true,
        name: true,
        profile_picture: true,
      },
    });
    let name = "";
    let profile_picture = "";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (user) {
      name = `${user?.name}`;
      profile_picture = `${baseUrl}/api/images/${user?.profile_picture}`;
    }

    const commentData = {
      id: newComment.id,
      comment: newComment.comment,
      rating: newComment.rating,
      added_by: newComment.added_by,
      name: name,
      profile_picture: profile_picture,
      created_at: comment.created_at,
    };

    return NextResponse.json({ commentData });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/public/activities/{activityId}/comments:
 *   get:
 *     summary: Get comments for an activity
 *     description: Returns all comments for a specific activity
 *     parameters:
 *       - name: activityId
 *         in: path
 *         required: true
 *         description: The ID of the activity to get comments for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *       500:
 *         description: Internal server error
 */
interface Comments {
  items: number;
  type: string;
  data: CommentData[];
}

interface CommentData {
  id: string;
  comment: string;
  rating: number;
  added_by: string;
  name: string;
  profile_picture: string;
  created_at: string;
}

export async function GET(request: NextRequest, { params }: { params: { activityId: string } }) {
  const { activityId } = params;
  const activity_id = BigInt(activityId);

  if (!activity_id) {
    return NextResponse.json({ error: "Params Missing activityId" }, { status: 400 });
  }

  try {
    const comments = await prisma.activity_comments.findMany({
      where: {
        activity_id: activity_id,
      },
      select: {
        id: true,
        comment: true,
        rating: true,
        added_by: true,
        created_at: true,
        users: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
      },
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const commentData = comments.map((comment) => {
      return {
        id: comment.id,
        comment: comment.comment,
        rating: comment.rating,
        added_by: comment.added_by,
        name: comment.users?.name,
        profile_picture: `${baseUrl}/api/images/${comment.users?.profile_picture}`,
        created_at: comment.created_at,
      };
    });

    const commentResponse = {
      items: comments.length,
      type: "comment",
      commentData,
    };

    return NextResponse.json(commentResponse);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}