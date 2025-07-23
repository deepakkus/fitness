// // app/api/activity_join/[activityId]/is-member/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import prisma from "@/lib/prisma";

// interface ActivityStatus {
//   isMember: boolean;
//   isStarted: boolean; 
//   isEnded: boolean; 
//   isAlreadyRequested: boolean;
//   isFull: boolean;
// }

// export async function GET(request: NextRequest, { params }: { params: { activityId: string } }): Promise<NextResponse<ActivityStatus>> {
//   try {
//     const { activityId } = params;
//     const activity_id = BigInt(activityId);

//     const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

//     let isMember = false;
//     let isAlreadyRequested = false;
//     let userId: bigint | undefined;

//     if (token && token.user && token.user.id) {
//       userId = BigInt(token.user.id);
//       const member = await prisma.activity_members.findFirst({
//         where: {
//           activity_id: activity_id,
//           user_id: userId,
//         },
//       });
//       isMember = !!member;
//     }

//     const activity = await prisma.activities.findUnique({
//         where: { id: activity_id },
//     });

//     if (!activity) {
//       return NextResponse.json({ isMember: false, isStarted: false, isEnded: false, isAlreadyRequested: false }, { status: 404 });
//     }

//     const now = new Date();
//     const isStarted = activity.start_time ? new Date(activity.start_time) <= now : false;
//     const isEnded = activity.end_time ? new Date(activity.end_time) <= now : false;

//     // Check if the user has already sent a join request for this activity
//     if (userId) {
//       const existingJoinRequest = await prisma.activity_join_requests.findFirst({
//         where: {
//           activity_id: activity_id,
//           user_id: userId,
//         },
//       });
//       isAlreadyRequested = !!existingJoinRequest;
//     }

    
//     return NextResponse.json({ isMember, isStarted, isEnded, isAlreadyRequested });
//   } catch (error) {
//     console.error("Error checking activity status:", error);
//     return NextResponse.json({ isMember: false, isStarted: false, isEnded: false, isAlreadyRequested: false }, { status: 500 });
//   }
// }


// app/api/activity_join/[activityId]/is-member/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

interface ActivityStatus {
  isMember: boolean;
  isStarted: boolean;
  isEnded: boolean;
  isAlreadyRequested: boolean;
  isFull: boolean; // Add isFull to the interface
}

export async function GET(request: NextRequest, { params }: { params: { activityId: string } }): Promise<NextResponse<ActivityStatus>> {
  try {
    const { activityId } = params;
    const activity_id = BigInt(activityId);

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    let isMember = false;
    let isAlreadyRequested = false;
    let userId: bigint | undefined;
    let isFull = false; // Initialize isFull

    if (token && token.user && token.user.id) {
      userId = BigInt(token.user.id);
      const member = await prisma.activity_members.findFirst({
        where: {
          activity_id: activity_id,
          user_id: userId,
        },
      });
      isMember = !!member;
    }

    const activity = await prisma.activities.findUnique({
      where: { id: activity_id },
      include: {
        _count: {
          select: {
            activity_members: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ isMember: false, isStarted: false, isEnded: false, isAlreadyRequested: false, isFull: false }, { status: 404 });
    }

    const now = new Date();
    const isStarted = activity.start_time ? new Date(activity.start_time) <= now : false;
    const isEnded = activity.end_time ? new Date(activity.end_time) <= now : false;

    // Check if the user has already sent a join request for this activity
    if (userId) {
      const existingJoinRequest = await prisma.activity_join_requests.findFirst({
        where: {
          activity_id: activity_id,
          user_id: userId,
        },
      });
      isAlreadyRequested = !!existingJoinRequest;
    }

    // Check if activity is full
    if (activity.max_participants && activity._count.activity_members >= activity.max_participants) {
      isFull = true;
    } else {
      isFull = false; // Explicitly set to false if not full
    }


    return NextResponse.json({ isMember, isStarted, isEnded, isAlreadyRequested, isFull });
  } catch (error) {
    console.error("Error checking activity status:", error);
    return NextResponse.json({ isMember: false, isStarted: false, isEnded: false, isAlreadyRequested: false, isFull: false }, { status: 500 });
  }
}