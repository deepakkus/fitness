import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  
    try {
      const user_id = BigInt(token.user.id);
      const data = await request.json();
      const { id, all = false } = data;
  
      if (all) {
        // Mark all notifications as read
        await prisma.notifications.updateMany({
          where: {
            recipient_id: user_id,
            recipient_type: "user", 
            read_at: null,
            deleted_at: null,
          },
          data: {
            read_at: new Date(),
            updated_at: new Date(),
          },
        });
      } else if (id) {
        // Mark a specific notification as read
        const notificationId = parseInt(id, 10);
        const result = await prisma.notifications.updateMany({
          where: {
            id: notificationId,
            recipient_id: user_id,
            recipient_type: "user",
            deleted_at: null,
          },
          data: {
            read_at: new Date(),
            updated_at: new Date(),
          },
        });
        console.log("[mark-read] Updated notifications:", result);
      } else {
        return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });
      }
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
    }
  }
