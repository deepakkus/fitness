/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
/**
 * @swagger
 * /api/public/activities/{activityId}:
 *   get:
 *     summary: Get a post or event by activityId
 *     description:  Fetch either an event or post based on the activityId. If `event` or `post` query parameters are provided, they will filter based on `is_event`. If neither is provided, the query is based solely on `activityId`.
 *     parameters:
 *       - name: activityId
 *         in: path
 *         required: true
 *         description: The ID of the activity (either a post or an event)
 *         schema:
 *           type: string
 *       - name: event
 *         in: query
 *         required: false
 *         description: Query parameter to indicate it's an event
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: post
 *         in: query
 *         required: false
 *         description: Query parameter to indicate it's a post
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: A successful response containing the activity data (either post or event)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: integer
 *                   description: Number of activities found
 *                 type:
 *                   type: string
 *                   description: Type of the activity (post or event)
 *                   example: post
 *                 data:
 *                   type: array
 *                   description: List of activities
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The ID of the activity
 *                       title:
 *                         type: string
 *                         description: The title of the activity
 *                       sub_title:
 *                         type: string
 *                         description: The subtitle of the activity
 *                       description:
 *                         type: string
 *                         description: The description of the activity
 *                       activity_type_id:
 *                         type: string
 *                         description: The type ID of the activity
 *                       start_time:
 *                         type: string
 *                         format: date-time
 *                         description: The start time of the activity
 *                       end_time:
 *                         type: string
 *                         format: date-time
 *                         description: The end time of the activity
 *                       max_participants:
 *                         type: integer
 *                         description: The maximum number of participants for the activity
 *                       rules:
 *                         type: string
 *                         description: Rules for the activity
 *                       contact_info:
 *                         type: string
 *                         description: Contact information for the activity
 *                       url:
 *                         type: string
 *                         description: The URL associated with the activity
 *                       is_event:
 *                         type: boolean
 *                         description: Indicates if the activity is an event
 *                       is_active:
 *                         type: boolean
 *                         description: Indicates if the activity is active
 *                       added_by:
 *                         type: string
 *                         description: The ID of the user who added the activity
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the activity was created
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the activity was last updated
 *                       peopleInterested:
 *                         type: integer
 *                         description: The number of people interested in the activity
 *                       city:
 *                         type: string
 *                         description: The city where the activity is located
 *                       zip:
 *                         type: string
 *                         description: The zip code of the activity's location
 *                       images:
 *                         type: array
 *                         description: List of images related to the activity
 *                         items:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                               description: The URL of the image
 *                       comments:
 *                         type: object
 *                         description: Comments associated with the activity
 *                         properties:
 *                           items:
 *                             type: integer
 *                             description: The number of comments
 *                           type:
 *                             type: string
 *                             description: The type of the comments object (e.g., "comment")
 *                             example: comment
 *                           data:
 *                             type: array
 *                             description: List of comments
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   description: The ID of the comment
 *                                 comment:
 *                                   type: string
 *                                   description: The comment text
 *                                 rating:
 *                                   type: number
 *                                   description: The rating given by the commenter
 *                                 added_by:
 *                                   type: string
 *                                   description: The ID of the user who added the comment
 *                                 name:
 *                                   type: string
 *                                   description: The name of the commenter
 *                                 profile_picture:
 *                                   type: string
 *                                   description: The URL of the commenter's profile picture
 *                                 created_at:
 *                                   type: string
 *                                   format: date-time
 *                                   description: The timestamp when the comment was created
 *       401:
 *         description: Unauthorized request (missing or invalid credentials)
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal server error
 */


export async function GET(request: NextRequest, { params }: { params: { activityId: string } }) {
  const searchParams = request.nextUrl.searchParams;
  const isEvent = searchParams.get("event") === "1";
  const isPost = searchParams.get("post") === "1";
  const { activityId } = params;

  const activity_id = BigInt(activityId);
  if (!activity_id) {
    return NextResponse.json({ error: "Params Missing activityId" }, { status: 401 });
  }
  
  const filter: Prisma.activitiesWhereInput = { id: activity_id };

  if (isEvent) {
    filter.is_event = true;
  } else if (isPost) {
    filter.is_event = false;
  }

  try {
    // Fetch activity with participant-related data
    const activities = await prisma.activities.findMany({
      where: filter,
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
        users: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            location: true,
            about_me: true,
          },
        },
        activity_media: {
          select: {
            name: true,
          },
        },
        activity_comments: {
          select: {
            id: true,
            comment: true,
            rating: true,
            added_by: true,
            created_at: true,
            users: {
              select: {
                id: true,
                name: true,
                profile_picture: true,
              },
            },
          },
        },
        // Count confirmed participants only
        activity_members: {
          where: {
            deleted_at: null, // Only active members
          },
          select: {
            id: true,
          },
        },
        // Get join requests for additional status info
        activity_join_requests: {
          where: {
            OR: [
              { status: 'accepted' },
              { status: 'voting' },
              { status: 'pending' }
            ],
            deleted_at: null,
          },
          select: {
            id: true,
            status: true,
            user_id: true,
            // Include votes to check voting status
            votes: {
              select: {
                vote_type: true,
              },
            },
          },
        },
      },
    });

    if (!activities || activities.length === 0) {
      return NextResponse.json({ items: 0, type: "unknown", data: [] });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const activityData = activities.map((activity) => {
      const images = activity.activity_media.map((media) => ({
        url: `${baseUrl}/api/images/${media.name}`,
      }));

      const added_by_user = {
        id: activity.users.id,
        name: activity.users.name,
        profile_picture: `${baseUrl}/api/images/${activity.users.profile_picture}`,
        location: activity.users.location,
        about_me: activity.users.about_me,
      };

      const comments = {
        items: activity.activity_comments.length,
        type: "comment",
        data: activity.activity_comments.map((comment) => ({
          id: comment.id,
          comment: comment.comment,
          rating: comment.rating,
          added_by: comment.added_by,
          name: comment.users?.name,
          profile_picture: `${baseUrl}/api/images/${comment.users?.profile_picture}`,
          created_at: comment.created_at,
        })),
      };

      const city = activity.location?.split("city: ")[1]?.split(", zip")[0];
      const zip = activity.location?.split("zip: ")[1];

      // Calculate actual participants
      const confirmedParticipants = activity.activity_members.length;
      
      // Calculate pending requests
      const pendingRequests = activity.activity_join_requests.filter(
        request => request.status === 'pending' || request.status === 'voting'
      ).length;

      // Get total interested (confirmed + pending)
      const totalInterested = confirmedParticipants + pendingRequests;

      const { users, activity_media, location, activity_comments, activity_members, activity_join_requests, ...restOfActivity } = activity;

      return {
        ...restOfActivity,
        confirmedParticipants,
        pendingRequests,
        totalInterested,
        isFullyBooked: activity.max_participants ? confirmedParticipants >= activity.max_participants : false,
        city,
        zip,
        images,
        comments,
        added_by_user,
      };
    });

    const responseData = {
      items: activityData.length,
      type: activityData[0].is_event ? "event" : "post",
      data: activityData,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}



