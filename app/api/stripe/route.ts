import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { token, name, cart, productId } = body;
    // Get the user session
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Fetch product data if productId is provided
    let productData = null;
    if (productId) {
      productData = await prisma.products.findUnique({
        where: { id: BigInt(productId) },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
        },
      });
    }

    // Calculate total amount from cart (in cents)
    const total = Array.isArray(cart)
      ? Math.round(cart.reduce((sum, item) => sum + Number(item.price || 0), 0) * 100)
      : 0;
    if (total <= 0) {
      return NextResponse.json({ error: 'Invalid cart total' }, { status: 400 });
    }

    // 2. Create and confirm the PaymentIntent with the PaymentMethod ID
    const userEmails = 'kussoftware22@gmail.com';
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      payment_method_types: ['card'],
      receipt_email: userEmail,
    });

    // Fetch latest order_details for this productId
    let orderDetails = null;
    if (productId) {
      orderDetails = await prisma.order_details.findFirst({
        where: { product_id: BigInt(productId) },
        orderBy: { created_on: 'desc' },
      });
    }

    // Use orderDetails.id as order number and created_on as order date if available
    let orderNumber = orderDetails ? orderDetails.id : nanoid(10);
    let orderDate = orderDetails && orderDetails.created_on
      ? new Date(orderDetails.created_on).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    if (SMTP_FROM && userEmail) {
      try {
        const mailOptions = {
          from: SMTP_FROM,
          to: userEmail, // Send to the actual user's email
          subject: `Product Purchased`,
          html: `
            <h2>Purchase Confirmation</h2>
            <p>Dear Customer,</p>
            <p>Thank you for your recent purchase. We are pleased to confirm that your order has been successfully received. Below are the details of your transaction:</p>
            <ul>
              <li><strong>Order Number:</strong> ${orderNumber}</li>
              <li><strong>Order Date:</strong> ${orderDate}</li>
              <li><strong>Product Name:</strong> ${productData?.name || ''}</li>
              <li><strong>Price:</strong> $${productData?.price || ''}</li>
            </ul>
            <p>If you have any questions or require further assistance, please feel free to contact our support team at any time. We are always here to help.</p>
            <p>Thank you for choosing our services. We appreciate your business and look forward to serving you again in the future.</p>
            <p>Best regards,<br/>
            The 99Fitness Team</p>
          `,
        };
        await transporter.sendMail(mailOptions);
      } catch (emailError: any) {
        console.error('Error sending plan purchase email:', emailError);
        // Don't block the response if email fails
      }
    }
    return NextResponse.json({ clientSecret: paymentIntent.client_secret, product: productData, orderNumber, orderDate, orderDetails });
  } catch (err: any) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 