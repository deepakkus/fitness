// // app/api/achievements/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { getToken } from "next-auth/jwt";

// export async function GET(request: NextRequest) {
//     const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

//     if (!token || !token.user || !token.user.id) {
//         return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
//     }

//     const userId = BigInt(token.user.id);

//     try {
//         const achievements = await prisma.achievements.findMany({
//             where: {
//                 user_id: userId,
//             },
//             include: {
//                 achievement_media: true,
//                 activities: {
//                     include: {
//                         ref_activity_types: true
//                     }
//                 },
//             },
//             orderBy: {
//                 created_at: 'desc',
//             }
//         });

//         const formattedAchievements = achievements.map(achievement => {
//             const locationParts = achievement.activities?.location?.split(', ') || [];
//             // const pincode = locationParts.find(part => part.startsWith('zip:'))?.split(': ')[1] || 'N/A'; // No longer needed
    
//             return {
//                 teamName: achievement.activities?.title || 'Unknown Activity',
//                 peopleInterested: 0,
//                 eventDay: null,
//                 eventDate: null,
//                 eventTime: null,
//                 imageUrl: achievement.achievement_media[0]?.name ? `/api/images/${achievement.achievement_media[0]?.name}` : "URL_TO_DEFAULT_IMAGE_IF_NEEDED",
//                 title: achievement.activities?.title || 'Unknown Activity',
//                 category: achievement.activities?.ref_activity_types?.name || 'Unknown Category',
//                 subcategory: null,
//                 // age: achievement.activities?.age_group || 'N/A', // No longer needed
//                 leftSpace: 0,
//                 // pincode: pincode, // No longer needed
//                 author: "System",
//                 time: achievement.created_at.toLocaleDateString('en-GB'), // Format date to dd-mm-yy
//                 isLoggedin: false,
//                 isSponsored: false,
//                 description: achievement.description
//             };
//         });
    
//         return NextResponse.json(formattedAchievements, { status: 200 });

//     } catch (error) {
//         console.error("Error fetching achievements:", error);
//         return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
//     }
// }


// app/api/achievements/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.user || !token.user.id) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = BigInt(token.user.id);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    try {
        const achievements = await prisma.achievements.findMany({
            where: {
                user_id: userId,
            },
            include: {
                achievement_media: true,
                activities: {
                    include: {
                        ref_activity_types: true
                    }
                },
            },
            orderBy: {
                created_at: 'desc',
            },
            skip,
            take: limit,
        });

        const formattedAchievements = achievements.map(achievement => {
            // const locationParts = achievement.activities?.location?.split(', ') || [];
            
            return {
                teamName: achievement.activities?.title || 'Unknown Activity',
                peopleInterested: 0,
                eventDay: null,
                eventDate: null,
                eventTime: null,
                imageUrl: achievement.achievement_media[0]?.name ? `/api/images/${achievement.achievement_media[0]?.name}` : "/placeholder.png",
                title: achievement.activities?.title || 'Unknown Activity',
                category: achievement.activities?.ref_activity_types?.name || 'Unknown Category',
                subcategory: null,
                leftSpace: 0,
                author: "System",
                time: achievement.created_at.toLocaleDateString('en-GB'),
                isLoggedin: false,
                isSponsored: false,
                description: achievement.description
            };
        });
    
        return NextResponse.json({ 
            achievements: formattedAchievements,
            page,
            limit
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching achievements:", error);
        return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
    }
}
