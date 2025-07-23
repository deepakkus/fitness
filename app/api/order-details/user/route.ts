import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.user || !(token.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user_id = BigInt((token.user as any).id);

    // Get all orders where user is either customer or vendor
    const orders = await prisma.$queryRaw<any[]>`
      SELECT 
        o.*, 
        b.first_name AS first_name,
        b.last_name AS last_name,
        b.email AS email,
        b.phone AS phone,
        b.city AS city,
        b.zip AS zip,
        b.address AS address,
        p.name AS product_name,
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
      LEFT JOIN billing_details b ON o.user_id = b.user_id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.user_id = ${user_id} OR o.vendor_id = ${user_id}
      ORDER BY o.created_on DESC
    `;
    const ordersWithMaterials = await Promise.all(
      orders.map(async (order: any) => {
        const courseMaterials = await prisma.course_materials.findMany({
          where: { product_id: Number(order.product_id) }
        });
        return {
          ...order,
          course_materials: courseMaterials
        };
      })
    );

    return NextResponse.json({
      data: ordersWithMaterials
    }); 
           
    //return NextResponse.json({ data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
} 