import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.user || !(token.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user_id = BigInt((token.user as any).id);
    const orderId = parseInt(params.orderId);

    // Get the order with product details
    const order = await prisma.$queryRaw`
      SELECT 
        o.*, 
        p.name AS product_name,
        p.description AS product_description,
        (
          SELECT pm.name
          FROM product_media pm
          WHERE pm.product_id = p.id
            AND pm.deleted_at IS NULL
            AND (pm.name LIKE '%.jpg' OR pm.name LIKE '%.jpeg' OR pm.name LIKE '%.png' OR pm.name LIKE '%.webp' OR pm.name LIKE '%.avif')
          ORDER BY pm.id ASC
          LIMIT 1
        ) AS product_image,
        CASE 
          WHEN o.user_id = ${user_id} THEN 'customer'
          WHEN o.vendor_id = ${user_id} THEN 'vendor'
          ELSE NULL
        END AS user_role
      FROM order_details o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.id = ${orderId}
        AND (o.user_id = ${user_id} OR o.vendor_id = ${user_id})
    `;

    if (!order || (order as any[]).length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = (order as any[])[0];

    // Get billing details for the user who placed the order
    const billingDetails = await prisma.billing_details.findFirst({
      where: { user_id: orderData.user_id }
    });

    // Get vendor details
    const vendorDetails = await prisma.users.findUnique({
      where: { id: orderData.vendor_id },
      select: {
        id: true,
        name: true,
        email: true,
        profile_picture: true
      }
    });

    // Get customer details
    const customerDetails = await prisma.users.findUnique({
      where: { id: orderData.user_id },
      select: {
        id: true,
        name: true,
        email: true,
        profile_picture: true
      }
    });
    const courseMaterials = await prisma.course_materials.findMany({
      where: { product_id: orderData.product_id }
    });
    return NextResponse.json({
      order: orderData,
      billingDetails,
      vendorDetails,
      customerDetails,
      courseMaterials
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { orderId: string } }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !(token.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orderId = parseInt(params.orderId);
  const { order_status } = await request.json();

  try {
    const updated = await prisma.order_details.update({
      where: { id: orderId },
      data: { order_status },
    });
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
} 