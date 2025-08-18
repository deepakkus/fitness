/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { nanoid } from "nanoid";
import sharp from "sharp";
import logger from "@/lib/logger";

// Helper function to process image to blob
async function processImageToBlob(image: File, targetSize: number): Promise<Buffer | null> {
  try {
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const sharpImage = sharp(imageBuffer);
    
    // Resize image
    const resizedImage = sharpImage.resize(targetSize, targetSize, {
      fit: "inside",
      withoutEnlargement: true,
    });

    // Convert to AVIF format with compression
    const compressedBuffer = await resizedImage
      .avif({ quality: 80, effort: 5 })
      .toBuffer();

    return compressedBuffer;
  } catch (error) {
    console.error("Error processing image:", error);
    return null;
  }
}

// Helper function to calculate effort based on size
function calculateEffort(sizeKB: number): number {
  if (sizeKB <= 62) return 4;
  if (sizeKB >= 1024) return 9;
  return Math.round(1 + ((sizeKB - 62) / (1024 - 62)) * (9 - 1));
}

// Helper function for binary search compression
async function binarySearchCompression(
  image: sharp.Sharp,
  initialBuffer: Buffer,
  initialSize: number
): Promise<Buffer> {
  let lowQuality = 10;
  let highQuality = 80;
  let bestBuffer: Buffer = initialBuffer;
  let bestSize = initialSize;
  let iterations = 0;
  let useYuv = false;
  let lastQuality = 80;
  let lastSize = initialSize;

  while (lowQuality <= highQuality) {
    const currentQuality = Math.floor((lowQuality + highQuality) / 2);
    const chromaSubsampling = useYuv ? "4:2:0" : undefined;

    let currentBuffer: Buffer = await image
      .avif({
        quality: currentQuality,
        effort: 5,
        chromaSubsampling: chromaSubsampling,
      })
      .toBuffer();

    let currentSize = currentBuffer.length;

    if (currentSize <= 65535 && currentSize >= 50 * 1024) {
      bestBuffer = currentBuffer;
      bestSize = currentSize;
      break;
    } else if (currentSize < 50 * 1024) {
      const sizeDelta: number = lastSize - currentSize;
      const qualityDelta: number =
        currentSize < 30 * 1024 ? lastQuality - currentQuality : (lastQuality - currentQuality) / 2;
      const expectedSizeChangePerQualityPoint: number = sizeDelta / qualityDelta;
      const targetIncrease: number = (50 * 1024 - currentSize) / expectedSizeChangePerQualityPoint;
      lowQuality = Math.floor(currentQuality + targetIncrease);
    } else {
      highQuality = currentQuality - 1;
    }

    lastQuality = currentQuality;
    lastSize = currentSize;
    iterations++;
  }

  if (bestSize > 65535) {
    for (let effort = 5; effort <= 9; effort++) {
      for (let quality = 10; quality >= 1; quality--) {
        let compressedBuffer = await image
          .avif({
            quality: quality,
            effort: effort,
            chromaSubsampling: "4:2:0",
          })
          .toBuffer();

        let compressedSize = compressedBuffer.length;

        if (compressedSize <= 65535) {
          bestBuffer = compressedBuffer;
          bestSize = compressedSize;
          break;
        }
      }
      if (bestSize <= 65535) break;
    }

    if (bestSize > 65535) {
      bestBuffer = await image
        .resize({ width: 256, height: 256, fit: "inside" })
        .avif({ quality: 10, effort: 9, chromaSubsampling: "4:2:0" })
        .toBuffer();
    }
  }

  return bestBuffer;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const bucket_name = formData.get("bucket_name") as string;
    const imageList = formData.getAll("imagelist") as File[];
    const image = formData.get("image") as File;
    const video = formData.get("video") as File | null;
    const videoList = formData.getAll("videolist") as File[];
    const pdf = formData.get("pdf") as File | null;
    const pdfList = formData.getAll("pdflist") as File[];
    const message_id = formData.get("message_id") as string | null;
    const activity_id = formData.get("activity_id") as string | null;
    const product_id = formData.get("product_id") as string | null;
    const achievement_id = formData.get("achievement_id") as string | null;
    const MAX_FILE_SIZE_MB = 100; // Max 100MB for video/PDF
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (!image && imageList.length === 0 && !video && videoList.length === 0 && !pdf && pdfList.length === 0) {
      return NextResponse.json({ error: "Image Route- Missing Image " }, { status: 401 });
    }

    if (!bucket_name) {
      return NextResponse.json({ error: "Image Route- Missing bucket_name " }, { status: 400 });
    }

    if (bucket_name !== "profiles" && !message_id && !activity_id && !achievement_id && !product_id) {
      return NextResponse.json(
        { error: "Image Route - Missing message_id, activity_id, achievement_id or product_id" },
        { status: 400 }
      );
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = BigInt(token.user.id);
    const targetSize: number = bucket_name == "profiles" ? 256 : 1280;

    // Handle single video upload
    if (video) {
      if (video.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "Video file too large" }, { status: 400 });
      }

      const videoBuffer = Buffer.from(await video.arrayBuffer());
      const extension = "mp4";
      const filename = `${nanoid(10)}.${extension}`;
      const filePath = `${bucket_name}/${filename}`;

      if (bucket_name === "products") {
        const newProductMedia = await prisma.product_media.create({
          data: {
            name: filePath,
            product_id: parseInt(`${product_id}`),
          },
          select: { id: true },
        });

        await prisma.product_media_blobs.create({
          data: {
            product_media_id: BigInt(newProductMedia.id),
            video_blob: videoBuffer,
          },
        });

        return NextResponse.json({ success: true, filePath }, { status: 201 });
      }
    }

    // Handle multiple video uploads
    if (videoList && videoList.length > 0) {
      const uploadedVideos = [];
      for (const vid of videoList) {
        if (vid.size > MAX_FILE_SIZE_BYTES) continue;
        const videoBuffer = Buffer.from(await vid.arrayBuffer());
        const filename = `${nanoid(10)}.mp4`;
        const filePath = `${bucket_name}/${filename}`;

        if (bucket_name === "products") {
          const newProductMedia = await prisma.product_media.create({
            data: {
              name: filePath,
              product_id: parseInt(`${product_id}`),
            },
            select: { id: true },
          });

          await prisma.product_media_blobs.create({
            data: {
              product_media_id: newProductMedia.id,
              video_blob: videoBuffer,
            },
          });
          
          uploadedVideos.push(filePath);
        }
      }
      
      if (uploadedVideos.length > 0) {
        return NextResponse.json({ 
          success: true, 
          message: `Successfully uploaded ${uploadedVideos.length} videos`,
          uploadedFiles: uploadedVideos 
        }, { status: 201 });
      }
    }

    // Handle single PDF upload
    if (pdf) {
      if (pdf.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "PDF file too large" }, { status: 400 });
      }

      const pdfBuffer = Buffer.from(await pdf.arrayBuffer());
      const extension = "pdf";
      const filename = `${nanoid(10)}.${extension}`;
      const filePath = `${bucket_name}/${filename}`;

      if (bucket_name === "products") {
        const newProductMedia = await prisma.product_media.create({
          data: {
            name: filePath,
            product_id: parseInt(`${product_id}`),
          },
          select: { id: true },
        });

        await prisma.product_media_blobs.create({
          data: {
            product_media_id: newProductMedia.id,
            pdf_blob: pdfBuffer,
          },
        });

        return NextResponse.json({ success: true, filePath }, { status: 201 });
      }
    }

    // Handle multiple PDF uploads
    if (pdfList && pdfList.length > 0) {
      const uploadedPdfs = [];
      for (const doc of pdfList) {
        if (doc.size > MAX_FILE_SIZE_BYTES) continue;
        const pdfBuffer = Buffer.from(await doc.arrayBuffer());
        const filename = `${nanoid(10)}.pdf`;
        const filePath = `${bucket_name}/${filename}`;

        if (bucket_name === "products") {
          const newProductMedia = await prisma.product_media.create({
            data: {
              name: filePath,
              product_id: parseInt(`${product_id}`),
            },
            select: { id: true },
          });

          await prisma.product_media_blobs.create({
            data: {
              product_media_id: newProductMedia.id,
              pdf_blob: pdfBuffer,
            },
          });
          
          uploadedPdfs.push(filePath);
        }
      }
      
      if (uploadedPdfs.length > 0) {
        return NextResponse.json({ 
          success: true, 
          message: `Successfully uploaded ${uploadedPdfs.length} PDFs`,
          uploadedFiles: uploadedPdfs 
        }, { status: 201 });
      }
    }

    // Handle single image upload
    if (image) {
      const imageBlob = await processImageToBlob(image, targetSize);

      if (!imageBlob) {
        return NextResponse.json({ error: "Failed to process image. Missing Blob" }, { status: 500 });
      }

      if (imageBlob.length > 65535) {
        return NextResponse.json(
          { error: "Failed to process image. image exceeded Size despite compression efforts" },
          { status: 500 }
        );
      }

      const extension = "avif";
      const filename = `${nanoid(10)}.${extension}`;
      const filePath = `${bucket_name}/${filename}`;

      if (bucket_name === "profiles") {
        const updatedUser = await prisma.users.update({
          where: { id: userId },
          data: { profile_picture: filePath },
          select: { id: true },
        });

        await prisma.users_blobs.upsert({
          where: { user_id: updatedUser.id },
          update: { image_blob: imageBlob },
          create: { user_id: updatedUser.id, image_blob: imageBlob },
        });
      } else if (bucket_name === "achievements") {
        const newAchievementMedia = await prisma.achievement_media.create({
          data: {
            name: filePath,
            achievement_id: parseInt(`${achievement_id}`),
            added_by: userId,
          },
          select: { id: true },
        });

        await prisma.achievement_media_blobs.create({
          data: {
            achievement_media_id: newAchievementMedia.id,
            image_blob: imageBlob,
          },
        });
      } else if (bucket_name === "activities") {
        const newActivityMedia = await prisma.activity_media.create({
          data: {
            name: filePath,
            activity_id: parseInt(`${activity_id}`),
          },
          select: { id: true },
        });

        await prisma.activity_media_blobs.create({
          data: {
            activity_media_id: newActivityMedia.id,
            image_blob: imageBlob,
          },
        });
      } else if (bucket_name === "products") {
        const newProductMedia = await prisma.product_media.create({
          data: {
            name: filePath,
            product_id: parseInt(`${product_id}`),
          },
          select: { id: true },
        });

        await prisma.product_media_blobs.create({
          data: {
            product_media_id: newProductMedia.id,
            image_blob: imageBlob,
          },
        });
      } else if (bucket_name === "messages") {
        const newMessageMedia = await prisma.message_media.create({
          data: {
            name: filePath,
            message_id: parseInt(`${message_id}`),
          },
          select: { id: true },
        });

        await prisma.message_media_blobs.create({
          data: {
            message_media_id: newMessageMedia.id,
            image_blob: imageBlob,
          },
        });
      } else {
        return NextResponse.json({ error: "Invalid bucket_name" }, { status: 400 });
      }

      return NextResponse.json({ success: true, filePath }, { status: 201 });
    }

    // Handle multiple image uploads
    if (imageList && imageList.length > 0) {
      const imageBlobList = await Promise.all(imageList.map((image) => processImageToBlob(image, targetSize)));
      let atLeastOneUpdated = false;

      for (const [i, imageBlob] of imageBlobList.entries()) {
        if (!imageBlob || imageBlob.length > 65535) {
          continue;
        }

        const extension = "avif";
        const filename = `${nanoid(10)}.${extension}`;
        const filePath = `${bucket_name}/${filename}`;

        try {
          if (bucket_name === "profiles") {
            const updatedUser = await prisma.users.update({
              where: { id: userId },
              data: { profile_picture: filePath },
              select: { id: true },
            });

            await prisma.users_blobs.upsert({
              where: { user_id: updatedUser.id },
              update: { image_blob: imageBlob },
              create: { user_id: updatedUser.id, image_blob: imageBlob },
            });
          } else if (bucket_name === "achievements") {
            const newAchievementMedia = await prisma.achievement_media.create({
              data: {
                name: filePath,
                achievement_id: parseInt(`${achievement_id}`),
                added_by: userId,
              },
              select: { id: true },
            });

            await prisma.achievement_media_blobs.create({
              data: {
                achievement_media_id: newAchievementMedia.id,
                image_blob: imageBlob,
              },
            });
          } else if (bucket_name === "activities") {
            const newActivityMedia = await prisma.activity_media.create({
              data: {
                name: filePath,
                activity_id: parseInt(`${activity_id}`),
              },
              select: { id: true },
            });

            await prisma.activity_media_blobs.create({
              data: {
                activity_media_id: newActivityMedia.id,
                image_blob: imageBlob,
              },
            });
          } else if (bucket_name === "products") {
            const newProductMedia = await prisma.product_media.create({
              data: {
                name: filePath,
                product_id: parseInt(`${product_id}`),
              },
              select: { id: true },
            });

            await prisma.product_media_blobs.create({
              data: {
                product_media_id: newProductMedia.id,
                image_blob: imageBlob,
              },
            });
          } else if (bucket_name === "messages") {
            const newMessageMedia = await prisma.message_media.create({
              data: {
                name: filePath,
                message_id: parseInt(`${message_id}`),
              },
              select: { id: true },
            });

            await prisma.message_media_blobs.create({
              data: {
                message_media_id: newMessageMedia.id,
                image_blob: imageBlob,
              },
            });
          }
          atLeastOneUpdated = true;
        } catch (error) {
          console.error("Error processing image", filename, error);
          continue;
        }
      }

      if (atLeastOneUpdated) {
        return NextResponse.json({ success: true, message: "Images uploaded successfully" }, { status: 201 });
      } else {
        return NextResponse.json({ success: false, message: "No images were uploaded" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "No files to process" }, { status: 400 });

  } catch (error) {
    console.error("Error in images API:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
