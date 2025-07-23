
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
    const joinedEvents = await prisma.activities.findMany({
      where: {
        is_event: true,
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
        activity_members: true, // Include activity_members to count them
        // Include other necessary relations
      },
    });


    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const responseData = {
      items: joinedEvents.length,
      type: "events",
      data: joinedEvents.map(event => ({
        id: event.id.toString(),
        title: event.title,
        sub_title: event.sub_title,
        age_group: event.age_group,
        is_event: event.is_event,
        available_spots: event.max_participants, // Use max_participants
        zip: event.location, // Assuming location can act as zip
        activity_type_id: event.activity_type_id.toString(),
        added_by: event.added_by.toString(),
        created_at: event.created_at.toISOString(),
        start_time: event.start_time.toISOString(),
        end_time: event.end_time?.toISOString(),
        images: event.activity_media.map(media => ({ url: `${baseUrl}/api/images/${media.name}` })) || [],
        peopleInterested: event.activity_members.length, // Number of members is like interested

      })),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching joined events:", error);
    return NextResponse.json({ error: "Failed to fetch joined events" }, { status: 500 });
  }
}