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
          select: { pdf_blob: true },
        },
      },
    });
    if (!media || !media.product_media_blobs || !media.product_media_blobs.pdf_blob) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }
    const pdfBuffer = Buffer.from(media.product_media_blobs.pdf_blob);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=\"${media.name}\"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 });
  }
} 