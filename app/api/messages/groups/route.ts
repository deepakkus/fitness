/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/messages/groups/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

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
    // 🔑 Token validation
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const user_id = BigInt(token.user.id);

    // ✅ Query the view using raw SQL (no Prisma model mapping)
    const groups = await prisma.$queryRawUnsafe<any[]>(`
      SELECT *
      FROM activity_members_messages_view
      WHERE user_id = ${user_id}
      ORDER BY activity_created_at DESC
    `);

    if (!groups.length) {
      return NextResponse.json({ groups: [] });
    }

    // Get activity IDs
    const activityIds = groups
      .map(g => g?.activity_id)
      .filter((id): id is bigint => id !== null && id !== undefined);

    // Query activities for "is_event"
    const activities = await prisma.activities.findMany({
      where: { id: { in: activityIds } },
      select: { id: true, is_event: true },
    });

    const activityMap = new Map(
      activities.map(a => [a.id.toString(), !!a.is_event])
    );

    // Format response
    const formattedGroup: Group[] = groups.map((group): Group => {
      const mediaArray = group?.activity_media
        ? String(group.activity_media)
            .split(",")
            .filter(Boolean)
            .map(name => ({
              url: `${baseUrl}/api/images/${name.trim()}`
            }))
        : [];

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
    logger.error(`Critical error in GET groups: ${error}`);
    return NextResponse.json(
      { error: "An unexpected error occurred", groups: [] },
      { status: 500 }
    );
  }
}
