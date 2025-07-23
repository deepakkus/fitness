import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  const { productId } = params;
  const data = await request.json();
  const { name } = data;
  if (!name) {
    return NextResponse.json({ error: "Missing course material name" }, { status: 400 });
  }
  try {
    const deleted = await prisma.course_materials.deleteMany({
      where: {
        product_id: BigInt(productId),
        name,
      },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Course material not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Course material deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course material" }, { status: 500 });
  }
} 