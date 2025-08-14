import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user_id = BigInt(token.user.id);
  const data = await request.json();

  try {
    const billing = await prisma.billing_details.create({
      data: {
        user_id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.emailAddress,
        phone: data.phoneNumber,
        city: "", // Not saving user input, using empty string
        zip: "", // Not saving user input, using empty string
        address: data.address,
        created_at: new Date(),
      },
    });
    return NextResponse.json({ success: true, billing });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save billing details" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user_id = BigInt(token.user.id);

  let billing = await prisma.billing_details.findFirst({
    where: { user_id },
    orderBy: { created_at: 'desc' }
  });

  if (!billing) {
    // Auto-create a new row with empty/default values
    billing = await prisma.billing_details.create({
      data: {
        user_id,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        city: '', // Empty string for auto-created rows
        zip: '', // Empty string for auto-created rows
        address: '',
        created_at: new Date(),
      },
    });
  }

  return NextResponse.json({ data: billing });
}

export async function PUT(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user_id = BigInt(token.user.id);
  const data = await request.json();

  try {
    const updated = await prisma.billing_details.updateMany({
      where: { user_id },
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.emailAddress,
        phone: data.phoneNumber,
        city: "", // Not saving user input, using empty string
        zip: "", // Not saving user input, using empty string
        address: data.address,
        created_at: new Date(),
      },
    });
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update billing details" }, { status: 500 });
  }
} 