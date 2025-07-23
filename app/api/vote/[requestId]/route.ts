// app/api/vote/[requestId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma"; // Ensure your Prisma client is configured correctly
import logger from "@/lib/logger";

export async function POST(request: NextRequest, { params }: { params: { requestId: string } }) {
  try {
    const { requestId } = params;

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = BigInt(token.user.id); // User making the request
    const { action } = await request.json(); // Expecting "approve" or "ignore"

    if (!["approve", "ignore"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // todo: Check if the group has exceeded it's participants limit.
    // Ie. if(TotalLimit - CurrentParticipants - UnprocessedUsersWithVotes == 0) Then this user can't vote

    // Check if the user has already voted on this request
    const existingVote = await prisma.votes.findFirst({
      where: {
        request_id: BigInt(requestId),
        voter_id: userId,
      },
    });

    if (existingVote) {
      // User has already voted, so we need to update the vote
      await prisma.votes.update({
        where: {
          id: existingVote.id, // Update based on the vote ID
        },
        data: {
          vote_type: action, // Change the vote type to "approve" or "ignore"
          updated_at: new Date(), // Update the timestamp to show when the change occurred
        },
      });

      return NextResponse.json({
        message: `Vote successfully updated to ${action === "approve" ? "approve" : "ignore"}`,
      });
    } else {
      // User hasn't voted yet, so we insert a new vote
      await prisma.votes.create({
        data: {
          request_id: BigInt(requestId),
          voter_id: userId,
          vote_type: action,
        },
      });

      return NextResponse.json({
        message: `Vote successfully cast as ${action === "approve" ? "approve" : "ignore"}`,
      });
    }
  } catch (error) {
    logger.error(`Error processing vote:${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
