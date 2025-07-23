/* eslint-disable prefer-const */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

/**
 * @swagger
 * /api/posts:
 * get:
 * description: Get a list of posts for the authenticated user
 * responses:
 * 200:
 * description: Returns a list of posts
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

export async function GET(request: NextRequest) {

  // **Security and Best Practices**

  // 1. **JWT Verification:**
  // - We use `getToken` from `next-auth/jwt` to verify and decode the JWT token from the request.
  // - The `secret` is crucial for security and should be stored securely as an environment variable.
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // 2. **Authorization:**
  // - If the token is invalid, missing, or lacks necessary user information, return a 401 Unauthorized response.
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const user_id = BigInt(token.user.id);

  try {
    const activitiesWithInterestCount = await prisma.activities.findMany({
      where: { added_by: user_id, is_event: false },
      include: {
        users: true, // Organizer details
        post_payment: true,
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
        is_sponsored: item.is_sponsored,
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

    const responseData = { items: activityData.length, type: "post", data: activityData };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error fetching posts:", error);

    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}
