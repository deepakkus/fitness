//app/api/activities/route.ts

//at present route- not used - gets every single activity - in object suitable to be rendered by either postCard/eventCard Components (Landing Page needs - activity_type_id based filtering which can be found inside the [activity_type_id] folder) // not protected public route - add middleware or token based

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const activitiesWithInterestCount = await prisma.activities.findMany({
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
        is_sponsored: item.is_sponsored,
        available_spots: item.max_participants ? item.max_participants - item._count.activity_members : "∞",
        zip: zip,
        activity_type_id: item.activity_type_id,
        added_by: item.users.name,
        created_at: item.created_at,
        start_time: item.start_time,
        images: images,
        peopleInterested: item._count.activity_members,
      };
    });

    return NextResponse.json(activityData);
  } catch (error) {
    console.error("Error fetching activity data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
