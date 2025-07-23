// // app/api/delete-account/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// const prisma = new PrismaClient();

// export async function POST(req: NextRequest) {
//   try {
//     // Get the authenticated session
//     const session = await getServerSession(authOptions);
    
//     if (!session) {
//       return NextResponse.json(
//         { message: "Unauthorized: Please login first" },
//         { status: 401 }
//       );
//     }

//     // Get request body
//     const { email, password } = await req.json();

//     // Validate inputs
//     if (!email || !password) {
//       return NextResponse.json(
//         { message: "Email and password are required" },
//         { status: 400 }
//       );
//     }

//     // Find user by email
//     const user = await prisma.users.findUnique({
//       where: { email: email }
//     });

//     if (!user) {
//       return NextResponse.json(
//         { message: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Verify if authenticated user matches the account to be deleted
//     if (user.email !== session.user?.email) {
//       return NextResponse.json(
//         { message: "Unauthorized: You can only delete your own account" },
//         { status: 403 }
//       );
//     }

//     // Verify password
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return NextResponse.json(
//         { message: "Invalid password" },
//         { status: 401 }
//       );
//     }

//     // Start transaction for soft delete
//     await prisma.$transaction(async (tx) => {
//       const now = new Date();

//       // Soft delete user
//       await tx.users.update({
//         where: { id: user.id },
//         data: { 
//           deleted_at: now,
//           is_active: false 
//         }
//       });

//       // Soft delete related records
//       await Promise.all([
//         // Soft delete user's activities
//         tx.activities.updateMany({
//           where: { added_by: user.id },
//           data: { deleted_at: now }
//         }),

//         // Soft delete user's achievements
//         tx.achievements.updateMany({
//           where: { user_id: user.id },
//           data: { deleted_at: now }
//         }),

//         // Soft delete user's activity comments
//         tx.activity_comments.updateMany({
//           where: { added_by: user.id },
//           data: { deleted_at: now }
//         }),

//         // Soft delete user's activity likes
//         tx.activity_likes.updateMany({
//           where: { added_by: user.id },
//           data: { deleted_at: now }
//         }),

//         // Soft delete user's messages
//         tx.messages.updateMany({
//           where: { added_by: user.id },
//           data: { deleted_at: now }
//         }),

//         // Soft delete user's fcm tokens
//         tx.users_fcm_tokens.updateMany({
//           where: { user_id: user.id },
//           data: { deleted_at: now }
//         }),

//         // Soft delete user's activity join requests
//         tx.activity_join_requests.updateMany({
//           where: { user_id: user.id },
//           data: { deleted_at: now }
//         }),

//         // Soft delete user's activity members
//         tx.activity_members.updateMany({
//           where: { user_id: user.id },
//           data: { deleted_at: now }
//         }),

//         // Soft delete user's votes
//         tx.votes.updateMany({
//           where: { voter_id: user.id },
//           data: { deleted_at: now }
//         }),

//         // Soft delete user's followers relationships
//         tx.user_followers.updateMany({
//           where: {
//             OR: [
//               { follower_id: user.id },
//               { followee_id: user.id }
//             ]
//           },
//           data: { deleted_at: now }
//         })
//       ]);

//       // Log the account deletion
//       await tx.activity_logs.create({
//         data: {
//           user_id: user.id,
//           action_type: 'Deleted',
//           table_name: 'users',
//           record_type: 'Account',
//           record_id: user.id,
//           new_values: {
//             deleted_at: now.toISOString(),
//             is_active: false
//           }
//         }
//       });
//     });

//     return NextResponse.json(
//       { message: "Account successfully deleted" },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("Error deleting account:", error);
//     return NextResponse.json(
//       { message: "An error occurred while deleting the account" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }



// // app/api/delete-account/route.ts  (Corrected for Next.js App Router)
// import { NextResponse, NextRequest } from 'next/server'; // Import NextResponse and NextRequest
// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../../../lib/auth';

// const prisma = new PrismaClient();

// export async function POST(req: NextRequest, res: NextResponse) {
//     if (req.method !== 'POST') {
//         return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
//     }

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//         return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//     }

//     try {
//         const { email, password } = await req.json();

//         if (!email || !password) {
//             return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
//         }

//         const user = await prisma.users.findUnique({
//             where: { email: email },
//         });

//         if (!user) {
//             return NextResponse.json({ message: 'User not found.' }, { status: 404 });
//         }

//         // Verify password
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
//         }

//         // Soft delete user
//         await prisma.users.update({
//             where: { id: user.id },
//             data: { deleted_at: new Date() },
//         });

//         return NextResponse.json({
//             message: 'Account deleted successfully.',
//             logout: true // Add a logout flag to the response
//         }, { status: 200 });

//     } catch (error: any) {
//         console.error('Error deleting account:', error);
//         return NextResponse.json({ message: 'Failed to delete account.', error: error.message }, { status: 500 });
//     } finally {
//         await prisma.$disconnect();
//     }
// }




// app/api/delete-account/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth'; 
import { authOptions } from '../../../lib/auth'; 
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    if (req.method !== 'POST') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id; // Get user ID from session

    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { email, password, reasons, comments } = await req.json(); // Get reasons and comments from request body

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
        }

        const user = await prisma.users.findUnique({
            where: { email: email },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
        }

        // Record user survey data BEFORE deleting the account
        await prisma.user_survey.create({
            data: {
                user_id: BigInt(userId), // Use user ID from session
                reason: reasons ? reasons : Prisma.JsonNull, // Store reasons, handle if missing
                comments: comments || null, // Store comments, handle if missing
            },
        });


        // Soft delete user
        await prisma.users.update({
            where: { id: user.id },
            data: { deleted_at: new Date() },
        });

        return NextResponse.json({
            message: 'Account deleted successfully.',
            logout: true
        }, { status: 200 });

    } catch (error: any) {
        logger.error(`Error deleting account:${error}`);
        return NextResponse.json({ message: 'Failed to delete account.', error: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}