// app/api/home-activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import logger from "@/lib/logger";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Parse pagination params
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '8', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        // Get current user session (optional, if you need to consider user specific requests later)
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id as string; // Assuming user id is available in session

        const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}` || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const now = new Date();

        const activityTypes = await prisma.ref_activity_types.findMany({
            select: {
                id: true,
                name: true,
                activities: {
                    where: {
                        start_time: {
                            gt: now, // Activities not started yet
                        },
                        is_active: true, // Optional: only active activities
                        // Constraint: Available spots and joinable (including requested) - handled in query below for efficiency
                    },
                    orderBy: {
                        created_at: "desc",
                    },
                    take: limit,
                    skip: offset,
                    select: {
                        id: true,
                        title: true,
                        sub_title: true,
                        age_group: true,
                        is_event: true,
                        is_sponsored: true,
                        location: true,
                        start_time: true,
                        end_time: true,
                        is_active: true,
                        users: true,
                        activity_media: true,
                        max_participants: true,
                        activity_type_id: true,
                        created_at: true,
                        activity_members: true, // Load members to count
                        activity_join_requests: userId ? { // Load join requests if user is logged in
                            where: {
                                user_id: BigInt(userId), // <----- FIXED: userId to user_id
                            }
                        } : false,
                        _count: {
                            select: {
                                activity_members: true,
                            },
                        },
                    },
                },
            },
        });


        const formattedActivityTypes = activityTypes.map((activityType) => {
            if (activityType.activities.length === 0) {
                return null; // Skip activity types with no activities
            }

            const activityData = activityType.activities.map((item) => {
                const images = item.activity_media.map((media) => {
                    return { url: `${baseUrl}/api/images/${media.name}` };
                });

                const zip = item.location.split("zip: ")[1];
                const available_spots = item.max_participants ? Math.max(0, item.max_participants - item._count.activity_members) : Infinity;
                const alreadyRequested = userId ? item.activity_join_requests.length > 0 : false;


                // Filter conditions applied here after fetching (more efficient in some cases, or can be moved to Prisma where clause for more complex logic)
                if (available_spots <= 0 ) {
                    return null; // Skip full activities
                }


                return {
                    id: item.id.toString(),
                    title: item.title,
                    sub_title: item.sub_title,
                    age_group: item.age_group,
                    is_event: item.is_event,
                    is_sponsored: item.is_sponsored,
                    available_spots: item.max_participants === null ? "∞" : available_spots, // Display infinity symbol or actual spots
                    zip: zip,
                    added_by: item.users.name,
                    activity_type_id: item.activity_type_id,
                    created_at: item.created_at,
                    start_time: item.start_time,
                    end_time: item.end_time,
                    images: images,
                    peopleInterested: item._count.activity_members,
                    alreadyRequested: alreadyRequested, // Indicate if user has already requested
                };
            }).filter(activity => activity !== null); // Filter out null activities (full or not meeting criteria)


            return {
                id: activityType.id,
                name: activityType.name,
                data: activityData,
            };
        }).filter(type => type !== null && type.data.length > 0) as ActivityData[]; // Filter out null types and types with no activities after filtering;

        return NextResponse.json({
            status: true,
            code: 100,
            message: "Home page activities fetched successfully!",
            data: formattedActivityTypes,
            misc: {},
            errors: [],
        });

    } catch (error) {
        logger.error(`Error fetching home page activities:${error}`);
        return NextResponse.json({
            status: false,
            code: 500,
            message: "Internal Server Error",
            data: [],
            misc: {},
            errors: [error],
        }, { status: 500 });
    }
}