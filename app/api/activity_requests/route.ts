//app/api/activity_requests/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma"; // Ensure your Prisma client is configured correctly

export async function GET(request: NextRequest) {
  // Extract the user ID from the token
  
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {

    const userId = BigInt(token.user.id); // User making the request

    //const userId = BigInt(3); // User making the request

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    // Fetch all activity IDs where the logged-in user is a member
    const userActivities = await prisma.activity_members.findMany({
      where: {
        user_id: userId,
      },
      select: {
        activity_id: true,
      },
    });
    const activityIds = userActivities.map((activity) => activity.activity_id); // Extract activity IDs

    if (activityIds.length === 0) {
      return NextResponse.json({ error: "No activities found for the user" }, { status: 404 });
    }

    // Fetch all join requests for these activities with status "voting"
    const votingRequests = await prisma.activity_join_requests.findMany({
      where: {
        activity_id: {
          in: activityIds,
        },
        status: "voting",
      },
      include: {
        users: {
          select: { name: true, profile_picture: true }, // The user who requested to join
        },
        activities: {
          select: {
            title: true,
          },
        },
        votes: {
          where: {
            voter_id: userId, // Check the logged-in user's vote on each request
          },
          select: {
            vote_type: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // console.log("voting requests", votingRequests)
    // Format the response
    const voting = votingRequests.map((votingRequest) => {
      const userVote = votingRequest.votes.length > 0 ? votingRequest.votes[0].vote_type : null; // Get the user's vote, if any

      return {
        id: `${votingRequest.id.toString()}`,
        activity_id: `${votingRequest.activity_id.toString()}`,
        user_id: `${votingRequest.user_id.toString()}`,
        user_name: `${votingRequest.users.name}`,
        group_name: votingRequest.activities.title,
        total_votes: votingRequest.votes.length, // Total number of votes cast for the request
        user_vote: userVote, // The user's vote (if exists)
        time: votingRequest.created_at,
        user_image: `${baseUrl}/api/images/${votingRequest.users.profile_picture}`,
      };
    });

    // Fetch pending requests (invites received, status is 'invited', user_id is the current user)
    const pendingRequests = await prisma.activity_join_requests.findMany({
      where: {
        user_id: userId,
        status: "invited",
      },
      include: {
        users_activity_join_requests_added_byTousers: {
          select: { id: true, name: true, profile_picture: true }, // The user who sent the invite
        },
        activities: {
          select: {
            title: true,
            is_event: true,
            start_time: true,
            max_participants: true,
            _count: { select: { activity_members: true } }, // Count of current members in the activity
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
// console.log("pendingReq", pendingRequests)
    const pending = pendingRequests.map((pendingRequest) => ({
      id: `${pendingRequest.id.toString()}`,
      activity_id: pendingRequest.activity_id,
      type: pendingRequest.activities.is_event ? "event" : "posts",
      user_id: `${pendingRequest.users_activity_join_requests_added_byTousers?.id.toString()}`,
      user_name: pendingRequest.users_activity_join_requests_added_byTousers?.name,
      group_name: pendingRequest.activities.title,
      membership_count:
        pendingRequest.activities.max_participants ?
          `${pendingRequest.activities._count.activity_members}/${pendingRequest.activities.max_participants}`
        : "∞",
      time: pendingRequest.created_at,
      user_image: `${baseUrl}/api/images/${pendingRequest.users_activity_join_requests_added_byTousers?.profile_picture}`,
    }));

    // Fetch accepted requests (invites sent by the user, status is 'accepted' or 'voting', added_by is the current user)
    const acceptedInvites = await prisma.activity_join_requests.findMany({
      where: {
        status: "accepted",
        OR: [
          { added_by: userId, user_id: { not: userId } }, // Invites sent by the user
          { user_id: userId, added_by: null }, // Self-requests by the user
        ],
      },
      include: {
        users: { select: { id: true, name: true, profile_picture: true } }, // Recipient of the invite or self-request
        activities: { select: { title: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const accepted = acceptedInvites.map((invite) => ({
      id: invite.id.toString(),
      user_id: `${invite.users.id.toString()}`,
      user_name: invite.users.name,
      group_name: invite.activities.title,
      accepted_at: invite.created_at,
      user_image: `${baseUrl}/api/images/${invite.users.profile_picture || "account.png"}`, // Fallback image
    }));
// console.log("accepted", accepted)
    // Fetch join requests the user sent themselves (user_id is the current user, no added_by field, meaning it's a self-request)
    const youSentRequests = await prisma.activity_join_requests.findMany({
      where: {
        user_id: userId,
        added_by: null, // Indicates it's not an invite sent by someone else
      },
      include: {
        activities: {
          select: {
            title: true,
            activity_media: {
              // Fetch media related to the activity
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
    const you_sent = youSentRequests.map((youSentRequest) => ({
      activity_name: youSentRequest.activities.title,
      image_urls: youSentRequest.activities.activity_media.map((media) => ({
        url: `${baseUrl}/api/images/${media.name}`,
      })),
      status: youSentRequest.status,
      time: youSentRequest.created_at,
    }));
    return NextResponse.json({ voting, pending, accepted, you_sent });
  } catch (error) {
    console.error("Error fetching activity join requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
