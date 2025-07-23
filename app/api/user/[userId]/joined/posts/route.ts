


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const { userId } = params;


  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  let id
  if(userId){
    id = BigInt(userId);
  }
  else{
      id = BigInt(token.user.id);
  }

  try {
    const joinedPosts = await prisma.activities.findMany({
      where: {
        is_event: false,
        activity_members: {
          some: {
            user_id: id,
          },
        },
      },
      include: {
        activity_media: true, // Assuming this is where your images are
        users: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
        // Include other necessary relations
      },
    });


    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const responseData = {
      items: joinedPosts.length,
      type: "posts",
      data: joinedPosts.map(post => ({
        id: post.id.toString(),
        title: post.title,
        sub_title: post.sub_title,
        age_group: post.age_group,
        is_event: post.is_event,
        available_spots: post.max_participants, // Use max_participants
        zip: post.location, // Assuming location can act as zip
        activity_type_id: post.activity_type_id.toString(),
        added_by: post.added_by.toString(),
        created_at: post.created_at.toISOString(),
        start_time: post.start_time.toISOString(),
        end_time: post.end_time?.toISOString(),
        images: post.activity_media?.map(media => {
          return media?.name ? { url: `${baseUrl}/api/images/${media.name}` } : { url: '' };
        }) || [],

    })),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching joined posts:", error);
    return NextResponse.json({ error: "Failed to fetch joined posts" }, { status: 500 });
  }
}