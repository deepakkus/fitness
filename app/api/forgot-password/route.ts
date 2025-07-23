import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { hash } from 'bcryptjs';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { email, otp, password } = await req.json();
    // Handle OTP generation and sending
    if (email && !otp && !password) {
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Generate 6-digit OTP
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Delete any existing OTP for this user
      await prisma.password_reset_tokens.deleteMany({
        where: { user_id: user.id },
      });

      // Store new OTP with 15-minute expiration
      await prisma.password_reset_tokens.create({
        data: {
          user_id: user.id,
          token: generatedOTP,
          expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      // Send OTP via email
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Password Reset OTP',
        html: `
          <h1>Password Reset Request</h1>
          <p>Your OTP for password reset is: <strong>${generatedOTP}</strong></p>
          <p>This OTP will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      return NextResponse.json(
        { message: 'OTP sent successfully' },
        { status: 200 }
      );
    }

    // Handle password reset
    if (email && otp && password) {
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Verify OTP
      const validOTP = await prisma.password_reset_tokens.findFirst({
        where: {
          user_id: user.id,
          token: otp,
          expires_at: {
            gt: new Date(),
          },
        },
      });

      if (!validOTP) {
        return NextResponse.json(
          { error: 'Invalid or expired OTP' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await hash(password, 12);

      // Update password and clean up OTP
      await prisma.$transaction([  
        prisma.users.update({
          where: { id: user.id },
          data: { 
            password: hashedPassword,
            updated_at: new Date(),
          },
        }),
        prisma.password_reset_tokens.deleteMany({
          where: { user_id: user.id },
        }),
      ]);

      return NextResponse.json(
        { message: 'Password reset successful' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    logger.error(`Password reset error:${error}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
