import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getToken } from "next-auth/jwt";
import prisma from '@/lib/prisma';
import { Prisma } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
    let amount = 200;
    const amount1 = new Prisma.Decimal(2.00);
    // try {
    //       await prisma.post_payment.create({
    //         data: {
    //           activityId: BigInt(postId),
    //           userId: BigInt(user_id),
    //           amount: amount1,
    //         },
    //       });
    //     } catch (dbError) {
    //       console.error("DB insert failed", dbError);
    //       return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    //     }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Sponsored Post",
              // Optionally, add more post info here
            },
            unit_amount: amount, // $10.00 (change as needed)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${postId}?paid=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${postId}`,
      metadata: {
        postId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}