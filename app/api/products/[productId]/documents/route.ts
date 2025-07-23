import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from '@prisma/client';
import path from 'path';

export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  const { productId } = params;
  // Defensive check for invalid productId
  if (!productId || productId === 'null' || productId === 'undefined' || isNaN(Number(productId))) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }
  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!["txt", "doc", "docx"].includes(ext || "")) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  // Read the file as an ArrayBuffer and convert to Buffer for Prisma
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log("Received file:", fileName, "size:", buffer.length);

  try {
    const productIdNum = BigInt(productId);
    // Before saving, check for duplicate name and auto-rename if needed
    let originalName = file.name;
    let ext = path.extname(originalName);
    let baseName = path.basename(originalName, ext);
    let newName = originalName;
    let counter = 1;
    let media;
    let maxAttempts = 10;
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        // Check for duplicate name (defensive, but race conditions can still happen)
        while (await prisma.product_media.findFirst({ where: { name: newName, product_id: productIdNum } })) {
          newName = `${baseName}-${counter}${ext}`;
          counter++;
        }
        // Try to create
        media = await prisma.product_media.create({
          data: {
            name: newName,
            product_id: productIdNum,
          },
        });
        break; // Success, exit retry loop
      } catch (err) {
        // If unique constraint error, increment and retry
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          newName = `${baseName}-${counter}${ext}`;
          counter++;
          attempt++;
          continue;
        } else {
          throw err;
        }
      }
    }
    if (!media) {
      return NextResponse.json({ error: "Failed to save document after multiple attempts" }, { status: 500 });
    }
    console.log("Created product_media:", media.id);
    // 2. Create product_media_blobs with the file buffer
    await prisma.product_media_blobs.create({
      data: {
        product_media_id: media.id,
        other_blob: buffer,
      },
    });
    console.log("Saved document blob for media_id:", media.id);
    return NextResponse.json({ success: true, mediaId: media.id, name: newName });
  } catch (error) {
    // Only log and return 500 for unexpected errors
    console.error(error);
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
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
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Document and blob deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
} 