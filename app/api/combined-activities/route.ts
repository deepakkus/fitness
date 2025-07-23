// app/api/combined-activities/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Step 1: Fetch all activities along with associated `ref_activity_types` data
    const activities = await prisma.activities.findMany({
      include: {
        users: true, // admin details
        ref_activity_types: true, // Activity category and sub-category
        activity_media: true, // Media associated with the activity
        _count: {
          select: {
            activity_members: true, // Count how many people are in the activity
          },
        },
      },
    });


    // Step 2: Process and group activities by `activity_type_id` and `is_event` as separate categories
    const activityMap = new Map();

    activities.forEach((activity) => {
      const activityTypeId = activity.ref_activity_types.id;
      const isEvent = activity.is_event;
      const activityTypeName =
        isEvent ? `Event / ${activity.ref_activity_types.name}` : `Post / ${activity.ref_activity_types.name}`;

      const activityKey = `${activityTypeId}_${isEvent}`; // Unique key based on type and event status

      // Initialize the category if it doesn't exist
      if (!activityMap.has(activityKey)) {
        activityMap.set(activityKey, {
          id: activityTypeId,
          name: activityTypeName,
          activities: [],
        });
      }

      // Add formatted activity to the respective category
      activityMap.get(activityKey).activities.push({
        id: parseInt(activity.id.toString()),
        title: activity.title,
        sub_title: activity.sub_title,
        age_group: activity.age_group,
        is_event: activity.is_event,
        available_spots: `${activity.max_participants ? activity.max_participants - activity._count.activity_members : "∞"}`,
        zip: activity.location.split("zip: ")[1],
        added_by: activity.users.name,
        activity_type_id: activity.activity_type_id,
        created_at: activity.created_at,
        start_time: activity.start_time,
        images: activity.activity_media.map((media: { name: string }) => ({
          url: `${`https://99fitnessfriends.vercel.app`}/api/images/${media.name}`,
        })),
        peopleInterested: activity._count.activity_members,
      });
    });

    // Step 3: Sort activities within each activity type by `created_at` (closest to present first)
    activityMap.forEach((value) => {
      value.activities.sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    // Step 4: Convert the map to an array and sort categories by activity count in descending order
    const responseData = Array.from(activityMap.values()).sort((a, b) => b.activities.length - a.activities.length);

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=1800",
      },
    });

    //  return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching activity data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
