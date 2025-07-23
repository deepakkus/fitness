//fix logic for followers etc.. move this to public - since its unprotected - retract needed info for user privacy

// app/api/user/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import logger from "@/lib/logger";


export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const user_id = BigInt(token.user.id);

  try {
    const user = await prisma.users.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile_picture: true,
        location: true,
        about_me: true,
        age_group: true,
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
    const productsCount = await prisma.products.count({
      where: { userId: user_id, deleted_at: null },
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const responseData = {
      id: `${user.id.toString()}`,
      name: `${user.name}`,
      email: user.email,
      role: user.role,
      profile_pic: user.profile_picture ? `${baseUrl}/api/images/${user.profile_picture}` : "",
      location:  `${user.location}`,
      about_me: user.about_me?`${user.about_me}`:"",
      age_group: `${user.age_group}`,
      count: {
        Followers: Number(followersCount),
        Following: Number(followingCount),
        Post: Number(postsCount),
        Events: Number(eventsCount),
        Products: Number(productsCount)
      },
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    logger.error(`Error fetching user profile:${error}`);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
