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
  console.log('DELETE product image called with:', { productId, name });
  if (!name) {
    return NextResponse.json({ error: "Missing image name" }, { status: 400 });
  }
  try {
    // Find all product_media rows to be deleted
    const medias = await prisma.product_media.findMany({
      where: {
        product_id: BigInt(productId),
        name,
      },
      select: { id: true },
    });
    const mediaIds = medias.map((m) => m.id);
    // Delete blobs first
    if (mediaIds.length > 0) {
      await prisma.product_media_blobs.deleteMany({
        where: { product_media_id: { in: mediaIds } },
      });
    }
    // Delete product_media rows
    const deleted = await prisma.product_media.deleteMany({
      where: {
        product_id: BigInt(productId),
        name,
      },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Product image not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product image and blobs deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product image" }, { status: 500 });
  }
} 