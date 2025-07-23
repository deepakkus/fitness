import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import crypto from "crypto";
const { getIO } = require("../../../../lib/socket-io");

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  const orderId = parseInt(params.orderId);
  try {
    // Get all messages for this order, with user info and avatar blob
    const messages = await prisma.$queryRaw`
      SELECT m.*, u.name as user_name, u.email as user_email, b.image_blob as avatar_blob
      FROM order_messages m
      LEFT JOIN users u ON m.added_by = u.id
      LEFT JOIN users_blobs b ON u.id = b.user_id
      WHERE m.order_id = ${orderId}
      ORDER BY m.created_at ASC
    `;

    // For each message, fetch blobs
    const messageIds = messages.map((msg: any) => msg.id);
    const blobs = await prisma.order_message_blob.findMany({
      where: { order_message_id: { in: messageIds } },
      select: { id: true, order_message_id: true, name: true },
    });
    const blobsByMsg = blobs.reduce((acc, blob) => {
      if (!acc[blob.order_message_id]) acc[blob.order_message_id] = [];
      acc[blob.order_message_id].push({ id: blob.id, name: blob.name });
      return acc;
    }, {} as Record<number, {id:number, name:string}[]>);
    const messagesWithBlobs = messages.map((msg: any) => ({ ...msg, blobs: blobsByMsg[msg.id] || [] }));

    return NextResponse.json({ messages: messagesWithBlobs });
  } catch (error) {
    console.error('[OrderMessages API][GET] Error:', error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.user || !(token.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt((token.user as any).id);
    const orderId = parseInt(params.orderId);

    let message = "";
    let files: File[] = [];
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      message = formData.get("message") as string;
      files = formData.getAll("files") as File[];
    } else {
      const body = await request.json();
      message = body.message;
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // 1. Save the message
    const newMsg = await prisma.order_messages.create({
      data: {
        order_id: orderId,
        added_by: userId,
        message,
        created_at: new Date(),
      },
    });

    // 2. Save all attachments (if any)
    if (files && files.length > 0) {
      for (const file of files) {
        if (!(file instanceof File)) continue;
        if (file.type !== "application/pdf") continue;
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const buffer = Buffer.from(uint8);
        const randomStr = crypto.randomBytes(5).toString('hex');
        const randomName = `file_${randomStr}.pdf`;
        await prisma.order_message_blob.create({
          data: {
            order_message_id: newMsg.id,
            message_blob: buffer,
            name: randomName,
          },
        });
      }
    }

    // 3. Fetch the full message with blobs
    const fullMsg = await prisma.order_messages.findUnique({
      where: { id: newMsg.id },
      select: {
        id: true,
        order_id: true,
        added_by: true,
        message: true,
        created_at: true,
      },
    });
    // Fetch the sender's name
    const user = await prisma.users.findUnique({
      where: { id: fullMsg.added_by },
      select: { name: true },
    });
    const blobs = await prisma.order_message_blob.findMany({
      where: { order_message_id: newMsg.id },
      select: { id: true, name: true },
    });
    fullMsg.blobs = blobs;
    fullMsg.user_name = user?.name || '';

    // 4. Create notification for the other party (vendor or user)
    try {
      // Get order details to find the other party
      let order = null;
      try {
        order = await prisma.order_details.findUnique({
          where: { id: orderId },
          select: { user_id: true, vendor_id: true },
        });
      } catch (err) {
        console.error('[OrderMessages API] ERROR: Could not fetch order_details model:', err);
      }
      console.log('[OrderMessages API] Order details for notification:', order);
      
      if (order) {
        // Determine who should receive the notification
        const recipientId = order.user_id === BigInt(userId) ? order.vendor_id : order.user_id;
        console.log('[OrderMessages API] Notification recipientId:', recipientId, 'Sender userId:', userId);
        
        if (recipientId) {
          // Create notification
          let notif = null;
          try {
            notif = await prisma.notifications.create({
              data: {
                recipient_id: recipientId,
                recipient_type: "user",
                triggerer_id: BigInt(userId),
                triggerer_type: "user",
                notification_type: "order",
                created_at: new Date(),
                metadata: JSON.stringify({
                  orderId: orderId.toString(),
                  messageId: newMsg.id.toString(),
                  title: "New order message",
                }),
              },
            });
          } catch (notifErr) {
            console.error('[OrderMessages API] ERROR: Could not create notification:', notifErr);
          }
          console.log('[OrderMessages API] Notification created:', notif);
        } else {
          console.log('[OrderMessages API] No valid recipientId for notification');
        }
      } else {
        console.log('[OrderMessages API] No order found for notification creation');
      }
    } catch (notificationError) {
      console.error('[OrderMessages API] Error creating notification:', notificationError);
      // Don't fail the message send if notification creation fails
    }

    // 5. Emit the full message via socket
    console.log('[OrderMessages API] Attempting to emit socket event for order:', orderId);
    const io = getIO();
    console.log('[OrderMessages API] IO available:', !!io);
    
    if (io) {
      const room = `order_${orderId}`;
      console.log('[OrderMessages API] Emitting to room:', room);
      io.to(room).emit('order_message:new', { orderId, message: fullMsg });
      console.log('[OrderMessages API] Socket event emitted successfully');
    } else {
      console.log('[OrderMessages API] IO not available, cannot emit socket event');
    }

    return NextResponse.json({ success: true, message: fullMsg });
  } catch (error) {
    console.error('[OrderMessages API][POST] Error:', error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
} 