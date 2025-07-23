// app/api/images/[...path]/route.ts
// app/api/images/[...path]/route.ts

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma"; // Adjust the import based on your project structure
import { Prisma } from "@prisma/client";

// Define the structure for table map with strict typing
type TableMap = {
  profiles: { table: "users"; blobTable: "usersBlobs"; column: keyof Prisma.usersWhereInput };
  activities: {
    table: "activity_media";
    blobTable: "activity_media_blobs";
    column: keyof Prisma.activity_mediaWhereInput;
  };
  achievements: {
    table: "achievement_media";
    blobTable: "achievement_media_blobs";
    column: keyof Prisma.achievement_mediaWhereInput;
  };
  messages: { table: "message_media"; blobTable: "message_media_blobs"; column: keyof Prisma.message_mediaWhereInput };
  products: {
    table: "product_media";
    blobTable: "product_media_blobs";
    column: keyof Prisma.product_mediaWhereInput;
  };
};

// Define the mapping of bucket names to table and column info
const TABLE_MAP: TableMap = {
  profiles: { table: "users", blobTable: "usersBlobs", column: "profile_picture" },
  activities: { table: "activity_media", blobTable: "activity_media_blobs", column: "name" },
  achievements: { table: "achievement_media", blobTable: "achievement_media_blobs", column: "name" },
  messages: { table: "message_media", blobTable: "message_media_blobs", column: "name" },
  products: { table: "product_media", blobTable: "product_media_blobs", column: "name" },
};

// Function to query the appropriate Prisma tables based on the table identifier
async function getImageBlob(tableIdentifier: keyof TableMap, fileName: string) {
  const { table, blobTable } = TABLE_MAP[tableIdentifier];
  let mainRecord;
  let blobRecord;

  // Fetch the main record based on the unique name
  switch (table) {
    case "users":
      mainRecord = await prisma.users.findUnique({
        where: { profile_picture: fileName },
        select: { id: true },
      });
      break;
    case "activity_media":
      mainRecord = await prisma.activity_media.findUnique({
        where: { name: fileName },
        select: { id: true },
      });
      break;
    case "achievement_media":
      mainRecord = await prisma.achievement_media.findUnique({
        where: { name: fileName },
        select: { id: true },
      });
      break;
    case "message_media":
      mainRecord = await prisma.message_media.findUnique({
        where: { name: fileName },
        select: { id: true },
      });
      break;
      case "product_media":
      mainRecord = await prisma.product_media.findUnique({
        where: { name: fileName },
        select: { id: true },
      });
      break;
    default:
      return null;
  }

  if (!mainRecord) {
    return null;
  }
console.log('blob--'+fileName)
  // Fetch the blob from the corresponding blob table
  switch (blobTable) {
    case "usersBlobs":
      blobRecord = await prisma.users_blobs.findUnique({
        where: { user_id: mainRecord.id },
        select: { image_blob: true },
      });
      break;
    case "activity_media_blobs":
      blobRecord = await prisma.activity_media_blobs.findUnique({
        where: { activity_media_id: mainRecord.id },
        select: { image_blob: true },
      });
      break;
    case "achievement_media_blobs":
      blobRecord = await prisma.achievement_media_blobs.findUnique({
        where: { achievement_media_id: mainRecord.id },
        select: { image_blob: true },
      });
      break;
    case "message_media_blobs":
      blobRecord = await prisma.message_media_blobs.findUnique({
        where: { message_media_id: mainRecord.id },
        select: { image_blob: true },
      });
      break;
      case "product_media_blobs":
      blobRecord = await prisma.product_media_blobs.findUnique({
        where: { product_media_id: mainRecord.id },
        select: { image_blob: true, video_blob: true, pdf_blob: true },
      });
      break;
    default:
      return null;
  }
  
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!blobRecord) return null;
  switch (extension) {
  case "avif":
    return blobRecord.image_blob || null;
  case "mp4":
    return blobRecord.video_blob || null;
  case "pdf":
    return blobRecord.pdf_blob || null;
  default:
    return null;
}
  //return blobRecord ? blobRecord.image_blob || blobRecord.video_blob: null;
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = params;
  const bucket_name = path[0];
  const filePath = path.join("/"); // Assuming the file name is after the bucket

  // Validate if the bucket name matches any known table identifier
  if (!(bucket_name in TABLE_MAP)) {
    return new Response(JSON.stringify({ error: "Invalid path" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Query the database for the image blob
  const imageBlob = await getImageBlob(bucket_name as keyof TableMap, filePath);

  if (!imageBlob) {
    return new Response(JSON.stringify({ error: "Image not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Serve the image as AVIF format
  //const mimeType = "image/avif";

  const extension = filePath.split(".").pop()?.toLowerCase();
  let mimeType = "";
if (extension === "avif") mimeType = "image/avif";
else if (extension === "mp4") mimeType = "video/mp4";
else if (extension === "pdf") mimeType = "application/pdf";
else {
  return new Response(JSON.stringify({ error: "Unsupported file type" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
  const headers = {
    "Content-Type": mimeType,
    "Cache-Control": "public, max-age=31536000, immutable", // Cache headers
  };

  return new Response(imageBlob, {
    status: 200,
    headers,
  });
}

