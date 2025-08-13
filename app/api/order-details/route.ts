import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// Function to create order notifications
async function createOrderNotification(
  vendorId: bigint,
  buyerId: bigint,
  productId: bigint,
  productName: string,
  price: number
) {
  try {
    console.log(`[createOrderNotification] Starting notification creation for vendor ${vendorId}`);
    
    // Get buyer information
    const buyer = await prisma.users.findUnique({
      where: { id: buyerId },
      select: { name: true, profile_picture: true }
    });
    console.log(`[createOrderNotification] Buyer info retrieved:`, buyer?.name);

    // Create notification for vendor
    const notificationData = {
      recipient_id: vendorId,
      recipient_type: "user",
      triggerer_id: buyerId,
      triggerer_type: "user",
      notification_type: "order",
      created_at: new Date(),
              metadata: JSON.stringify({
          title: "New Order Received",
          orderId: productId.toString(), // Changed from productId to orderId to match click handler
          productId: productId.toString(),
          productName: productName,
          buyerName: buyer?.name || "A customer",
          price: price,
          orderType: "product_purchase"
        }),
    };
    
    console.log(`[createOrderNotification] Creating notification with data:`, notificationData);
    
    const notification = await prisma.notifications.create({
      data: notificationData
    });

    console.log(`[createOrderNotification] Notification created successfully with ID: ${notification.id}`);
    return notification;
  } catch (error) {
    console.error(`[createOrderNotification] Error creating order notification:`, error);
    console.error(`[createOrderNotification] Error details:`, {
      vendorId: vendorId.toString(),
      buyerId: buyerId.toString(),
      productId: productId.toString(),
      productName,
      price
    });
    throw error;
  }
}

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
      const product = await prisma.products.findUnique({ 
        where: { id: BigInt(item.id) },
        select: { 
          id: true, 
          userId: true, 
          name: true,
          price: true 
          
        }
      });
      
      if (!product) continue;
      
      // Create order
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
      
      createdOrders.push(order);
      
      // Create notification for vendor
      try {
        console.log(`[OrderDetails] Creating notification for vendor ${product.userId} from buyer ${user_id} for product ${product.id}`);
        await createOrderNotification(
          product.userId,
          user_id,
          product.id,
          product.name || "Product",
          item.price
        );
        console.log(`[OrderDetails] Notification created successfully for vendor ${product.userId}`);
      } catch (notificationError) {
        console.error(`[OrderDetails] Failed to create notification for order:`, notificationError);
        console.error(`[OrderDetails] Vendor ID: ${product.userId}, Buyer ID: ${user_id}, Product ID: ${product.id}`);
        // Don't fail the entire order creation if notification fails
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      ordersCreated: createdOrders.length 
    });
  } catch (error) {
    console.error("Error creating orders:", error);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
} 