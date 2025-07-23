import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  try {
    // Fetch all post_payment records for the user
    const payments = await prisma.post_payment.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { created_at: "desc" },
    });
    // Fetch related activities (posts) for each payment
    const activityIds = payments.map(p => p.activityId);
    const activities = await prisma.activities.findMany({
      where: { id: { in: activityIds } },
      select: {
        id: true,
        title: true,
        description: true,
        created_at: true,
        is_active: true,
        // Add more fields as needed
      },
    });
    // Merge activity data into payments
    const paymentsWithActivity = payments.map(payment => {
      const activity = activities.find(a => a.id === payment.activityId);
      return { ...payment, activity };
    });
    return NextResponse.json({ data: paymentsWithActivity });
  } catch (error) {
    console.error("Detailed error in post_payment API:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
} 