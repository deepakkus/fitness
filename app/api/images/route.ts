/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
//import { join } from "path";
//import { writeFile } from "fs/promises";
// app/api/images/route.ts

// In future, consolidate image upload to always expect imageList instead of image-
//
// app/api/images/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { nanoid } from "nanoid";
import sharp from "sharp";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {

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
  const MAX_FILE_SIZE_MB = 100; // Max 20MB for video/PDF
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  //if (!image && !imageList) {
  if (!image && imageList.length === 0 && !video && videoList.length === 0 && !pdf && pdfList.length === 0){
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

  // Get user ID from token

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const userId = BigInt(token.user.id);
  //const userId = BigInt(3);

  // resize profile pics to 256px / and other images to 1280px
  const targetSize: number = bucket_name == "profiles" ? 256 : 1280;

  try {
    if (video) {
      if (video.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "Video file too large" }, { status: 400 });
      }

      const videoBuffer = Buffer.from(await video.arrayBuffer());
      const extension = "mp4"; // You may want to auto-detect based on MIME
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
        console.log("videoBuffer length:", videoBuffer.length);
        // await prisma.product_media_blobs.create({
        //     data: {
        //       product_media_id: newProductMedia.id,
        //       video_blob: videoBuffer,
        //     },
        //   });
        try {
  await prisma.product_media_blobs.create({
    data: {
      product_media_id: BigInt(newProductMedia.id),
      video_blob: videoBuffer,
    },
  });
} catch (err) {
  console.error("Error inserting into product_media_blobs:", err); // ← Log the actual error object
  return NextResponse.json({ error: "DB insert failed", details: err?.message || String(err) }, { status: 500 });
}
        return NextResponse.json({ success: true, filePath }, { status: 201 });
    }

  // Add similar logic for messages, activities, etc., if needed
}
else if (videoList && videoList.length > 0) {
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
    }
  }
}
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

  // Extend for other bucket names as needed
    }
    else if (pdfList && pdfList.length > 0) {
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
    }
  }
}
    if (image) {
      const imageBlob = await processImageToBlob(image, targetSize);

      // logger.info("After processImageToBlob", imageBlob);

      if (!imageBlob) {
        return NextResponse.json({ error: "Failed to process image. Missing Blob" }, { status: 500 });
      }

      if (imageBlob.length > 65535) {
        return NextResponse.json(
          { error: "Failed to process image. image exceeded Size despite compression efforts" },
          { status: 500 }
        );
      }
      // logger.info("After imageBlob.length", imageBlob.length);

      // Generate unique filename using nanoid and bucket name as an identifier
      const extension = "avif";
      const filename = `${nanoid(10)}.${extension}`;
      const filePath = `${bucket_name}/${filename}`;

      // After successful storage, update the database
      if (bucket_name === "profiles") {
        // Update user's profile picture
        const updatedUser = await prisma.users.update({
          where: { id: userId },
          data: { profile_picture: filePath },
          select: { id: true },
        });

        // Insert or update the image_blob in 'users_blobs' table
        await prisma.users_blobs.upsert({
          where: { user_id: updatedUser.id },
          update: { image_blob: imageBlob },
          create: { user_id: updatedUser.id, image_blob: imageBlob },
        });
      } else if (bucket_name === "achievements") {
        // Create new achievement_media entry

        const newAchievementMedia = await prisma.achievement_media.create({
          data: {
            name: filePath,
            achievement_id: parseInt(`${achievement_id}`),
            added_by: userId,
          },
          select: { id: true },
        });

        // Insert the image_blob into 'achievement_media_blobs' table
        await prisma.achievement_media_blobs.create({
          data: {
            achievement_media_id: newAchievementMedia.id,
            image_blob: imageBlob,
          },
        });
      } else if (bucket_name === "activities") {
        // Create new activity_media entry

        // logger.info("Entered activities. bucket_name: ", bucket_name);

        const newActivityMedia = await prisma.activity_media.create({
          data: {
            name: filePath,
            activity_id: parseInt(`${activity_id}`),
          },
          select: { id: true },
        });

        // logger.info("After newActivityMedia");

        // Insert the image_blob into 'activity_media_blobs' table
        await prisma.activity_media_blobs.create({
          data: {
            activity_media_id: newActivityMedia.id,
            image_blob: imageBlob,
          },
        });
        // logger.info("After activity_media_blobs");
      }else if (bucket_name === "products") {
        // Create new activity_media entry

        // logger.info("Entered activities. bucket_name: ", bucket_name);

        const newProductMedia = await prisma.product_media.create({
          data: {
            name: filePath,
            product_id: parseInt(`${product_id}`),
          },
          select: { id: true },
        });

        // logger.info("After newActivityMedia");

        // Insert the image_blob into 'activity_media_blobs' table
        await prisma.product_media_blobs.create({
          data: {
            product_media_id: newProductMedia.id,
            image_blob: imageBlob,
          },
        });
        // logger.info("After activity_media_blobs");
      }
      
      else if (bucket_name === "messages") {
        // message_id is required

        const newMessageMedia = await prisma.message_media.create({
          data: {
            name: filePath,
            message_id: parseInt(`${message_id}`),
          },
          select: { id: true },
        });

        // Insert the image_blob into 'message_media_blobs' table
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
    } else if (imageList) {
      // Convert all images to Buffer concurrently
      const imageBlobList = await Promise.all(imageList.map((image) => processImageToBlob(image, targetSize)));
      // Assume at least one successful image update
      let atLeastOneUpdated = false;

      for (const imageBlob of imageBlobList) {
        if (!imageBlob || imageBlob.length > 65535) continue; // Skip invalid or oversized images

        // Generate unique filename using nanoid and bucket name as an identifier
        const extension = "avif";
        const filename = `${nanoid(10)}.${extension}`;
        const filePath = `${bucket_name}/${filename}`;
        try {
          // After successful storage, update the database
          if (bucket_name === "profiles") {
            // Update user's profile picture
            const updatedUser = await prisma.users.update({
              where: { id: userId },
              data: { profile_picture: filePath },
              select: { id: true },
            });

            // Insert or update the image_blob in 'users_blobs' table
            await prisma.users_blobs.upsert({
              where: { user_id: updatedUser.id },
              update: { image_blob: imageBlob },
              create: { user_id: updatedUser.id, image_blob: imageBlob },
            });
          } else if (bucket_name === "achievements") {
            // Create new achievement_media entry

            const newAchievementMedia = await prisma.achievement_media.create({
              data: {
                name: filePath,
                achievement_id: parseInt(`${achievement_id}`),
                added_by: userId,
              },
              select: { id: true },
            });

            // Insert the image_blob into 'achievement_media_blobs' table
            await prisma.achievement_media_blobs.create({
              data: {
                achievement_media_id: newAchievementMedia.id,
                image_blob: imageBlob,
              },
            });
          } else if (bucket_name === "activities") {
            // Create new activity_media entry

            const newActivityMedia = await prisma.activity_media.create({
              data: {
                name: filePath,
                activity_id: parseInt(`${activity_id}`),
              },
              select: { id: true },
            });

            // Insert the image_blob into 'activity_media_blobs' table
            await prisma.activity_media_blobs.create({
              data: {
                activity_media_id: newActivityMedia.id,
                image_blob: imageBlob,
              },
            });
          } else if (bucket_name === "messages") {
            // message_id is required

            const newMessageMedia = await prisma.message_media.create({
              data: {
                name: filePath,
                message_id: parseInt(`${message_id}`),
              },
              select: { id: true },
            });

            // Insert the image_blob into 'message_media_blobs' table
            await prisma.message_media_blobs.create({
              data: {
                message_media_id: newMessageMedia.id,
                image_blob: imageBlob,
              },
            });
          }
          atLeastOneUpdated = true; // Mark as successful if we store at least one image
        } catch (error) {
          console.error(`Error processing image ${filename}:`, error);
          continue; // Continue processing remaining images if there's an error with one
        }
      }
      // Return response based on at least one successful image update
      if (atLeastOneUpdated) {
        return NextResponse.json({ success: true, message: "Images uploaded successfully" }, { status: 201 });
      } else {
        return NextResponse.json({ success: false, message: "No images were uploaded" }, { status: 500 });
      }
    }
  } catch (error) {
    logger.error("Error uploading image:", error);
    return NextResponse.json({ success: false, error: "Error uploading image", error_data: error }, { status: 500 });
  }
}

async function processImageToBlob(imageFile: File, targetSize: number = 1280): Promise<Buffer | null> {
  try {
    // Preprocess the image (resize if necessary)
    const image = await preprocessImage(imageFile, targetSize);
    if (!image) return null;

    // Get the size of the preprocessed image
    const preprocessedBuffer = await image.toBuffer();
    const preprocessedSizeKB = preprocessedBuffer.length / 1024;

    // Adjust the effort level for AVIF compression based on the preprocessed size
    const effort = calculateEffort(preprocessedSizeKB);

    // Convert to AVIF with the calculated effort
    const avifBuffer = await image.avif({ quality: 80, effort: effort }).toBuffer();
    let outputSize = avifBuffer.length;


    // If the AVIF buffer is already small enough (below 64KB), return it
    if (outputSize <= 65535) {
      return avifBuffer;
    }

    // Perform binary search to further compress the image if necessary
    let finalBuffer = await binarySearchCompression(image, avifBuffer, outputSize);
    return finalBuffer;
  } catch (error) {
    console.error("Error processing the image:", error);
    return null;
  }
}

async function preprocessImage(imageFile: File, targetSize: number): Promise<sharp.Sharp | null> {
  try {
    // Convert the FormData File to Buffer for sharp
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Only resize if the image is larger than the targetSize
    if (metadata.width && metadata.height && (metadata.width > targetSize || metadata.height > targetSize)) {
      return image.resize({
        width: targetSize,
        fit: "inside", // Preserve aspect ratio and fit within the target size
      });
    }
    return image;
  } catch (error) {
    return null;
  }
}

function calculateEffort(sizeKB: number): number {
  if (sizeKB <= 62) return 4;
  if (sizeKB >= 1024) return 9;
  return Math.round(1 + ((sizeKB - 62) / (1024 - 62)) * (9 - 1));
}

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
  //let useYuv = initialSize >= 124 * 1024;
  let useYuv = false;
  let lastQuality = 80;
  let lastSize = initialSize;

  while (lowQuality <= highQuality) {
    const currentQuality = Math.floor((lowQuality + highQuality) / 2);

    // Add YUV 4:2:0 chroma subsampling -degrades colour quality improves conversation speed
    const chromaSubsampling = useYuv ? "4:2:0" : undefined;

    // Try to encode with the current quality
    let currentBuffer: Buffer = await image
      .avif({
        quality: currentQuality,
        effort: 5,
        chromaSubsampling: chromaSubsampling,
      })
      .toBuffer();

    let currentSize = currentBuffer.length;

    if (currentSize <= 65535 && currentSize >= 50 * 1024) {
      // Found a solution within the size range (50KB-64KB), stop searching
      bestBuffer = currentBuffer;
      bestSize = currentSize;
      break;
    } else if (currentSize < 50 * 1024) {
      // If the size goes below 50KB, adjust the quality increase using size difference logic
      const sizeDelta: number = lastSize - currentSize;
      const qualityDelta: number =
        currentSize < 30 * 1024 ? lastQuality - currentQuality : (lastQuality - currentQuality) / 2;
      const expectedSizeChangePerQualityPoint: number = sizeDelta / qualityDelta;

      // Calculate the expected quality increase to bring size within range
      const targetIncrease: number = (50 * 1024 - currentSize) / expectedSizeChangePerQualityPoint;
      lowQuality = Math.floor(currentQuality + targetIncrease);
    } else {
      // If the size exceeds 64KB, decrease the quality
      highQuality = currentQuality - 1;
    }

    lastQuality = currentQuality;
    lastSize = currentSize;
    iterations++;
  }

  // If after binary search the size is still greater than 64KB, apply more aggressive measures
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
