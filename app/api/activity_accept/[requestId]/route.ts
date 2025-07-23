//app/api/activity_accept/[requestId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma"; // Ensure your Prisma client is configured correctly
import { $Enums } from "@prisma/client";

async function updateJoinRequest({
  action = "rejected",
  request_id,
}: {
  action: $Enums.activity_join_requests_status;
  request_id: bigint;
}) {
  const updatedInviteRequest = await prisma.activity_join_requests.update({
    where: {
      id: request_id,
    },
    data: {
      status: action,
    },
  });
  return updatedInviteRequest;
}

export async function POST(request: NextRequest, { params }: { params: { requestId: string } }) {
  try {
    const { searchParams } = new URL(request.url);

    const { requestId } = params;

    if (!requestId) {
      return NextResponse.json({ error: "Params Missing requestId" }, { status: 401 });
    }

    const action = searchParams.get("action") || "";

    // Ensure action is provided

    if (!action || (action !== "accept" && action !== "reject")) {
      return NextResponse.json({ error: "Invalid action. Must be 'accept' or 'reject'" }, { status: 400 });
    }

    const request_id = BigInt(requestId);

    // Extract token from the request
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // Ensure the token is valid and contains the user ID
    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = BigInt(token.user.id);
    // ID of the user making the request
    // "accept" or "reject"

    // Fetch the invitation request and associated activity details using joinRequestId
    const inviteRequest = await prisma.activity_join_requests.findFirst({
      where: {
        id: request_id,
        user_id: userId, // Ensure the user making the request is the one invited
        status: "invited", // Ensure the status is invited
      },
      include: {
        activities: {
          include: {
            _count: {
              select: {
                activity_members: true,
              },
            },
          },
        },
      },
    });

    if (!inviteRequest) {
      return NextResponse.json({ error: "Invite request not found or you are not authorized" }, { status: 404 });
    }
    const activity = inviteRequest.activities;

    // Check if the activity is in the past
    if (new Date(activity.start_time) < new Date()) {
      await updateJoinRequest({ action: "rejected", request_id });

      return NextResponse.json({ error: "Activity has already started or ended" }, { status: 400 });
    }

    // Check if the activity has a max participants limit and if it's full
    if (activity.max_participants && activity._count.activity_members >= activity.max_participants) {
      await updateJoinRequest({ action: "rejected", request_id });
      return NextResponse.json({ error: "Activity is already full" }, { status: 400 });
    }

    // Process the user's response
    const newStatus: $Enums.activity_join_requests_status | null = action === "accept" ? "voting" : "rejected";
    // Update the invitation status in the activity_join_requests table

    const updatedInviteRequest = await updateJoinRequest({ action: newStatus, request_id });

    return NextResponse.json({
      message: `Invitation successfully ${action === "accept" ? "accepted" : "rejected"}`,
      data: updatedInviteRequest,
    });
  } catch (error) {
    console.error("Error processing invitation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
