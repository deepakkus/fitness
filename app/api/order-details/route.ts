import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { getIO } from "@/lib/socket-io";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user_id = BigInt(token.user.id);
  const { cart } = await request.json();

  try {
    const createdOrders = [];
    
    for (const item of cart) {
      // Fetch vendor_id from product
      const product = await prisma.products.findUnique({ where: { id: BigInt(item.id) } });
      if (!product) continue;
      
      const order = await prisma.order_details.create({
        data: {
          user_id,
          product_id: BigInt(item.id),
          vendor_id: product.userId,
          price: item.price,
          payment_status: "S",
          order_status: "P",
          created_on: new Date(),
        },
      });
      
      createdOrders.push({ order, product });
    }

    // Create notifications for vendors about new orders
    for (const { order, product } of createdOrders) {
      try {
        // Create notification for the vendor
        const notification = await prisma.notifications.create({
          data: {
            recipient_id: order.vendor_id,
            recipient_type: "user",
            triggerer_id: user_id,
            triggerer_type: "user",
            notification_type: "order",
            created_at: new Date(),
            metadata: JSON.stringify({
              orderId: order.id.toString(),
              productId: order.product_id.toString(),
              productName: product.name,
              title: "New order received",
              message: `You have received a new order for ${product.name}`,
            }),
            action_url: `/vendor/dashboard?tab=delivery&orderId=${order.id}`,
          },
        });
        
        console.log(`[OrderDetails API] Notification created for vendor ${order.vendor_id} about order ${order.id}`);
        
        // Emit real-time notification via socket
        const io = getIO();
        if (io) {
          io.to(`user_${order.vendor_id}`).emit("new_notification", {
            notificationId: notification.id.toString(),
            type: "order",
            title: "New order received",
            message: `You have received a new order for ${product.name}`,
            orderId: order.id,
            timestamp: Date.now()
          });
          console.log(`[OrderDetails API] Socket notification emitted to vendor ${order.vendor_id}`);
        }
      } catch (notificationError) {
        console.error(`[OrderDetails API] Error creating notification for order ${order.id}:`, notificationError);
        // Don't fail the order creation if notification fails
      }
    }

    return NextResponse.json({ success: true, ordersCreated: createdOrders.length });
  } catch (error) {
    console.error('[OrderDetails API] Error:', error);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
} 