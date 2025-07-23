import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

const smtpOptions = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};
const SMTP_FROM = process.env.SMTP_FROM;
const transporter = nodemailer.createTransport(smtpOptions);

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") as string;
  const rawBody = await req.arrayBuffer();
  const buf = Buffer.from(rawBody);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const products = session.metadata?.products;
    const price = session.metadata?.price;

    // Plan purchase logic
    if (userId && products && price) {
      // Insert or update users_product
      const user_id = BigInt(userId);
      const planProducts = parseInt(products);
      const planPrice = parseFloat(price);
      // Get user email
      const user = await prisma.users.findUnique({ where: { id: user_id } });
      const userEmail = user?.email || '';
      // Upsert plan (if user already has a plan, update it; else, create new)
      await prisma.users_product.upsert({
        where: { user_id },
        update: {
          total_product: planProducts,
          total_product_remaining: planProducts,
        },
        create: {
          user_id,
          total_product: planProducts,
          total_product_remaining: planProducts,
        },
      });
console.log('Before plan_order_details.create', { user_id, plan_id: 5, planPrice });
     try {
  await prisma.plan_order_details.create({
    data: {
      user_id,
      plan_id: BigInt(5),
      amount: planPrice,
      payment_status: 1,
      order_status: 1
    },
  });
  console.log('Plan order details created successfully');
} catch (err) {
  console.error('Error creating plan_order_details:', err);
}
console.log('After plan_order_details.create');
           
      // Send confirmation email
      // if (SMTP_FROM && userEmail) {
      //   try {
      //     const mailOptions = {
      //       from: SMTP_FROM,
      //       to: userEmail,
      //       subject: `Product Plan Purchased`,
      //       html: `
      //         <h2>Thank you for purchasing a product plan!</h2>
      //         <p>You have selected the following plan:</p>
      //         <ul>
      //           <li><strong>Products:</strong> ${planProducts}</li>
      //           <li><strong>Price:</strong> $${planPrice}</li>
      //         </ul>
      //         <p>You can now create up to ${planProducts} products on your account.</p>
      //         <p>If you have any questions, please contact support.</p>
      //       `,
      //     };
      //     await transporter.sendMail(mailOptions);
      //   } catch (emailError: any) {
      //     console.error('Error sending plan purchase email:', emailError);
      //   }
      // }
      return NextResponse.json({ received: true });
    }
    const postId = session.metadata?.postId;
    const amount = session.amount_total;
    // if (postId && userId && amount) {
    //   try {
    //     await prisma.post_payment.create({
    //       data: {
    //         activityId: postId,
    //         userId: userId,
    //         amount: amount,
    //       },
    //     });
    //   } catch (dbError) {
    //     return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    //   }
    // }
  }

  return NextResponse.json({ received: true });
} 