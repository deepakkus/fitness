// api/messages/[messageId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

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

export async function GET(request: NextRequest, { params }: { params: { messageId: string } }) {
  const { messageId } = params;

  if (!messageId) {
    return NextResponse.json({ error: "Params Missing messageId" }, { status: 401 });
  }
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    // Query the new view for messages related to the given activity
    const messages = await prisma.activity_messages_view.findMany({
      where: {
        message_id: BigInt(messageId), // Filter by activity ID
      },
    });

    // Obtain base URL for constructing image URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Format the messages for response
    const formattedMessages: Message[] = messages.map((message) => {
      // Split comma-separated media names and construct URLs
      const media =
        message.message_media_names ?
          message.message_media_names.split(",").map((name) => ({
            url: `${baseUrl}/api/images/${name.trim()}`,
          }))
        : [];

      return {
        id: message.message_id.toString(),
        message: message.message,
        created_at: message.message_created_at.toISOString(),
        sender: {
          id: message.sender_id.toString(), // Using row_id as a unique identifier for the sender (since sender id is not included in view)
          name: message.sender_name, // Nullable sender name
          profile_picture:
            message.sender_profile_picture ? `${baseUrl}/api/images/${message.sender_profile_picture}` : null,
        },
        media, // List of media URLs
      };
    });

    return NextResponse.json({ messages: formattedMessages });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: `Failed to fetch messages: ${error}` }, { status: 500 });
  }
}
