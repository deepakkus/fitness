// app/api/home/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const pageSize = 5; // Number of activity TYPES per page
    const currentPage = parseInt(request?.nextUrl?.searchParams.get("page") || "1");
    const skip = (currentPage - 1) * pageSize;
    const totalActivityTypesCount = await prisma.ref_activity_types.count();
    const totalPages = Math.ceil(totalActivityTypesCount / pageSize);
    const activityTypes = await prisma.ref_activity_types.findMany({
      skip: skip,
      take: pageSize, // Now taking pageSize activity types
      select: {
        id: true,
        name: true,
        activities: {
          orderBy: {
            created_at: "desc", // Sort activities by created_at descending
          },
          select: {
            id: true,
            title: true,
            sub_title: true,
            age_group: true,
            is_event: true,
            location: true,
            start_time: true,
            end_time: true,
            is_active: true,
            users: true,
            activity_media: true,
            max_participants: true,
            activity_type_id: true,
            created_at: true,
            _count: {
              select: {
                activity_members: true,
              },
            },
          },
        },
      },
    });

    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}` || `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    const formattedActivityTypes = activityTypes.map((activityType) => {
       if (activityType.activities.length === 0) {
          return null; // Skip activity types with no activities
        }

        
      const activityData = activityType.activities.map((item) => {
        const images = item.activity_media.map((media) => {
          return { url: `${baseUrl}/api/images/${media.name}` };
        });
        
        // const city = item.location.split("city: ")[1].split(", zip")[0];

        const zip = item.location.split("zip: ")[1];
        return {
          id: item.id.toString(),
          title: item.title,
          sub_title: item.sub_title,
          age_group: item.age_group,
          is_event: item.is_event,
          available_spots: item.max_participants
            ? item.max_participants - item._count.activity_members
            : "∞",
          zip: zip,
          added_by: item.users.name,
          activity_type_id: item.activity_type_id,
          created_at: item.created_at,
          start_time: item.start_time,
          end_time: item.end_time,
          images: images,
          peopleInterested: item._count.activity_members,
        };
      });
      return {
        id: activityType.id,
        name: activityType.name,
        data: activityData,
      };
    });

    const hasNextPage = currentPage < totalPages;
    return NextResponse.json({
      status: true,
      code: 100,
      message: "Records fetched succesfully!",
      data: formattedActivityTypes,
      misc: {},
      errors: [],
      currentPage,
      hasNextPage,
      totalPages, // Include totalPages in response
    });
  } catch (error) {
    logger.error(`Error fetching activity types and activities:${error}`);
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