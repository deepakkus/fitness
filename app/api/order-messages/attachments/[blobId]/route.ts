import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { blobId: string } }) {
  const blobId = parseInt(params.blobId);
  const blob = await prisma.order_message_blob.findUnique({
    where: { id: blobId },
    select: { message_blob: true, name: true },
  });
  if (!blob || !blob.message_blob) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(blob.message_blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=\"${blob.name}\"`,
      "Content-Length": blob.message_blob.length.toString(),
      "Cache-Control": "no-store",
    },
  });
} 