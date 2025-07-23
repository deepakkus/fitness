// app/api/post/[userId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  const user_id = BigInt(userId);
  if (!user_id) {
    return NextResponse.json({ error: "Params Missing userID" }, { status: 401 });
  }
  try {
    // **Prisma Best Practices**

    // 3. **Data Fetching:**
    // - We use Prisma's `findMany` to efficiently fetch posts created by the authenticated user.
    // - We explicitly select only the necessary fields for performance optimization.
    const posts = await prisma.activities.findMany({
      where: { added_by: user_id, is_event: false },
      select: {
        id: true,
        title: true,
        sub_title: true,
        description: true,
        activity_type_id: true,
        location: true,
        start_time: true,
        end_time: true,
        max_participants: true,
        rules: true,
        contact_info: true,
        url: true,
        is_event: true,
        is_active: true,
        added_by: true,
        created_at: true,
        updated_at: true,
        activity_media: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!posts || posts.length == 0) {
      return NextResponse.json({ items: 0, type: "post", data: [] });
    }

    // 4. **N+1 Query Problem (Partially Addressed):**
    // - Instead of fetching the count of interested users for each post in a separate query (N+1 problem),
    // we use `Promise.all` to fetch the counts concurrently for all posts.
    // - Ideally, we should further optimize this using Prisma's relation queries for better performance.
    const postsWithInterestCount = await Promise.all(
      posts.map(async (post) => {
        const interestedCount = await prisma.activity_join_requests.count({
          where: { activity_id: post.id },
        });
        return { ...post, peopleInterested: interestedCount };
      })
    );

    // **Data Transformation**

    // 5. **Image URL Generation:**
    // - Construct image URLs dynamically using the base URL and the image name.
    // 6. **Location Parsing:**
    // - Extract city and zip code from the `location` field.
    // 7. **Data Reshaping:**
    // - Remove unnecessary fields (`location`, `activity_media`) from the response.

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    // JkWorkz
    // const baseUrl = process.env.APP_URL_PORT ? process.env.APP_URL_PORT : `http://localhost:${process.env.SOCKET_PORT}`;
    // const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    const postData = await Promise.all(
      postsWithInterestCount.map((item) => {
        let images = item.activity_media.map((act_media_row) => {
          return { url: `${baseUrl}/api/images/${act_media_row.name}` };
        });
        let city = item.location.split("city: ")[1].split(", zip")[0];
        let zip = item.location.split("zip: ")[1];

        // Type assertions are used here to tell TypeScript that we know these properties exist
        // even though they are marked as optional in the Prisma schema.
        delete (item as { location?: string }).location;
        delete (item as { activity_media?: { name: string }[] }).activity_media;

        return {
          ...item,
          city,
          zip,
          images,
        };
      })
    );

    const responseData = { items: postData.length, type: "post", data: postData };

    // **API Response**

    // 8. **Response Formatting:**
    // - Return a JSON response with the processed post data.
    return NextResponse.json(responseData);
  } catch (error: any) {
    // **Error Handling**

    // 9. **Error Logging:**
    // - Log the error for debugging purposes.
    console.error("Error fetching posts:", error);

    // 10. **Error Response:**
    // - Return a 500 Internal Server Error response in case of an error.
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
