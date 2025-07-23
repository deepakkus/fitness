// // app/api/activity_join/[activityId]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import prisma from "@/lib/prisma"; // Ensure your Prisma client is configured correctly

// export async function POST(request: NextRequest, { params }: { params: { activityId: string } }) {
//   try {
//     const { activityId } = params;
//     if (!activityId) {
//       return NextResponse.json({ error: "Params Missing activity_id" }, { status: 401 });
//     }
//     const activity_id = BigInt(activityId); // Activity ID to join

//     // Extract token from the request
//     const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

//     // Ensure the token is valid and contains the user ID
//     if (!token || !token.user || !token.user.id) {
//       return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//     }

//     const userId = BigInt(token.user.id); // ID of the user making the request

//     // Fetch activity details to check if it's in the past or full
//     const activity = await prisma.activities.findFirst({
//       where: {
//         id: activity_id,
//         deleted_at: null, // Ensure the activity is not deleted
//       },
//       include: {
//         _count: {
//           select: {
//             activity_members: true,
//           },
//         },
//       },
//     });

//     console.log("join request sended acitivity data:", activity)
//     if (!activity) {
//       return NextResponse.json({ error: "Activity not found" }, { status: 404 });
//     }

//     // Check if the activity is in the past
//     if (new Date(activity.start_time) < new Date()) {
//       return NextResponse.json({ error: "Activity has already started or ended" }, { status: 400 });
//     }

//     let type = activity.is_event ? "event" : "post ";
//     // Check if the activity has a max participants limit and if it's full
//     if (activity.max_participants && activity._count.activity_members >= activity.max_participants) {
//       return NextResponse.json({ error: `${type} is already full` }, { status: 400 });
//     }

//     // Check if the user is already a member of the activity
//     const isMember = await prisma.activity_members.findFirst({
//       where: {
//         activity_id: activity_id,
//         user_id: userId,
//       },
//     });

//     if (isMember) {
//       return NextResponse.json({ error: "You are already a member of this activity" }, { status: 400 });
//     }

//     // Check if the user has already sent a join request for this activity
//     const existingJoinRequest = await prisma.activity_join_requests.findFirst({
//       where: {
//         activity_id: activity_id,
//         user_id: userId,
//       },
//     });

//     if (existingJoinRequest) {
//       return NextResponse.json({ error: "You have already requested to join this activity" }, { status: 400 });
//     }

//     // Create the join request in the activity_join_requests table (without `added_by`)
//     const joinRequest = await prisma.activity_join_requests.create({
//       data: {
//         activity_id: activity_id,
//         user_id: userId,
//         status: "voting", // Default status is pending for join requests
//       },
//     });
// console.log("created join request for activity_join_request table", joinRequest)
//     return NextResponse.json({
//       message: "Join request successfully sent",
//       data: joinRequest,
//     });
//   } catch (error) {
//     console.error("Error processing join request:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }




// // app/api/activity_join/[activityId]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import prisma from "@/lib/prisma"; // Ensure your Prisma client is configured correctly

// export async function POST(request: NextRequest, { params }: { params: { activityId: string } }) {
//     try {
//         const { activityId } = params;
//         if (!activityId) {
//             return NextResponse.json({ error: "Params Missing activity_id" }, { status: 401 });
//         }
//         const activity_id = BigInt(activityId); // Activity ID to join

//         // Extract token from the request
//         const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

//         // Ensure the token is valid and contains the user ID
//         if (!token || !token.user || !token.user.id) {
//             return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//         }

//         const userId = BigInt(token.user.id); // ID of the user making the request

//         // Fetch activity details to check if it's in the past or full
//         const activity = await prisma.activities.findFirst({
//             where: {
//                 id: activity_id,
//                 deleted_at: null, // Ensure the activity is not deleted
//             },
//             include: {
//                 _count: {
//                     select: {
//                         activity_members: true,
//                     },
//                 },
//             },
//         });

//         if (!activity) {
//             return NextResponse.json({ error: "Activity not found" }, { status: 404 });
//         }

//         // Check if the activity is in the past
//         if (new Date(activity.start_time) < new Date()) {
//             return NextResponse.json({ error: "Activity has already started or ended" }, { status: 400 });
//         }

//         let type = activity.is_event ? "event" : "post ";
//         // Check if the activity has a max participants limit and if it's full
//         if (activity.max_participants && activity._count.activity_members >= activity.max_participants) {
//             return NextResponse.json({ error: `${type} is already full` }, { status: 400 });
//         }

//         // Check if the user is already a member of the activity
//         const isMember = await prisma.activity_members.findFirst({
//             where: {
//                 activity_id: activity_id,
//                 user_id: userId,
//             },
//         });

//         if (isMember) {
//             return NextResponse.json({ error: "You are already a member of this activity" }, { status: 400 });
//         }

//         // Check if the user has already sent a join request for this activity
//         const existingJoinRequest = await prisma.activity_join_requests.findFirst({
//             where: {
//                 activity_id: activity_id,
//                 user_id: userId,
//             },
//         });

//         if (existingJoinRequest) {
//             return NextResponse.json({ error: "You have already requested to join this activity" }, { status: 400 });
//         }

//         // Get current members count to decide on voting or auto-accept
//         const currentMemberCount = activity._count.activity_members;
//         // console.log("Current member count:", currentMemberCount);

//         let joinRequest;

//         if (currentMemberCount < 2) {
//             // Automatically accept if less than 2 members (only creator is present)
//             // console.log("Auto-accepting join request as member count is less than 2");
//             // Add user to activity_members
//             await prisma.activity_members.create({
//                 data: {
//                     activity_id: activity_id,
//                     user_id: userId,
//                     added_by: null, // or activity.added_by if you want to track who added them initially
//                 },
//             });
//             // Create the join request with "accepted" status
//             joinRequest = await prisma.activity_join_requests.create({
//                 data: {
//                     activity_id: activity_id,
//                     user_id: userId,
//                     status: "accepted",
//                     comments: "Automatically accepted as activity has less than 2 members.",
//                 },
//             });
//             // console.log("Auto-accepted join request:", joinRequest);
//             return NextResponse.json({
//                 message: "Join request automatically accepted",
//                 data: joinRequest,
//             });

//         } else {
//             // Proceed with voting if 2 or more members
//             // console.log("Initiating voting process as member count is 2 or more");
//             joinRequest = await prisma.activity_join_requests.create({
//                 data: {
//                     activity_id: activity_id,
//                     user_id: userId,
//                     status: "voting", // Status set to voting for activities with 2+ members
//                 },
//             });
//             // console.log("Created join request for voting:", joinRequest);
//             return NextResponse.json({
//                 message: "Join request successfully sent and is now in voting",
//                 data: joinRequest,
//             });
//         }


//     } catch (error) {
//         console.error("Error processing join request:", error);
//         return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//     }
// }





// // app/api/activity_join/[activityId]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import prisma from "@/lib/prisma";

// // Store in-progress join operations to prevent race conditions
// const joinOperationsInProgress = new Map();

// export async function POST(request: NextRequest, { params }: { params: { activityId: string } }) {
//     try {
//         const { activityId } = params;
//         if (!activityId) {
//             return NextResponse.json({ error: "Params Missing activity_id" }, { status: 401 });
//         }
//         const activity_id = BigInt(activityId);

//         // Extract token from the request
//         const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

//         // Ensure the token is valid and contains the user ID
//         if (!token || !token.user || !token.user.id) {
//             return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//         }

//         const userId = BigInt(token.user.id);

//         // Check if there's already a join operation in progress for this activity
//         // This helps prevent race conditions
//         const lockKey = `activity_${activityId}`;
//         if (joinOperationsInProgress.has(lockKey)) {
//             console.log(`Join operation already in progress for activity ${activityId}`);
//             return NextResponse.json({ 
//                 error: "Another join request is being processed, please try again in a moment" 
//             }, { status: 429 });
//         }

//         // Set lock
//         joinOperationsInProgress.set(lockKey, Date.now());

//         try {
//             // Fetch activity details in a transaction
//             const activity = await prisma.activities.findFirst({
//                 where: {
//                     id: activity_id,
//                     deleted_at: null,
//                 },
//                 include: {
//                     _count: {
//                         select: {
//                             activity_members: true,
//                         },
//                     },
//                 },
//             });

//             if (!activity) {
//                 return NextResponse.json({ error: "Activity not found" }, { status: 404 });
//             }

//             // Check if the activity is in the past
//             if (new Date(activity.start_time) < new Date()) {
//                 return NextResponse.json({ error: "Activity has already started or ended" }, { status: 400 });
//             }

//             let type = activity.is_event ? "event" : "post ";
//             // Check if the activity has a max participants limit and if it's full
//             if (activity.max_participants && activity._count.activity_members >= activity.max_participants) {
//                 return NextResponse.json({ error: `${type} is already full` }, { status: 400 });
//             }

//             // Use a transaction to ensure atomic operations
//             return await prisma.$transaction(async (tx) => {
//                 // Re-check member count inside transaction for accuracy
//                 const memberCount = await tx.activity_members.count({
//                     where: {
//                         activity_id: activity_id
//                     }
//                 });

//                 // Check if user is already a member - inside transaction
//                 const isMember = await tx.activity_members.findFirst({
//                     where: {
//                         activity_id: activity_id,
//                         user_id: userId,
//                     },
//                 });

//                 if (isMember) {
//                     return NextResponse.json({ error: "You are already a member of this activity" }, { status: 400 });
//                 }

//                 // Check if the user has already sent a join request - inside transaction
//                 const existingJoinRequest = await tx.activity_join_requests.findFirst({
//                     where: {
//                         activity_id: activity_id,
//                         user_id: userId,
//                     },
//                 });

//                 if (existingJoinRequest) {
//                     return NextResponse.json({ error: "You have already requested to join this activity" }, { status: 400 });
//                 }

//                 let joinRequest;

//                 if (memberCount < 2) {
//                     // Automatically accept if less than 2 members (only creator is present)
//                     console.log(`Auto-accepting join request for user ${userId} as member count is ${memberCount}`);
                    
//                     // Add user to activity_members
//                     await tx.activity_members.create({
//                         data: {
//                             activity_id: activity_id,
//                             user_id: userId,
//                             added_by: null,
//                         },
//                     });
                    
//                     // Create the join request with "accepted" status
//                     joinRequest = await tx.activity_join_requests.create({
//                         data: {
//                             activity_id: activity_id,
//                             user_id: userId,
//                             status: "accepted",
//                             comments: "Automatically accepted as activity has less than 2 members.",
//                         },
//                     });

//                     // IMPORTANT FIX: Create an acceptance notification for the user
//                     await tx.notifications.create({
//                         data: {
//                             recipient_id: userId,
//                             recipient_type: "user",
//                             triggerer_id: activity.added_by, // Activity owner
//                             triggerer_type: "user",
//                             notification_type: "join_request_accepted",
//                             notification_key: `join_accepted_${activityId}_${userId}_${Date.now()}`,
//                             metadata: JSON.stringify({
//                                 title: activity.title || "",
//                                 activityId: activityId,
//                                 activityType: activity.is_event ? 'event' : 'post',
//                                 accepted: true
//                             }),
//                             action_url: activity.is_event ? `/event/${activityId}` : `/posts/${activityId}`,
//                             priority: 2,
//                             aggregation_key: `activity_${activityId}_join_accepted`,
//                             created_at: new Date(),
//                             updated_at: new Date(),
//                         }
//                     });

//                     console.log("Auto-accepted join request created, notification sent");
//                     return NextResponse.json({
//                         message: "Join request automatically accepted",
//                         data: joinRequest,
//                     });
//                 } else {
//                     // Proceed with voting if 2 or more members
//                     console.log(`Creating voting request for user ${userId} as member count is ${memberCount}`);
//                     joinRequest = await tx.activity_join_requests.create({
//                         data: {
//                             activity_id: activity_id,
//                             user_id: userId,
//                             status: "voting",
//                         },
//                     });

//                     return NextResponse.json({
//                         message: "Join request successfully sent and is now in voting",
//                         data: joinRequest,
//                     });
//                 }
//             }, {
//                 maxWait: 5000, // Maximum time to wait for transaction
//                 timeout: 10000, // Maximum time for the transaction
//             });
//         } finally {
//             // Always release the lock, even if there's an error
//             joinOperationsInProgress.delete(lockKey);
//             console.log(`Released lock for activity ${activityId}`);
//         }
//     } catch (error) {
//         console.error("Error processing join request:", error);
//         return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//     }
// }








// app/api/activity_join/[activityId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { createOrUpdateNotifications } from "@/lib/notification-utils";

// Store in-progress join operations to prevent race conditions
const joinOperationsInProgress = new Map();

export async function POST(request: NextRequest, { params }: { params: { activityId: string } }) {
    try {
        const { activityId } = params;
        if (!activityId) {
            return NextResponse.json({ error: "Params Missing activity_id" }, { status: 401 });
        }
        const activity_id = BigInt(activityId);

        // Extract token from the request
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

        // Ensure the token is valid and contains the user ID
        if (!token || !token.user || !token.user.id) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const userId = BigInt(token.user.id);

        // Check if there's already a join operation in progress for this activity
        // This helps prevent race conditions
        const lockKey = `activity_${activityId}`;
        if (joinOperationsInProgress.has(lockKey)) {
            return NextResponse.json({ 
                error: "Another join request is being processed, please try again in a moment" 
            }, { status: 429 });
        }

        // Set lock
        joinOperationsInProgress.set(lockKey, Date.now());

        try {
            // Fetch activity details in a transaction
            const activity = await prisma.activities.findFirst({
                where: {
                    id: activity_id,
                    deleted_at: null,
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

            // Use a transaction to ensure atomic operations
            return await prisma.$transaction(async (tx) => {
                // Re-check member count inside transaction for accuracy
                const memberCount = await tx.activity_members.count({
                    where: {
                        activity_id: activity_id
                    }
                });

                // Check if user is already a member - inside transaction
                const isMember = await tx.activity_members.findFirst({
                    where: {
                        activity_id: activity_id,
                        user_id: userId,
                    },
                });

                if (isMember) {
                    return NextResponse.json({ error: "You are already a member of this activity" }, { status: 400 });
                }

                // Check if the user has already sent a join request - inside transaction
                const existingJoinRequest = await tx.activity_join_requests.findFirst({
                    where: {
                        activity_id: activity_id,
                        user_id: userId,
                    },
                });

                if (existingJoinRequest) {
                    return NextResponse.json({ error: "You have already requested to join this activity" }, { status: 400 });
                }

                let joinRequest;

                if (memberCount < 2) {
                    // Automatically accept if less than 2 members (only creator is present)
                    
                    // Add user to activity_members
                    await tx.activity_members.create({
                        data: {
                            activity_id: activity_id,
                            user_id: userId,
                            added_by: null,
                        },
                    });
                    
                    // Create the join request with "accepted" status
                    joinRequest = await tx.activity_join_requests.create({
                        data: {
                            activity_id: activity_id,
                            user_id: userId,
                            status: "accepted",
                            comments: "Automatically accepted as activity has less than 2 members.",
                        },
                    });

                    // Create acceptance notification for the user who joined
                    await createOrUpdateNotifications({
                        activityId: activityId,
                        actionType: 'join_request_accepted',
                        actorId: activity.added_by,
                        // Only include the user who joined as recipient
                        includeIds: [userId],
                        title: activity.title,
                        isEvent: activity.is_event,
                        customMetadata: { accepted: true },
                        priority: 2
                    });

                    // Also notify the activity owner that someone joined
                    if (activity.added_by.toString() !== userId.toString()) {
                        await createOrUpdateNotifications({
                            activityId: activityId,
                            actionType: 'activity_join',
                            actorId: userId,
                            // Only include the activity owner
                            includeIds: [activity.added_by],
                            title: activity.title,
                            isEvent: activity.is_event,
                            customMetadata: { autoAccepted: true }
                        });
                    }

                    return NextResponse.json({
                        message: "Join request automatically accepted",
                        data: joinRequest,
                    });
                } else {
                    // Proceed with voting if 2 or more members
                    joinRequest = await tx.activity_join_requests.create({
                        data: {
                            activity_id: activity_id,
                            user_id: userId,
                            status: "voting",
                        },
                    });

                    // Get all activity members
                    const activityMembers = await tx.activity_members.findMany({
                        where: { 
                            activity_id: activity_id,
                        },
                        select: { user_id: true }
                    });
                    
                    // Make sure activity owner is included in notifications
                    let recipientIds = activityMembers.map(member => member.user_id);
                    
                    // Add owner if not already included in members
                    if (!recipientIds.some(id => id.toString() === activity.added_by.toString())) {
                        recipientIds.push(activity.added_by);
                    }
                    
                    // Create notifications for voting (exclude the requesting user)
                    await createOrUpdateNotifications({
                        activityId: activityId,
                        actionType: 'activity_join',
                        actorId: userId,
                        excludeIds: [userId], // Exclude the user making the request
                        title: activity.title,
                        isEvent: activity.is_event,
                        customMetadata: { voting: true },
                        customActionUrl: '/requests'
                    });

                    return NextResponse.json({
                        message: "Join request successfully sent and is now in voting",
                        data: joinRequest,
                    });
                }
            }, {
                maxWait: 5000, // Maximum time to wait for transaction
                timeout: 10000, // Maximum time for the transaction
            });
        } finally {
            // Always release the lock, even if there's an error
            joinOperationsInProgress.delete(lockKey);
        }
    } catch (error) {
        console.error("Error processing join request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}