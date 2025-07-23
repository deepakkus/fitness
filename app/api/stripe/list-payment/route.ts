import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    //const { paymentMethodId, cart } = body;
    const { token, name, cart } = body;
    // Get the user session
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Calculate total amount from cart (in cents)
    const total = Array.isArray(cart)
      ? Math.round(cart.reduce((sum, item) => sum + Number(item.price || 0), 0) * 100)
      : 0;
    if (total <= 0) {
      return NextResponse.json({ error: 'Invalid cart total' }, { status: 400 });
    }

    // // 1. Create a PaymentMethod from the token
    // const paymentMethod = await stripe.paymentMethods.create({
    //   type: 'card',
    //   card: { token },
    //   billing_details: { name, email: userEmail },
    // });

    // 2. Create and confirm the PaymentIntent with the PaymentMethod ID
   
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      payment_method_types: ['card'],
      receipt_email: userEmail,
    });
     return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 