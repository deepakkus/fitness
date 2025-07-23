import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const userId = params.userId;
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  const latestOrder = await prisma.plan_order_details.findFirst({
    where: { user_id: BigInt(userId) },
    orderBy: { id: "desc" },
  });
  if (!latestOrder) {
    return NextResponse.json({ orderId: null });
  }
  return NextResponse.json({ orderId: latestOrder.id });
} 