//app/api/activity_invite/[activityId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma"; // Ensure your Prisma client is configured correctly

export async function POST(request: NextRequest, { params }: { params: { activityId: string } }) {
  try {
    const { activityId } = params;
    if (!activityId) {
      return NextResponse.json({ error: "Params Missing activity_id" }, { status: 401 });
    }
    const activity_id = BigInt(activityId); // ID of the user making the request

    // Extract token from the request
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // Ensure the token is valid and contains the user ID
    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = BigInt(token.user.id); // ID of the user making the request
    const { invitee_id } = await request.json(); // Incoming data (activity and the person to invite)

    // Ensure invitee_id is provided
    if (!invitee_id) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    // Fetch activity details to check if it's in the past or full
    const activity = await prisma.activities.findFirst({
      where: {
        id: activity_id,
        deleted_at: null, // Ensure the activity is not deleted
      },
      include: {
        _count: {
          select: {
            activity_members: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // Check if the activity is in the past
    if (new Date(activity.start_time) < new Date()) {
      return NextResponse.json({ error: "Activity has already started or ended" }, { status: 400 });
    }

    let type = activity.is_event ? "event" : "post ";
    // Check if the activity has a max participants limit and if it's full
    if (activity.max_participants && activity._count.activity_members >= activity.max_participants) {
      return NextResponse.json({ error: `${type} is already full` }, { status: 400 });
    }

    // Check if the user making the request is a member of the activity
    const isMember = await prisma.activity_members.findFirst({
      where: {
        activity_id: BigInt(activity_id),
        user_id: userId,
      },
    });

    if (!isMember) {
      return NextResponse.json({ error: "You are not a member of this activity" }, { status: 403 });
    }

    // Check if the invitee is already a member of the activity
    const isInviteeAlreadyMember = await prisma.activity_members.findFirst({
      where: {
        activity_id: BigInt(activity_id),
        user_id: BigInt(invitee_id),
      },
    });

    if (isInviteeAlreadyMember) {
      return NextResponse.json({ error: "Invitee is already a member of this activity" }, { status: 400 });
    }

    // Check if the invitee has already been invited to this activity
    const existingInvite = await prisma.activity_join_requests.findFirst({
      where: {
        activity_id: BigInt(activity_id),
        user_id: BigInt(invitee_id),
      },
    });

    if (existingInvite) {
      return NextResponse.json({ error: "Invitee has already been invited to this activity" }, { status: 400 });
    }

    // Create the invite in the activity_join_requests table
    const joinRequest = await prisma.activity_join_requests.create({
      data: {
        activity_id: BigInt(activity_id),
        user_id: BigInt(invitee_id),
        added_by: userId,
        status: "invited",
      },
    });

    return NextResponse.json({
      message: "Invitation successfully sent",
      data: joinRequest,
    });
  } catch (error) {
    console.error("Error sending invite:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
