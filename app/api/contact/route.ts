
// app/api/contact/route.ts

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import sharp from "sharp";
import nodemailer from 'nodemailer';

// SMTP Email Sending Setup
const smtpOptions = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // Use `true` for 465, `false` for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const SMTP_FROM = process.env.SMTP_FROM;

const transporter = nodemailer.createTransport(smtpOptions);

if (!SMTP_FROM) {
  console.error("SMTP_FROM environment variable is not set.");
}

async function preprocessImageForEmail(imageFile: File): Promise<{ filename: string, content: Buffer } | null> {
  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return { filename: imageFile.name, content: buffer };
  } catch (error) {
    console.error(`Error preparing image for email:`, error);
    return null;
  }
}

async function preprocessImage(imageFile: File, targetSize: number): Promise<sharp.Sharp | null> {
  try {
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    if (metadata.width && metadata.height && (metadata.width > targetSize || metadata.height > targetSize)) {
      return image.resize({
        width: targetSize,
        fit: "inside",
      });
    }
    return image;
  } catch (error) {
    console.error(`Error in preprocessing image:`, error);
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
  // let iterations = 0;
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
    // iterations++;
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

async function processImageToBlob(imageFile: File, targetSize: number = 1280): Promise<Buffer | null> {
  try {
    const image = await preprocessImage(imageFile, targetSize);
    if (!image) {
      return null;
    }

    const preprocessedBuffer = await image.toBuffer();
    const preprocessedSizeKB = preprocessedBuffer.length / 1024;

    const effort = calculateEffort(preprocessedSizeKB);

    const avifBuffer = await image.avif({ quality: 80, effort: effort }).toBuffer();
    let outputSize = avifBuffer.length;

    if (outputSize <= 65535) {
      return avifBuffer;
    }

    const finalBuffer = await binarySearchCompression(image, avifBuffer, outputSize);
    return finalBuffer;
  } catch (error) {
    console.error(`Error processing image ${imageFile.name}:`, error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName = formData.get('fullName') as string | null;
    const relatedHelp = formData.get('relatedHelp') as string | null;
    const email = formData.get('email') as string | null;
    const phoneNumber = formData.get('phoneNumber') as string | null;
    const message = formData.get('message') as string | null;
    const imageList = formData.getAll('images') as File[];

    if (!fullName || !relatedHelp || !email || !phoneNumber || !message) {
      console.error("Validation error: All fields are required");
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Prepare attachments for email (basic processing for sending)
    const emailAttachments = await Promise.all(
      imageList.filter(imageFile => imageFile.size > 0).map(preprocessImageForEmail)
    ).then(results => results.filter(Boolean) as { filename: string, content: Buffer }[]);

    const transporter = nodemailer.createTransport({
  host: "pixel.mxrouting.net",
  port: 587,
  secure: false,
  auth: {
    user: "support@99fitnessfriends.com",
    pass: "HMbyatZRATZq4bKxn8mN",
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP connection successful!");
  }
});

    // Send email first
    if (SMTP_FROM) {
      try {
        const mailOptions = {
          from: SMTP_FROM,
          to: SMTP_FROM,
          subject: `New Contact Form Submission from ${fullName}`,
          html: `
            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone Number:</strong> ${phoneNumber}</p>
            <p><strong>Related Help:</strong> ${relatedHelp}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            ${emailAttachments.length > 0 ? `<p><strong>Attachments:</p><ul>${emailAttachments.map(file => `<li>${file.filename}</li>`).join('')}</ul>` : ''}
          `,
          attachments: emailAttachments.map(att => ({ filename: att.filename, content: att.content })),
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError: any) {
        console.error('Error sending email via SMTP:', emailError);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
      }
    } else {
      console.warn("SMTP_FROM environment variable is not set, skipping email sending.");
    }

    // Proceed with database storage and image compression after sending email
    const contactSubmissionPromise = prisma.contact_submission.create({
      data: {
        fullName,
        relatedHelp,
        email,
        phoneNumber,
        message,
      },
    });

    const imageProcessingPromises = imageList.map(async imageFile => {
      if (imageFile.size > 0) {
        const imageBlob = await processImageToBlob(imageFile);
        if (imageBlob) {
          const filename = `contact/${nanoid(10)}-${imageFile.name}`;
          return prisma.contact_submission_media.create({
            data: {
              name: filename,
              image_blob: imageBlob,
              contactSubmissionId: (await contactSubmissionPromise).id,
            },
          });
        } else {
          console.warn(`Image processing failed for: ${imageFile.name}, skipping database storage.`);
          return null;
        }
      }
      return null;
    });

    // Execute database and image processing concurrently, without blocking the response
    Promise.allSettled([contactSubmissionPromise, ...imageProcessingPromises])
      .then(results => {
        results.forEach(result => {
          if (result.status === 'rejected') {
            console.error('Background task failed:', result.reason);
          }
        });
        // console.log('Database and image processing completed (or failed).');
      });

    return NextResponse.json({ message: 'Message submitted successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing contact form submission:", error);
    return NextResponse.json({ error: `Failed to submit message, ${error}` }, { status: 500 });
  }
}