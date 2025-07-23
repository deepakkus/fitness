// app/api/achievements/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.user || !token.user.id) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = BigInt(token.user.id);

    try {
        const { activityId, description } = await request.json();

        if (!activityId || !description) {
            return NextResponse.json({ error: "Missing required fields: activityId and description" }, { status: 400 });
        }

        const newAchievement = await prisma.achievements.create({
            data: {
                activity_id: BigInt(activityId),
                user_id: userId, // Assuming achievement is for the logged-in user
                description: description,
                added_by: userId, 
            },
            select: { // Include id in the select to return it
                id: true,
            }
        });


        return NextResponse.json({ success: true, achievementId: newAchievement.id }, { status: 201 }); // Return achievementId

    } catch (error) {
        logger.error(`Error creating achievement:${error}`);
        return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 });
    }
}