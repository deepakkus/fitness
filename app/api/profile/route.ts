// app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { users_age_group } from "@prisma/client";
import logger from "@/lib/logger";



export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const name = formData.get("name") as string;
    const location = formData.get("location") as string | null;
    const age_group = formData.get("age_group") as users_age_group | null;
    const about_me = formData.get("about_me") as string | null;


    // Validate required fields
    if (!username) {
      return NextResponse.json({ 
        error: `Missing required username. Received: username=${username}, name=${name}` 
      }, { 
        status: 400 
      });
    }

    // Get user ID from token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = BigInt(token.user.id);

    // Create update data object with only provided values
    const updateData: any = {
      username: username,
    };

    // Only add fields that are provided
    if (name !== null && name !== undefined) updateData.name = name;
    if (location) updateData.location = location;
    if (age_group) updateData.age_group = age_group;
    if (about_me) updateData.about_me = about_me;


    // Update user profile
    const result = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      data: result 
    }, { 
      status: 201 
    });

  } catch (error) {
    logger.error(`Error updating profile:${error}`);
    return NextResponse.json({ 
      error: "Failed to update profile. Please check your input and try again." 
    }, { 
      status: 500 
    });
  }
}