// import { NextRequest, NextResponse } from "next/server";
// import Stripe from "stripe";
// import { getToken } from "next-auth/jwt";
// import prisma from '@/lib/prisma';
// import { Prisma } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma"; // Make sure you have the Prisma client setup correctly
import logger from "@/lib/logger";
import { Prisma } from "@prisma/client";

//const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
 
    const token = await getToken({ req: req, secret: process.env.NEXTAUTH_SECRET });
    
      if (!token || !token.user || !token.user.id) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
    
      const user_id = BigInt(token.user.id);
  
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    // You can fetch post details from your DB here if needed
    
    const amount = new Prisma.Decimal(2.00);
    
    try {
          await prisma.post_payment.create({
            data: {
              activityId: BigInt(postId),
              userId: BigInt(user_id),
              amount: amount,
              payment_status: 1
            },
          });
          console.log("Payment")
        } catch (dbError) {
          console.error("DB insert failed", dbError);
          return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
        }
    

    return NextResponse.json({ status: 'Success' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}