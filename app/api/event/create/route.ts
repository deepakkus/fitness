//app/api/event/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma"; // Make sure you have the Prisma client setup correctly
import { differenceInDays } from 'date-fns';
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const user_id = BigInt(token.user.id);

  try {
    const data = await request.json();
//logger.info(`Received data for creating event: ${JSON.stringify(data)}`);
    // Destructure the incoming data
    const {
      title,
      sub_title,
      description,
      activity_type_id,
      location,
	  is_sponsored,
      start_time,
      end_time,
      rules,
      contact_info,
      url,
    } = data;

    // Validation (simple example, you can extend it)
    if (!title || !activity_type_id || !location || !start_time) {
      logger.error("Missing required fields for creating event: title, activity_type_id, location, start_time");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate voting_cutoff_interval dynamically
    const startTimeDate = new Date(start_time);
    const daysUntilActivity = differenceInDays(startTimeDate, new Date());
    let voting_cutoff_interval = 0; // Default to 0 (no cutoff)

    if (daysUntilActivity > 5) {
      voting_cutoff_interval = 2; // Set to 2 days (48 hours) if more than 5 days until activity
    }

    // Create a new activity/event
    const newPost = await prisma.activities.create({
      data: {
        title,
        sub_title,
        description,
        activity_type_id: BigInt(activity_type_id),
        location,
        start_time: new Date(start_time),
        end_time: end_time ? new Date(end_time) : null,
        max_participants: null,
        voting_cycle_duration: parseInt(process.env.VOTING_CYCLE_DURATION || '1440'), // Default to 1440 minutes (24 hours)
        voting_cutoff_interval,
        vote_processed_at: new Date(),
        rules,
        contact_info,
        url,
        is_event: true, // For posts, set this to false
		is_sponsored: is_sponsored === true || is_sponsored === '1' || is_sponsored === 1,
        added_by: user_id, // Set to the logged-in user
      },
    });

    //logger.info(`Event created successfully: ${JSON.stringify(newPost)}`);

    // Check if the user is already a member of this activity
    const existingMember = await prisma.activity_members.findUnique({
      where: {
        activity_id_user_id: {
          activity_id: newPost.id,
          user_id: user_id,
        },
      },
    });

    // Only create the activity_members record if the user is not already a member
    if (!existingMember) {
      await prisma.activity_members.create({
        data: {
          activity_id: newPost.id,
          user_id: user_id,
          added_by: user_id, // Creator is adding themselves as a member
        },
      });
    } else {
      // logger.info(`User ${user_id} is already a member of activity ${newPost.id}`);
    }


    return NextResponse.json({ message: "Post created successfully", event: newPost });
  } catch (error) {
    logger.error(`Error creating event:${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
