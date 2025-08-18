// /api/messages/groups/[activityId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

/**
 * @swagger
 * /api/messages/{activityId}:
 *   get:
 *     summary: Get all messages for an activity
 *     description: Retrieves all messages for a given activity, including sender details (name, profile picture), message content, and media associated with the message. Requires a valid JWT token for authentication.
 *     parameters:
 *       - name: activityId
 *         in: path
 *         required: true
 *         description: The ID of the activity to retrieve messages for.
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for user authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved all messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier for the message.
 *                       message:
 *                         type: string
 *                         description: The content of the message.
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the message was created.
 *                       sender:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: The ID of the sender.
 *                           name:
 *                             type: string
 *                             nullable: true
 *                             description: The name of the sender (nullable).
 *                           profile_picture:
 *                             type: string
 *                             nullable: true
 *                             description: The URL of the sender's profile picture (nullable).
 *                       media:
 *                         type: array
 *                         description: List of media files associated with the message.
 *                         items:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                               description: URL to access the media file.
 *       400:
 *         description: Bad request, missing activityId parameter.
 *       401:
 *         description: Unauthorized access, invalid or missing token.
 *       500:
 *         description: Internal server error, failed to retrieve messages.
 */

interface Message {
  id: string;
  message: string;
  created_at: string;
  sender: {
    id: string;
    name: string | null; // Changed to allow nullable name
    profile_picture: string | null; // Changed to allow nullable profile picture
  };
  media: {
    url: string;
  }[];
}

export async function GET(request: NextRequest, { params }: { params: { activityId: string } }) {
  const { activityId } = params;

  if (!activityId) {
    return NextResponse.json({ error: "Params Missing activityId" }, { status: 401 });
  }
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    // Query the messages table directly with proper joins
    const messages = await prisma.messages.findMany({
      where: {
        activity_id: BigInt(activityId),
        deleted_at: null, // Only get non-deleted messages
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
        message_media: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc', // Order by creation time
      },
    });

    // Obtain base URL for constructing image URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Format the messages for response
    const formattedMessages: Message[] = messages.map((message) => {
      // Format media URLs
      const media = message.message_media.map((mediaItem) => ({
        url: `${baseUrl}/api/images/${mediaItem.name}`,
      }));

      return {
        id: message.id.toString(),
        message: message.message,
        created_at: message.created_at.toISOString(),
        sender: {
          id: message.users.id.toString(),
          name: message.users.name,
          profile_picture: message.users.profile_picture 
            ? `${baseUrl}/api/images/${message.users.profile_picture}` 
            : null,
        },
        media,
      };
    });

    return NextResponse.json({ messages: formattedMessages });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: `Failed to fetch messages: ${error}` }, { status: 500 });
  }
}
