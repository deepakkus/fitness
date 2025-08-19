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
        city: data.city || "",
        zip: data.zip || "",
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

  // First, get user profile data to populate billing details
  const user = await prisma.users.findUnique({
    where: { id: user_id },
    select: {
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      city: true,
      zip: true,
    }
  });

  let billing = await prisma.billing_details.findFirst({
    where: { user_id },
    orderBy: { created_at: 'desc' }
  });

  if (!billing) {
    // Auto-create a new row with user profile data
    billing = await prisma.billing_details.create({
      data: {
        user_id,
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        city: user?.city || '',
        zip: user?.zip || '',
        address: '',
        created_at: new Date(),
      },
    });
  } else {
    // Update existing billing details with user profile data if fields are empty
    const needsUpdate = !billing.first_name || !billing.last_name || !billing.email || !billing.phone || !billing.city || !billing.zip;
    
    if (needsUpdate && user) {
      billing = await prisma.billing_details.update({
        where: { id: billing.id },
        data: {
          first_name: billing.first_name || user.first_name || '',
          last_name: billing.last_name || user.last_name || '',
          email: billing.email || user.email || '',
          phone: billing.phone || user.phone || '',
          city: billing.city || user.city || '',
          zip: billing.zip || user.zip || '',
        },
      });
    }
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
        city: data.city || "",
        zip: data.zip || "",
        address: data.address,
        created_at: new Date(),
      },
    });
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update billing details" }, { status: 500 });
  }
} 