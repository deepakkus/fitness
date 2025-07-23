


// // File: /app/api/process-votes/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { subDays } from 'date-fns';
// import { sendActivityAcceptanceEmail } from "@/lib/emailUtils";

// async function processVotes(activityId: string) {
//     try {
//         // Get activity details
//         const activity = await prisma.activities.findUnique({
//             where: { id: BigInt(activityId) },
//         });

//         if (!activity) {
//             console.error(`Activity with ID ${activityId} not found.`);
//             return;
//         }

//         // Get current participants count
//         const currentParticipants = await prisma.activity_members.count({
//             where: { activity_id: BigInt(activityId) },
//         });

//         // Calculate minimum votes needed (50% of current participants, rounded up)
//         const minimumVotesNeeded = Math.ceil(currentParticipants / 2);

//         const maxParticipants = activity.max_participants || Number.MAX_SAFE_INTEGER;
//         const remainingSlots = maxParticipants - currentParticipants;

//         // Get join requests in 'voting' status with user data
//         const votingRequests = await prisma.activity_join_requests.findMany({
//             where: {
//                 activity_id: BigInt(activityId),
//                 status: "voting",
//             },
//             include: {
//                 votes: true,
//             },
//         });
        
//         // Fetch user data separately for requests that will be accepted
//         const userIds = votingRequests.map(req => req.user_id);
//         const usersData = await prisma.users.findMany({
//             where: {
//                 id: {
//                     in: userIds.map(id => BigInt(id.toString()))
//                 }
//             },
//             select: {
//                 id: true,
//                 email: true,
//                 name: true
//             }
//         });
        
//         // Create a lookup map for quick access to user data
//         const userMap = new Map();
//         usersData.forEach(user => {
//             userMap.set(user.id.toString(), user);
//         });

//         // Rank requests based on votes and created_at
//         const rankedRequests = votingRequests
//             .map((req) => ({
//                 ...req,
//                 // count only 'approve' votes
//                 voteCount: req.votes.filter(vote => vote.vote_type === 'approve').length,
//             }))
//             .sort((a, b) => {
//                 if (b.voteCount !== a.voteCount) {
//                     return b.voteCount - a.voteCount; // Sort by vote count
//                 } else {
//                     // Sort by the 'created_at' date if votes are tied
//                     return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
//                 }
//             });

//         // Track accepted requests for batch processing
//         const acceptedRequests = [];

//         // Accept or reject requests based on the new criteria
//         for (let i = 0; i < rankedRequests.length; i++) {
//             const req = rankedRequests[i];

//             if (i < remainingSlots && req.voteCount >= minimumVotesNeeded) {
//                 // Accept the request
//                 await prisma.activity_join_requests.update({
//                     where: { id: req.id },
//                     data: {
//                         status: "accepted",
//                         comments: `Request accepted: you have been added to the activity with ${req.voteCount} votes. Minimum votes required: ${minimumVotesNeeded}`,
//                     },
//                 });

//                 // Add user to activity_members
//                 await prisma.activity_members.create({
//                     data: {
//                         activity_id: BigInt(activityId),
//                         user_id: req.user_id,
//                         added_by: null,
//                     },
//                 });

//                 // Get user data from our map and add to accepted requests for email sending
//                 const userData = userMap.get(req.user_id.toString());
//                 if (userData) {
//                     acceptedRequests.push({
//                         userId: req.user_id,
//                         email: userData.email,
//                         name: userData.name
//                     });
//                 } else {
//                     console.warn(`User data not found for user_id ${req.user_id} when accepting request`);
//                 }
//             } else {
//                 // Check the vote cycle count
//                 if (req.vote_cycle_count && req.vote_cycle_count >= 3) {
//                     // Reject the request if it has been in voting for 3 cycles
//                     await prisma.activity_join_requests.update({
//                         where: { id: req.id },
//                         data: {
//                             status: "rejected",
//                             comments: `Request rejected: insufficient votes (${req.voteCount}/${minimumVotesNeeded} required) after 3 voting cycles`,
//                         },
//                     });
//                 } else {
//                     // Increment the vote_cycle_count if not rejected yet
//                     await prisma.activity_join_requests.update({
//                         where: { id: req.id },
//                         data: {
//                             vote_cycle_count: (req.vote_cycle_count || 0) + 1,
//                             comments: `Request in voting: (${req.voteCount}/${minimumVotesNeeded} required), has been in cycle ${(req.vote_cycle_count || 0) + 1}`,
//                         },
//                     });
//                 }
//             }
//         }

//         // Send acceptance emails asynchronously (don't wait for completion)
//         if (acceptedRequests.length > 0) {
//             // Use Promise.allSettled to handle all email sending operations
//             // without blocking the main process if some emails fail
//             Promise.allSettled(
//                 acceptedRequests.map(user => 
//                     sendActivityAcceptanceEmail(
//                         user.email,
//                         user.name,
//                         {
//                             title: activity.title,
//                             location: activity.location,
//                             startTime: activity.start_time,
//                             endTime: activity.end_time,
//                             description: activity.description
//                         }
//                     )
//                 )
//             ).then(results => {
//                 const successful = results.filter(r => r.status === 'fulfilled').length;
//                 const failed = results.filter(r => r.status === 'rejected').length;
                
//                 if (failed > 0) {
//                     console.warn(`Sent ${successful} acceptance emails, ${failed} failed`);
//                 } else {
//                     console.log(`Successfully sent ${successful} acceptance emails`);
//                 }
//             });
//         }

//         // Update vote_processed_at after processing votes for the activity
//         await prisma.activities.update({
//             where: { id: BigInt(activityId) },
//             data: {
//                 vote_processed_at: new Date(),
//                 voting_cycle_count: (activity.voting_cycle_count || 0) + 1,
//             },
//         });
//     } catch (error) {
//         console.error(`Error processing votes for activity ID ${activityId}:`, error);
//     }
// }

// export async function GET() {
//     try {
//         // Fetch all activities which need processing based on your logic
//         const activitiesToProcess = await prisma.activities.findMany({
//             where: {
//                 is_active: true,
//                 start_time: { gt: new Date() },
//             },
//             // Include join requests with a status of "voting"
//             include: {
//                 activity_join_requests: {
//                     where: {
//                         status: "voting",
//                     },
//                 },
//             },
//         });

//         const filteredActivities = activitiesToProcess.filter((activity) => {
//             let currentTime = new Date();
//             const hasVotingRequests = activity.activity_join_requests.length > 0;
//             const cycleDuration = activity.voting_cycle_duration ?? 1; 
//             const voteCycleElapsed = !activity.vote_processed_at || 
//                 new Date(activity.vote_processed_at).getTime() <= (currentTime.getTime() - cycleDuration * 60 * 1000);

//             // Calculate cutoff time using stored voting_cutoff_interval
//             let cutoffTime = activity.voting_cutoff_interval !== null && activity.voting_cutoff_interval > 0
//                 ? subDays(new Date(activity.start_time), activity.voting_cutoff_interval)
//                 : new Date(activity.start_time);

//             const isBeforeCutoff = currentTime < cutoffTime;

//             const shouldProcessVotes = voteCycleElapsed && isBeforeCutoff;

//             return hasVotingRequests && shouldProcessVotes;
//         });

//         if (filteredActivities.length === 0) {
//             return NextResponse.json({ message: "No activities require vote processing at the moment." }, { status: 200 });
//         }

//         // Process votes for each activity
//         for (const activity of filteredActivities) {
//             await processVotes(String(activity.id));
//         }

//         return NextResponse.json({ message: "Vote processing completed." }, { status: 200 });
//     } catch (error) {
//         console.error("Error processing votes:", error);
//         return NextResponse.json({ error: "Failed to process votes." }, { status: 500 });
//     }
// }










// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { subDays } from 'date-fns';
// import { sendActivityAcceptanceEmail } from "@/lib/emailUtils";
// import logger from "@/lib/logger";

// export const dynamic = 'force-dynamic';

// async function processVotes(activityId: string) {
//     try {
//         // Get activity details
//         const activity = await prisma.activities.findUnique({
//             where: { id: BigInt(activityId) },
//         });

//         if (!activity) {
//             console.error(`Activity with ID ${activityId} not found.`);
//             return;
//         }

//         // Get current participants count
//         const currentParticipants = await prisma.activity_members.count({
//             where: { activity_id: BigInt(activityId) },
//         });

//         // Calculate minimum votes needed (50% of current participants, rounded up)
//         const minimumVotesNeeded = Math.ceil(currentParticipants / 2);

//         const maxParticipants = activity.max_participants || Number.MAX_SAFE_INTEGER;
//         const remainingSlots = maxParticipants - currentParticipants;

//         // Get join requests in 'voting' status with user data
//         const votingRequests = await prisma.activity_join_requests.findMany({
//             where: {
//                 activity_id: BigInt(activityId),
//                 status: "voting",
//             },
//             include: {
//                 votes: true,
//             },
//         });
//         logger.info(`voting requests: ${votingRequests}`);
//         // Fetch user data separately for requests that will be accepted
//         const userIds = votingRequests.map(req => req.user_id);
//         const usersData = await prisma.users.findMany({
//             where: {
//                 id: {
//                     in: userIds.map(id => BigInt(id.toString()))
//                 }
//             },
//             select: {
//                 id: true,
//                 email: true,
//                 name: true,
//                 profile_picture: true
//             }
//         });
        
//         // Create a lookup map for quick access to user data
//         const userMap = new Map();
//         usersData.forEach(user => {
//             userMap.set(user.id.toString(), user);
//         });

//         // Rank requests based on votes and created_at
//         const rankedRequests = votingRequests
//             .map((req) => ({
//                 ...req,
//                 // count only 'approve' votes
//                 voteCount: req.votes.filter(vote => vote.vote_type === 'approve').length,
//             }))
//             .sort((a, b) => {
//                 if (b.voteCount !== a.voteCount) {
//                     return b.voteCount - a.voteCount; // Sort by vote count
//                 } else {
//                     // Sort by the 'created_at' date if votes are tied
//                     return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
//                 }
//             });
//             logger.info(`rankedReqests: ${rankedRequests}`);
//         // Track accepted requests for batch processing
//         const acceptedRequests = [];

//         // Accept or reject requests based on the new criteria
//         for (let i = 0; i < rankedRequests.length; i++) {
//             const req = rankedRequests[i];

//             if (i < remainingSlots && req.voteCount >= minimumVotesNeeded) {
//                 // Accept the request
//                 await prisma.activity_join_requests.update({
//                     where: { id: req.id },
//                     data: {
//                         status: "accepted",
//                         comments: `Request accepted: you have been added to the activity with ${req.voteCount} votes. Minimum votes required: ${minimumVotesNeeded}`,
//                     },
//                 });

//                 // Add user to activity_members
//                 await prisma.activity_members.create({
//                     data: {
//                         activity_id: BigInt(activityId),
//                         user_id: req.user_id,
//                         added_by: null,
//                     },
//                 });

//                 // IMPORTANT: Create notification for the accepted user
//                 try {
//                     await prisma.notifications.create({
//                         data: {
//                           recipient_id: req.user_id,
//                           recipient_type: "user",
//                           triggerer_id: activity.added_by, // Keep this as the activity owner
//                           triggerer_type: "user",
//                           notification_type: "join_request_accepted", // IMPORTANT: Use this specific type instead of "activity_join"
//                           notification_key: `join_accepted_${activityId}_${req.user_id}_${Date.now()}`,
//                           metadata: JSON.stringify({
//                             title: activity.title || "",
//                             activityId: activityId,
//                             activityType: activity.is_event ? 'event' : 'post',
//                             accepted: true // Explicitly mark this as an acceptance
//                           }),
//                           media_thumbnail: null,
//                           action_url: activity.is_event ? `/event/${activityId}` : `/posts/${activityId}`,
//                           priority: 2,
//                           aggregation_key: `activity_${activityId}_join_accepted`,
//                           created_at: new Date(),
//                           updated_at: new Date(),
//                         }
//                       });
//                     // console.log(`Created acceptance notification for user ${req.user_id} in activity ${activityId}`);
//                 } catch (notificationError) {
//                     console.error(`Error creating notification for user ${req.user_id}:`, notificationError);
//                     // Continue processing even if notification creation fails
//                 }

//                 // Get user data from our map and add to accepted requests for email sending
//                 const userData = userMap.get(req.user_id.toString());
//                 if (userData) {
//                     acceptedRequests.push({
//                         userId: req.user_id,
//                         email: userData.email,
//                         name: userData.name
//                     });
//                 } else {
//                     console.warn(`User data not found for user_id ${req.user_id} when accepting request`);
//                 }
//             } else {
//                 // Check the vote cycle count
//                 if (req.vote_cycle_count && req.vote_cycle_count >= 3) {
//                     // Reject the request if it has been in voting for 3 cycles
//                     await prisma.activity_join_requests.update({
//                         where: { id: req.id },
//                         data: {
//                             status: "rejected",
//                             comments: `Request rejected: insufficient votes (${req.voteCount}/${minimumVotesNeeded} required) after 3 voting cycles`,
//                         },
//                     });
//                 } else {
//                     // Increment the vote_cycle_count if not rejected yet
//                     await prisma.activity_join_requests.update({
//                         where: { id: req.id },
//                         data: {
//                             vote_cycle_count: (req.vote_cycle_count || 0) + 1,
//                             comments: `Request in voting: (${req.voteCount}/${minimumVotesNeeded} required), has been in cycle ${(req.vote_cycle_count || 0) + 1}`,
//                         },
//                     });
//                 }
//             }
//         }

//         // Send acceptance emails asynchronously (don't wait for completion)
//         if (acceptedRequests.length > 0) {
//             // Use Promise.allSettled to handle all email sending operations
//             // without blocking the main process if some emails fail
//             Promise.allSettled(
//                 acceptedRequests.map(user => 
//                     sendActivityAcceptanceEmail(
//                         user.email,
//                         user.name,
//                         {
//                             title: activity.title,
//                             location: activity.location,
//                             startTime: activity.start_time,
//                             endTime: activity.end_time,
//                             description: activity.description
//                         }
//                     )
//                 )
//             ).then(results => {
//                 const successful = results.filter(r => r.status === 'fulfilled').length;
//                 const failed = results.filter(r => r.status === 'rejected').length;
                
//                 if (failed > 0) {
//                     console.warn(`Sent ${successful} acceptance emails, ${failed} failed`);
//                 } else {
//                     // console.log(`Successfully sent ${successful} acceptance emails`);
//                 }
//             });
//         }

//         // Update vote_processed_at after processing votes for the activity
//         await prisma.activities.update({
//             where: { id: BigInt(activityId) },
//             data: {
//                 vote_processed_at: new Date(),
//                 voting_cycle_count: (activity.voting_cycle_count || 0) + 1,
//             },
//         });
//     } catch (error) {
//         console.error(`Error processing votes for activity ID ${activityId}:`, error);
//     }
// }

// export async function GET() {
     
//     try {
//         // Fetch all activities which need processing based on your logic
//         const activitiesToProcess = await prisma.activities.findMany({
//             where: {
//                 is_active: true,
//                 start_time: { gt: new Date() },
//             },
//             // Include join requests with a status of "voting"
//             include: {
//                 activity_join_requests: {
//                     where: {
//                         status: "voting",
//                     },
//                 },
//             },
//         });
//         logger.info(`activities to process: ${activitiesToProcess}`);
//         const filteredActivities = activitiesToProcess.filter((activity) => {
//             let currentTime = new Date();
//             const hasVotingRequests = activity.activity_join_requests.length > 0;
//             const cycleDuration = activity.voting_cycle_duration ?? 1; 
//             const voteCycleElapsed = !activity.vote_processed_at || 
//                 new Date(activity.vote_processed_at).getTime() <= (currentTime.getTime() - cycleDuration * 60 * 1000);

//             // Calculate cutoff time using stored voting_cutoff_interval
//             let cutoffTime = activity.voting_cutoff_interval !== null && activity.voting_cutoff_interval > 0
//                 ? subDays(new Date(activity.start_time), activity.voting_cutoff_interval)
//                 : new Date(activity.start_time);

//             const isBeforeCutoff = currentTime < cutoffTime;

//             const shouldProcessVotes = voteCycleElapsed && isBeforeCutoff;

//             return hasVotingRequests && shouldProcessVotes;
//         });
//         logger.info(`filtered activities : ${filteredActivities}`);
//         if (filteredActivities.length === 0) {
//             return new NextResponse(
//                 JSON.stringify({ 
//                     message: "No activities require vote processing at the moment.",
//                     timestamp: new Date().toISOString(),
//                 }),
//                 { 
//                     status: 200,
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
//                         'Pragma': 'no-cache',
//                         'Expires': '0',
//                     }
//                 }
//             );
//         }

//         // Process votes for each activity
//         for (const activity of filteredActivities) {
//             await processVotes(String(activity.id));
//         }

//         return new NextResponse(
//             JSON.stringify({ 
//                 message: "Vote processing completed.", 
//                 processed: filteredActivities.length,
//                 timestamp: new Date().toISOString(),
//             }),
//             { 
//                 status: 200,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
//                     'Pragma': 'no-cache',
//                     'Expires': '0',
//                 }
//             }
//         );
//     } catch (error) {
//         console.error("Error processing votes:", error);
//         return new NextResponse(
//             JSON.stringify({ 
//                 error: "Failed to process votes.",
//                 timestamp: new Date().toISOString(),
//             }),
//             { 
//                 status: 500,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
//                     'Pragma': 'no-cache',
//                     'Expires': '0',
//                 }
//             }
//         );
//     }
// }






import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { subDays } from 'date-fns';
import { sendActivityAcceptanceEmail } from "@/lib/emailUtils";
import logger from "@/lib/logger";
// import { createOrUpdateNotifications } from "@/lib/notification-utils";

// Disable response caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function processVotes(activityId: string) {
    try {
        // Get activity details
        const activity = await prisma.activities.findUnique({
            where: { id: BigInt(activityId) },
        });

        if (!activity) {
            logger.error(`Activity with ID ${activityId} not found.`);
            return;
        }

        // Get current participants count
        const currentParticipants = await prisma.activity_members.count({
            where: { activity_id: BigInt(activityId) },
        });

        // Calculate minimum votes needed (50% of current participants, rounded up)
        const minimumVotesNeeded = Math.ceil(currentParticipants / 2);

        const maxParticipants = activity.max_participants || Number.MAX_SAFE_INTEGER;
        const remainingSlots = maxParticipants - currentParticipants;

        // Get join requests in 'voting' status with user data
        const votingRequests = await prisma.activity_join_requests.findMany({
            where: {
                activity_id: BigInt(activityId),
                status: "voting",
            },
            include: {
                votes: true,
            },
        });
        
        // Fetch user data separately for requests that will be accepted
        const userIds = votingRequests.map(req => req.user_id);
        const usersData = await prisma.users.findMany({
            where: {
                id: {
                    in: userIds.map(id => BigInt(id.toString()))
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
                profile_picture: true
            }
        });
        
        // Create a lookup map for quick access to user data
        const userMap = new Map();
        usersData.forEach(user => {
            userMap.set(user.id.toString(), user);
        });

        // Rank requests based on votes and created_at
        const rankedRequests = votingRequests
            .map((req) => ({
                ...req,
                // count only 'approve' votes
                voteCount: req.votes.filter(vote => vote.vote_type === 'approve').length,
            }))
            .sort((a, b) => {
                if (b.voteCount !== a.voteCount) {
                    return b.voteCount - a.voteCount; // Sort by vote count
                } else {
                    // Sort by the 'created_at' date if votes are tied
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                }
            });
        
        // Track accepted requests for batch processing
        const acceptedRequests = [];
        const rejectedRequests = [];
        const updatedRequests = [];

        // Accept or reject requests based on the criteria
        for (let i = 0; i < rankedRequests.length; i++) {
            const req = rankedRequests[i];

            if (i < remainingSlots && req.voteCount >= minimumVotesNeeded) {
                // Accept the request
                await prisma.activity_join_requests.update({
                    where: { id: req.id },
                    data: {
                        status: "accepted",
                        comments: `Request accepted: you have been added to the activity with ${req.voteCount} votes. Minimum votes required: ${minimumVotesNeeded}`,
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

                // Create notification for the accepted user
                try {
                    await prisma.notifications.create({
                        data: {
                          recipient_id: req.user_id,
                          recipient_type: "user",
                          triggerer_id: activity.added_by,
                          triggerer_type: "user",
                          notification_type: "join_request_accepted",
                          notification_key: `join_accepted_${activityId}_${req.user_id}_${Date.now()}`,
                          metadata: JSON.stringify({
                            title: activity.title || "",
                            activityId: activityId,
                            activityType: activity.is_event ? 'event' : 'post',
                            accepted: true
                          }),
                          media_thumbnail: null,
                          action_url: activity.is_event ? `/event/${activityId}` : `/posts/${activityId}`,
                          priority: 2,
                          aggregation_key: `activity_${activityId}_join_accepted`,
                          created_at: new Date(),
                          updated_at: new Date(),
                        }
                    });
                } catch (notificationError) {
                    logger.error(`Error creating notification for user ${req.user_id}:`, notificationError);
                }

                // Get user data and add to accepted requests for email sending
                const userData = userMap.get(req.user_id.toString());
                if (userData) {
                    acceptedRequests.push({
                        userId: req.user_id,
                        email: userData.email,
                        name: userData.name
                    });
                } else {
                    logger.warn(`User data not found for user_id ${req.user_id} when accepting request`);
                }
            } else {
                // Check the vote cycle count
                if (req.vote_cycle_count && req.vote_cycle_count >= 3) {
                    // Reject the request if it has been in voting for 3 cycles
                    await prisma.activity_join_requests.update({
                        where: { id: req.id },
                        data: {
                            status: "rejected",
                            comments: `Request rejected: insufficient votes (${req.voteCount}/${minimumVotesNeeded} required) after 3 voting cycles`,
                        },
                    });
                    rejectedRequests.push({
                        requestId: req.id.toString(),
                        userId: req.user_id.toString(),
                        voteCount: req.voteCount,
                        reason: "3 cycles completed"
                    });
                } else {
                    // Increment the vote_cycle_count if not rejected yet
                    const newCycleCount = (req.vote_cycle_count || 0) + 1;
                    await prisma.activity_join_requests.update({
                        where: { id: req.id },
                        data: {
                            vote_cycle_count: newCycleCount,
                            comments: `Request in voting: (${req.voteCount}/${minimumVotesNeeded} required), has been in cycle ${newCycleCount}`,
                        },
                    });
                    updatedRequests.push({
                        requestId: req.id.toString(),
                        userId: req.user_id.toString(),
                        voteCount: req.voteCount,
                        newCycleCount
                    });
                }
            }
        }

        // Send acceptance emails asynchronously
        if (acceptedRequests.length > 0) {
            Promise.allSettled(
                acceptedRequests.map(user => 
                    sendActivityAcceptanceEmail(
                        user.email,
                        user.name,
                        {
                            title: activity.title,
                            location: activity.location,
                            startTime: activity.start_time,
                            endTime: activity.end_time,
                            description: activity.description
                        }
                    )
                )
            ).then(results => {
                const successful = results.filter(r => r.status === 'fulfilled').length;
                const failed = results.filter(r => r.status === 'rejected').length;
                
                if (failed > 0) {
                    logger.warn(`Sent ${successful} acceptance emails, ${failed} failed`);
                }
            });
        }

        // Update vote_processed_at after processing votes for the activity
        await prisma.activities.update({
            where: { id: BigInt(activityId) },
            data: {
                vote_processed_at: new Date(),
                voting_cycle_count: (activity.voting_cycle_count || 0) + 1,
            },
        });
        
    } catch (error) {
        logger.error(`Error processing votes for activity ID ${activityId}:`, error);
    }
}

export async function GET(request: Request) {
    // Get request-specific information for debugging
    const url = new URL(request.url);
    const cacheBuster = url.searchParams.get('t') || 'none';

    try {
        // Fetch all activities which need processing
        const activitiesToProcess = await prisma.activities.findMany({
            where: {
                is_active: true,
                start_time: { gt: new Date() },
            },
            include: {
                activity_join_requests: {
                    where: {
                        status: "voting",
                    },
                },
            },
        });
        
        const currentTime = new Date();
        
        // Filter activities that need processing
        const filteredActivities = activitiesToProcess.filter((activity) => {
            const hasVotingRequests = activity.activity_join_requests.length > 0;
            const cycleDuration = activity.voting_cycle_duration ?? 1; 
            const voteCycleElapsed = !activity.vote_processed_at || 
                new Date(activity.vote_processed_at).getTime() <= (currentTime.getTime() - cycleDuration * 60 * 1000);

            // Calculate cutoff time using stored voting_cutoff_interval
            const cutoffTime = activity.voting_cutoff_interval !== null && activity.voting_cutoff_interval > 0
                ? subDays(new Date(activity.start_time), activity.voting_cutoff_interval)
                : new Date(activity.start_time);

            const isBeforeCutoff = currentTime < cutoffTime;

            return hasVotingRequests && voteCycleElapsed && isBeforeCutoff;
        });
        
        if (filteredActivities.length === 0) {
            // Return with cache control headers
            return new NextResponse(
                JSON.stringify({ 
                    message: "No activities require vote processing at the moment.",
                    timestamp: new Date().toISOString(),
                    cacheBuster
                }),
                { 
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    }
                }
            );
        }

        // Process votes for each activity
        const processingPromises = [];
        for (const activity of filteredActivities) {
            processingPromises.push(processVotes(String(activity.id)));
        }
        
        // Wait for all activities to be processed
        await Promise.allSettled(processingPromises);

        // Return success response
        return new NextResponse(
            JSON.stringify({ 
                message: "Vote processing completed.", 
                processed: filteredActivities.length,
                timestamp: new Date().toISOString(),
                cacheBuster
            }),
            { 
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
        );
    } catch (error) {
        logger.error("Error processing votes:", error);
        
        // Return error response
        return new NextResponse(
            JSON.stringify({ 
                error: "Failed to process votes.",
                timestamp: new Date().toISOString(),
                cacheBuster
            }),
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
        );
    }
}