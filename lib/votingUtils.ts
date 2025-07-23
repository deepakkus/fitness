// File: /lib/votingUtils.ts
import prisma from "@/lib/prisma";


/**
 * Processes votes for join requests in 'voting' status for a given activity.
 * @param {string} activityId - The ID of the activity.
 */
export async function processVotes(activityId: string) {
    try {
      // Get activity details
      const activity = await prisma.activities.findUnique({
        where: { id: BigInt(activityId) },
      });

      if (!activity) {
        console.error(`Activity with ID ${activityId} not found.`);
        return;
      }

      // Get current participants count
      const currentParticipants = await prisma.activity_members.count({
        where: { activity_id: BigInt(activityId) },
      });

      const maxParticipants = activity.max_participants || Number.MAX_SAFE_INTEGER;
      const remainingSlots = maxParticipants - currentParticipants;

      // Get join requests in 'voting' status
      const votingRequests = await prisma.activity_join_requests.findMany({
        where: {
          activity_id: BigInt(activityId),
          status: "voting",
        },
        include: {
          votes: true,
        },
      });

      // Rank requests based on votes and created_at
      const rankedRequests = votingRequests
        .map((req) => ({
          ...req,
          voteCount: req.votes.length,
        }))
        .sort((a, b) => {
          if (b.voteCount !== a.voteCount) {
            return b.voteCount - a.voteCount; // Sort by vote count
          } else {
            // Sort by the 'created_at' date if votes are tied
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          }
        });

      // Accept requests up to remaining slots
      for (let i = 0; i < rankedRequests.length; i++) {
        const req = rankedRequests[i];

        if (i < remainingSlots) {
          // Accept the request
          await prisma.activity_join_requests.update({
            where: { id: req.id },
            data: {
              status: "accepted",
              comments: "Request accepted: you have been added to the activity.",
            },
          });

          // Add user to activity_members
          await prisma.activity_members.create({
            data: {
              activity_id: BigInt(activityId),
              user_id: req.user_id,
              added_by: null,
            },
          });
        } else {
          // Reject the request
          await prisma.activity_join_requests.update({
            where: { id: req.id },
            data: {
              status: "rejected",
              comments: "Request rejected: insufficient votes or no available slots.",
            },
          });
        }
      }
    } catch (error) {
      console.error(`Error processing votes for activity ID ${activityId}:`, error);
    }
  }