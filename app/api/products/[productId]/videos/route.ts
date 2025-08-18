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
  const { mediaId } = data;
  
  if (!productId || !mediaId) {
    return NextResponse.json({ error: "Missing productId or mediaId" }, { status: 400 });
  }
  
  try {
    // Delete the blob first
    await prisma.product_media_blobs.deleteMany({
      where: { product_media_id: BigInt(mediaId) },
    });
    
    // Delete the product_media record
    const deleted = await prisma.product_media.deleteMany({
      where: { id: BigInt(mediaId), product_id: BigInt(productId) },
    });
    
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Video and blob deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
