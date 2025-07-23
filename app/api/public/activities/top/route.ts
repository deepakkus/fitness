import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// /api/public/activities/top
interface ActivityData {
  id: string;
  title: string;
  is_event: boolean;
  images: {
    url: string;
  }[];
  activity_types: {
    id: string;
    name: string;
  };
  compositeScore: number;
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const searchParams = request.nextUrl.searchParams;
  const count = parseInt(searchParams.get("count") || "10", 10); // Default to 10 if not provided
  const page = parseInt(searchParams.get("page") || "1", 10); // Default to page 1
  const isEvent = searchParams.get("isEvent") === "true"; // Get the isEvent flag from query

  try {
    // Fetch activities and include the count of members, likes, and comments
    const activitiesWithInterestCount = await prisma.activities.findMany({
      where: { is_event: isEvent, is_active: true },
      take: count, // Limit the number of records per page
      skip: (page - 1) * count, // Skip records based on the current page
      orderBy: { max_participants: "desc" }, // Basic order
      include: {
        ref_activity_types: true,
        activity_media: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            activity_members: true, // Count of activity members
            activity_likes: true, // Count of activity likes
            activity_comments: true, // Count of activity comments
          },
        },
      },
    });

    // Compute composite score (members + likes + comments) and sort by it
    const activityData: ActivityData[] = activitiesWithInterestCount.map((item) => {
      const images = item.activity_media.map((media) => {
        return { url: `${baseUrl}/api/images/${media.name}` };
      });
      const activity_types = { id: item.ref_activity_types.id.toString(), name: item.ref_activity_types.name };
      // Calculate composite score (members + likes + comments)
      const compositeScore = item._count.activity_members + item._count.activity_likes + item._count.activity_comments;

      return {
        id: item.id.toString(),
        title: item.title,
        is_event: item.is_event,
        images: images,
        activity_types,
        compositeScore: compositeScore,
      };
    });

    // Sort by composite score in descending order
    activityData.sort((a, b) => b.compositeScore - a.compositeScore);

    const responseData = { items: activityData.length, type: isEvent ? "event" : "post", data: activityData };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching activity data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/public/activities/top:
 *   get:
 *     summary: Get a list of top activities (posts/events) sorted by popularity.
 *     description: Fetch a list of top activities (either posts or events) based on the number of activity members, likes, and comments. The results are sorted using a composite score (members + likes + comments). Supports pagination with `page` and `count` query parameters.
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *         description: Number of activities to fetch per page (default is 10).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default is 1).
 *       - in: query
 *         name: isEvent
 *         schema:
 *           type: boolean
 *         description: If true, fetch events. If false, fetch posts.
 *     responses:
 *       200:
 *         description: A list of activities (posts or events) sorted by popularity.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: integer
 *                   description: The number of activities returned.
 *                 type:
 *                   type: string
 *                   description: Indicates whether the fetched data is 'event' or 'post'.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The unique ID of the activity.
 *                       title:
 *                         type: string
 *                         description: The title of the activity.
 *                       is_event:
 *                         type: boolean
 *                         description: Indicates if the activity is an event.
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                               description: URL of the activity image.
 *                       compositeScore:
 *                         type: number
 *                         description: The composite score calculated by adding the number of members, likes, and comments.
 *       500:
 *         description: Internal Server Error
 */
