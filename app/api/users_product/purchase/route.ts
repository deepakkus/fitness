import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

// SMTP Email Sending Setup (copied from contact-us)
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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = BigInt(session.user.id);
  const { plan } = await req.json();
  let amount = 5.00;
  let planid = 1;
  if (!plan || !plan.products) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }
  // Prevent duplicate plans
  const existing = await prisma.users_product.findUnique({ where: { user_id: userId } });
  if (existing) {
    await prisma.users_product.update({
      where: { user_id: userId },
      data: {
        total_product: plan.products,
        total_product_remaining: plan.products,
      },
    });
    //return NextResponse.json({ error: 'Plan already exists' }, { status: 400 });
  }
  else
  {
      await prisma.users_product.create({
      data: {
        user_id: userId,
        total_product: plan.products,
        total_product_remaining: plan.products,
      },
    });
  }
  if(plan.products === 10)
  {
    amount = 8.00;
    planid = 2;
  }
  if(plan.products === 15)
  {
    amount = 12.00;
    planid = 3;
  }
  try {
    await prisma.plan_order_details.create({
      data: {
        user_id: BigInt(userId),
        plan_id: planid,
        amount: amount,
        payment_status: 1,
        order_status: 1
      },
    });
    console.log('Plan order details created successfully');
  } catch (err) {
    console.error('Error creating plan_order_details:', err);
  }

  // Get the user's email from the users table
  const user = await prisma.users.findUnique({ where: { id: userId } });
  const userEmail = user?.email || 'deepak09.singh@gmail.com';

  // Send email to user about the plan purchase
  if (SMTP_FROM && userEmail) {
    try {
      const mailOptions = {
        from: SMTP_FROM,
        to: userEmail, // Send to the actual user's email
        subject: `Product Plan Purchased`,
        html: `
          <h2>Thank you for purchasing a product plan!</h2>
          <p>You have selected the following plan:</p>
          <ul>
            <li><strong>Products:</strong> ${plan.products}</li>
            <li><strong>Price:</strong> $${plan.price}</li>
          </ul>
          <p>You can now create up to ${plan.products} products on your account.</p>
          <p>If you have any questions, please contact support.</p>
        `,
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError: any) {
      console.error('Error sending plan purchase email:', emailError);
      // Don't block the response if email fails
    }
  }

  return NextResponse.json({ success: true });
} 