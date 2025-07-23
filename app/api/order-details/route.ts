import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user_id = BigInt(token.user.id);
  const { cart } = await request.json();

  try {
    for (const item of cart) {
      // Fetch vendor_id from product
      const product = await prisma.products.findUnique({ where: { id: BigInt(item.id) } });
      if (!product) continue;
      await prisma.order_details.create({
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
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
} 