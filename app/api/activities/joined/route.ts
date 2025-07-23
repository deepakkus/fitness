// app/api/activities/joined/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.user || !token.user.id) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = BigInt(token.user.id);

    try {
        const joinedActivities = await prisma.activities.findMany({
            where: {
                activity_members: {
                    some: {
                        user_id: userId,
                    },
                },
            },
            select: {
                id: true,
                title: true,
                is_event: true,
            },
        });

        return NextResponse.json({ activities: joinedActivities }, { status: 200 });
    } catch (error) {
        console.error("Error fetching joined activities:", error);
        return NextResponse.json({ error: "Failed to fetch joined activities" }, { status: 500 });
    }
}