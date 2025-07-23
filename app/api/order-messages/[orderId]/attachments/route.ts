import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    console.log('[Attachments API] Starting file upload...');
    
    // Parse multipart form data
    const formData = await request.formData();
    const order_message_id = parseInt(formData.get("order_message_id") as string);
    const files = formData.getAll("files");
    
    console.log('[Attachments API] Parsed data:', { order_message_id, fileCount: files.length });
    
    if (!order_message_id || !files.length) {
      console.log('[Attachments API] Missing data:', { order_message_id, fileCount: files.length });
      return NextResponse.json({ error: "Missing order_message_id or files" }, { status: 400 });
    }
    
    const savedBlobs = [];
    for (const file of files) {
      if (!(file instanceof File)) {
        console.log('[Attachments API] Skipping non-file:', typeof file);
        continue;
      }
      if (file.type !== "application/pdf") {
        console.log('[Attachments API] Skipping non-PDF:', file.type);
        continue;
      }
      
      console.log('[Attachments API] Processing file:', file.name, file.size);
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generate random name
      const randomStr = crypto.randomBytes(5).toString('hex');
      const randomName = `file_${randomStr}.pdf`;
      
      const blob = await prisma.order_message_blob.create({
        data: {
          order_message_id,
          message_blob: buffer,
          name: randomName,
        },
      });
      
      console.log('[Attachments API] Saved blob:', blob.id);
      savedBlobs.push({ id: blob.id, name: blob.name });
    }
    
    console.log('[Attachments API] Successfully saved blobs:', savedBlobs);
    return NextResponse.json({ success: true, blobs: savedBlobs });
  } catch (error) {
    console.error('[Attachments API] Error:', error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
} 