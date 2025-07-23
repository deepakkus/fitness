/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/messages/groups/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups for the logged-in user
 *     description: Retrieves information about all groups related to a user, including the activity title, admin details, number of members, last message details, and more. Each group corresponds to an activity.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for user authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved all group message information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       activity_id:
 *                         type: string
 *                         description: The ID of the activity (group).
 *                       activity_title:
 *                         type: string
 *                         description: The title of the activity.
 *                       activity_member_number:
 *                         type: integer
 *                         description: The number of members in the group.
 *                       activity_admin_name:
 *                         type: string
 *                         description: The name of the admin who created the activity.
 *                       activity_admin_profile_picture:
 *                         type: string
 *                         nullable: true
 *                         description: URL of the admin's profile picture.
 *                       last_message:
 *                         type: string
 *                         nullable: true
 *                         description: The last message in the group (if any).
 *                       last_message_sender_profile_picture:
 *                         type: string
 *                         nullable: true
 *                         description: URL of the profile picture of the last message sender.
 *                       last_message_time:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         description: The timestamp of the last message sent in the group (if any).
 *                       activity_media:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Comma-separated list of media URLs for the activity.
 *       401:
 *         description: Unauthorized access, invalid or missing token.
 *       500:
 *         description: Internal server error, failed to retrieve group message information.
 */

// interface Group {
//   activity_id: string;
//   title: string;
//   member_number: string;
//   created_at: Date;
//   start_time: Date;
//   admin: {
//     name: string | null;
//     profile_picture: string | null;
//   };
//   lastMessage: {
//     message: string;
//     created_at: Date | null;
//     sender: {
//       profile_picture: string | null;
//     };
//   } | null;
//   activity_media: {
//     url: string;
//   }[];
// }

// export async function GET(request: NextRequest) {
//   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

//   if (!token || !token.user || !token.user.id) {
//     return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//   }

//   const user_id = BigInt(token.user.id); // Extract user ID from token
//   try {
//     // Query the view instead of multiple tables
//     const groups = await prisma.activity_members_messages_view.findMany({
//       where: {
//         user_id: user_id, // Filter for the current user
//       },
//       orderBy: { row_id: "desc" },
//     });

//     // Obtain Next.js base URL for constructing image URLs
//     const baseUrl = process.env.APP_URL;

//     // Map the results from the view into the desired response structure

//     const formattedGroup: Group[] = groups.map((group) => {
//       // Split comma-separated media names and prepend base URL to each

//       const media =
//         group.activity_media ?
//           group.activity_media.split(",").map((name) => ({
//             url: `${baseUrl}/api/images/${name.trim()}`,
//           }))
//         : [{ url: "" }];

//       return {
//         activity_id: group.activity_id.toString(),
//         title: group.activity_title.toString(),
//         member_number: group.activity_member_number.toString(),
//         created_at: group.activity_created_at,
//         start_time: group.activity_start_time,
//         admin: {
//           name: group.activity_admin_name,
//           profile_picture:
//             group.activity_admin_profile_picture ? `${baseUrl}/api/images/${group.activity_admin_profile_picture}` : "",
//         },
//         lastMessage:
//           group.last_message ?
//             {
//               message: group.last_message,
//               created_at: group.last_message_time,
//               sender: {
//                 profile_picture:
//                   group.last_message_sender_profile_picture ?
//                     `${baseUrl}/api/images/${group.last_message_sender_profile_picture}`
//                   : "",
//               },
//             }
//           : null,
//         activity_media: media, // List of media URLs or null
//       };
//     });

//     return NextResponse.json({ groups: formattedGroup });
//   } catch (error: any) {
//     console.error("Error fetching groups:", error);
//     return NextResponse.json({ error: `Failed to fetch groups: ${error}`, }, { status: 500 });
//   }
// }



export const dynamic = 'force-dynamic';


interface Group {
  activity_id: string;
  title: string;
  member_number: string;
  created_at: Date | null;
  start_time: Date | null;
  is_event: boolean;
  admin: {
    name: string | null;
    profile_picture: string | null;
  };
  lastMessage: {
    message: string;
    created_at: Date | null;
    sender: {
      profile_picture: string | null;
    };
  } | null;
  activity_media: {
    url: string;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    // Token validation with error handling
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const user_id = BigInt(token.user.id);

    // Fetch groups with error handling
    const groups = await prisma.activity_members_messages_view.findMany({
      where: { user_id },
      orderBy: { row_id: "desc" },
    }).catch(error => {
      console.error("Error fetching groups view:", error);
      return [];
    });

    if (!groups.length) {
      return NextResponse.json({ groups: [] });
    }

    // Safely get activity IDs
    const activityIds = groups
      .map(g => g?.activity_id)
      .filter((id): id is bigint => id !== null && id !== undefined);

    // Fetch activities with error handling
    const activities = await prisma.activities.findMany({
      where: {
        id: {
          in: activityIds
        }
      },
      select: {
        id: true,
        is_event: true
      }
    }).catch(error => {
      console.error("Error fetching activities:", error);
      return [];
    });

    // Create safe activity map with default value
    const activityMap = new Map(
      activities.map(a => [a.id.toString(), !!a.is_event]) // Double bang ensures boolean
    );

    // Safe mapping function with null checks
    const formattedGroup: Group[] = groups.map((group): Group => {
      // Safely handle media
      const mediaArray = group?.activity_media 
        ? String(group.activity_media)
            .split(",")
            .filter(Boolean)
            .map(name => ({
              url: `${baseUrl}/api/images/${name.trim()}`
            }))
        : [];

      // Ensure at least one media item
      const media = mediaArray.length ? mediaArray : [{ url: "" }];

      return {
        activity_id: String(group?.activity_id || '0'),
        title: String(group?.activity_title || 'Untitled'),
        member_number: String(group?.activity_member_number || '0'),
        created_at: group?.activity_created_at || null,
        start_time: group?.activity_start_time || null,
        is_event: activityMap.get(String(group?.activity_id)) ?? false,
        admin: {
          name: group?.activity_admin_name || null,
          profile_picture: group?.activity_admin_profile_picture
            ? `${baseUrl}/api/images/${group.activity_admin_profile_picture}`
            : null,
        },
        lastMessage: group?.last_message ? {
          message: String(group.last_message),
          created_at: group?.last_message_time || null,
          sender: {
            profile_picture: group?.last_message_sender_profile_picture
              ? `${baseUrl}/api/images/${group.last_message_sender_profile_picture}`
              : null,
          },
        } : null,
        activity_media: media,
      };
    });

    return NextResponse.json({ groups: formattedGroup });

  } catch (error) {
    logger.error(`Critical error in GET groups:${error}`);
    return NextResponse.json(
      { 
        error: "An unexpected error occurred", 
        groups: [] 
      }, 
      { status: 500 }
    );
  }
}