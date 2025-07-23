import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getToken } from "next-auth/jwt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req: req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    const { plan } = await req.json();
    if (!plan || !plan.products || !plan.price) {
      return NextResponse.json({ error: "Missing plan info" }, { status: 400 });
    }
    const amount = Math.round(Number(plan.price) * 100); // Convert to cents
    // Create a PaymentIntent for Stripe Elements
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        products: plan.products,
        price: plan.price,
        userId: token.user.id,
      },
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 