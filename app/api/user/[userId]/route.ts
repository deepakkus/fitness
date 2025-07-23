/* eslint-disable prefer-const */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ error: "Params Missing userID" }, { status: 401 });
  }
  const user_id = BigInt(userId);

  try {
    const user = await prisma.users.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        email: true,
        profile_picture: true,
        location: true,
        about_me: true,
        age_group: true,
        deleted_at: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const postsCount = await prisma.activities.count({
      where: { added_by: user_id, is_event: false },
    });

    const eventsCount = await prisma.activities.count({
      where: { added_by: user_id, is_event: true },
    });

    // Fetch the followers and following counts from the user_followers table
    const followersCount = await prisma.user_followers.count({
      where: {
        followee_id: user_id,
      },
    });

    const followingCount = await prisma.user_followers.count({
      where: {
        follower_id: user_id,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const responseData = {
      id: user.id.toString(),
      name: `${user.name}`,
      email: user.email,
      profile_pic: user.profile_picture ? `${baseUrl}/api/images/${user.profile_picture}` : "",
      location: `${user.location}`,
      about_me: `${user.about_me}`,
      age_group: `${user.age_group}`,
      deleted_at: user.deleted_at,
      _count: {
        Followers: Number(followersCount),
        Following: Number(followingCount),
        Post: Number(postsCount),
        Events: Number(eventsCount),
      },
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    logger.error(`Error fetching user profile:${error}`);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
