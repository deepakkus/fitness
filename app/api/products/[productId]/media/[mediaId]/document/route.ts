import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string; mediaId: string } }
) {
  const { productId, mediaId } = params;
  if (!productId || !mediaId) {
    return NextResponse.json({ error: "Missing productId or mediaId" }, { status: 400 });
  }
  try {
    const media = await prisma.product_media.findUnique({
      where: { id: BigInt(mediaId) },
      select: {
        name: true,
        product_media_blobs: {
          select: { other_blob: true },
        },
      },
    });
    if (!media || !media.product_media_blobs || !media.product_media_blobs.other_blob) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    const docBuffer = Buffer.from(media.product_media_blobs.other_blob);
    // Set content type based on file extension
    const ext = media.name?.toLowerCase().split('.').pop();
    let contentType = "application/octet-stream";
    if (ext === "txt") contentType = "text/plain";
    if (ext === "doc") contentType = "application/msword";
    if (ext === "docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return new NextResponse(docBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${media.name}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
} 