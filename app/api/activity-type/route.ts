/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/activity-type/[activityId]/route.ts

import { NextRequest, NextResponse } from "next/server";
//import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma"; // Make sure you have the Prisma client setup correctly

export async function GET(request: NextRequest) {
  /*
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token  ||  !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
    */
  try {
    // Fetch all activity types for the dropdown
    const activityTypes = await prisma.ref_activity_types.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    const formattedActivityTypes = activityTypes.map((activityType) => {
      return {
        id: parseInt(activityType.id.toString()),
        name: activityType.name,
      };
    });

    return NextResponse.json(formattedActivityTypes);
  } catch (error) {
    console.error("Error fetching activity types:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
