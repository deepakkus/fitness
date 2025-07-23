/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

//at present route- not used - gets every single activity - in object suitable to be rendered by either postCard/eventCard Components (Landing Page needs - activity_type_id based filtering which can be found inside the [activity_type_id] folder) // not protected public route - add middleware or token based

//app/api/activities/[activity_type_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
export async function GET(request: NextRequest, { params }: { params: { activity_type_id: string } }) {
  const { activity_type_id } = params;
  if (!activity_type_id) {
    return NextResponse.json({ error: "Params Missing activity_type_id" }, { status: 401 });
  }
  // Uncomment to make this a protected Route
  /*
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token  ||  !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
*/
  try {
    const activitiesWithInterestCount = await prisma.activities.findMany({
      where: { activity_type_id: BigInt(activity_type_id) },
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const activityData = activitiesWithInterestCount.map((item) => {
      const images = item.activity_media.map((media) => {
        return { url: `${baseUrl}/api/images/${media.name}` };
      });
      const city = item.location.split("city: ")[1].split(", zip")[0];
      const zip = item.location.split("zip: ")[1];
      return {
        id: parseInt(item.id.toString()),
        title: item.title,
        sub_title: item.sub_title,
        age_group: item.age_group,
        is_event: item.is_event,
        available_spots: `${item.max_participants ? item.max_participants - item._count.activity_members : "∞"}`,
        zip: zip,
        added_by: item.users.name,
        activity_type_id: item.activity_type_id,
        created_at: item.created_at,
        start_time: item.start_time,
        images: images,
        peopleInterested: item._count.activity_members,
      };
    });
    const responseData = { items: activityData.length, type: "activity", data: activityData };
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

/**
 * @swagger
 * /api/activities:
 * get:
 * description: Get a list of activities for the authenticated user
 * responses:
 * 200:
 * description: Returns a list of activities
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * items:
 * type: number
 * type:
 * type: string
 * data:
 * type: array
 * items:
 * type: object
 * properties:
 * id:
 * type: number
 * title:
 * type: string
 * sub_title:
 * type: string
 * description:
 * type: string
 * activity_type_id:
 * type: number
 * start_time:
 * type: string
 * format: date-time
 * end_time:
 * type: string
 * format: date-time
 * max_participants:
 * type: number
 * rules:
 * type: string
 * contact_info:
 * type: string
 * url:
 * type: string
 * is_event:
 * type: boolean
 * is_active:
 * type: boolean
 * added_by:
 * type: number
 * created_at:
 * type: string
 * format: date-time
 * updated_at:
 * type: string
 * format: date-time
 * peopleInterested:
 * type: number
 * city:
 * type: string
 * zip:
 * type: string
 * images:
 * type: array
 * items:
 * type: object
 * properties:
 * url:
 * type: string
 * 401:
 * description: Unauthorized
 * 500:
 * description: Internal Server Error
 */
