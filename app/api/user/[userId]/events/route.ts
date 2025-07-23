/* eslint-disable prefer-const */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ error: "Params Missing userID" }, { status: 401 });
  }
  const user_id = BigInt(userId);

  try {
    const activitiesWithInterestCount = await prisma.activities.findMany({
      where: { added_by: user_id, is_event: true },
      include: {
        users: true, // Organizer details
        ref_activity_types: true, // Activity category and sub-category
        activity_media: true, // Media associated with the activity
        _count: {
          select: {
            activity_members: true, // Count how many people are in the activity
          },
        },
      },
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const activityData = activitiesWithInterestCount.map((item) => {
      const images = item.activity_media.map((media) => {
        return { url: `${baseUrl}/api/images/${media.name}` };
      });
      //const city = item.location.split("city: ")[1].split(", zip")[0];
      const zip = item.location.split("zip: ")[1];

      return {
        id: item.id,
        title: item.title,
        sub_title: item.sub_title,
        age_group: item.age_group,
        is_event: item.is_event,
        available_spots: item.max_participants ? item.max_participants - item._count.activity_members : "∞",
        zip: zip,
        activity_type_id: item.activity_type_id,
        added_by: item.users.name,
        created_at: item.created_at,
        start_time: item.start_time,
        end_time: item.end_time,

        images: images,
        peopleInterested: item._count.activity_members,
      };
    });

    const responseData = { items: activityData.length, type: "event", data: activityData };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error fetching events:", error);

    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
