/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getToken } from "next-auth/jwt";
/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: Get a product by productId
 *     description:  Fetch a product based on the productId.`.
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: The ID of the product
 *         schema:
 *           type: string
 *      
 *     responses:
 *       200:
 *         description: A successful response containing the product data 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: integer
 *                   description: Number of products found
 *                 data:
 *                   type: array
 *                   description: List of products
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The ID of the product
 *                       name:
 *                         type: string
 *                         description: The name of the product
 *                       description:
 *                         type: string
 *                         description: The description of the product
 *                       is_home:
 *                         type: boolean
 *                         description: Indicates if the product is display on home page
 *                       is_active:
 *                         type: boolean
 *                         description: Indicates if the activity is active
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the activity was created
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the activity was last updated
 *                       images:
 *                         type: array
 *                         description: List of images related to the product
 *                         items:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                               description: The URL of the image
 *                       
 *       401:
 *         description: Unauthorized request (missing or invalid credentials)
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal server error
 */


export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const searchParams = request.nextUrl.searchParams;
  const isEvent = searchParams.get("event") === "1";
  const isPost = searchParams.get("post") === "1";
  const { productId } = params;

  const product_id = BigInt(productId);
  if (!product_id) {
    return NextResponse.json({ error: "Params Missing productId" }, { status: 401 });
  }
  
  const filter: Prisma.productsWhereInput = { id: product_id };

  try {
    // Fetch activity with participant-related data
    const products = await prisma.products.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        created_at: true,
        updated_at: true,
        product_media: {
          select: {
            id: true,
            name: true,
            product_media_blobs: {
              select: {
                image_blob: true,
                pdf_blob: true,
                other_blob: true,
              },
            },
          },
        },
        course_materials: {
          select: {
            name: true,
          },
        },
      } as any,
    });

    if (!products || products.length === 0) {
      return NextResponse.json({ items: 0, type: "unknown", data: [] });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const productData = await Promise.all(
      products.map((item: any) => {
        // Only include images with a valid image_blob
        let images = (item.product_media as any[])
          .filter(media => media.product_media_blobs && media.product_media_blobs.image_blob)
          .map((media) => {
            const base64 = Buffer.from(media.product_media_blobs.image_blob).toString('base64');
            return { url: `data:image/jpeg;base64,${base64}`, name: media.name };
          });
        let videos = (item.product_media as { name: string }[]).map((act_media_row: { name: string }) => {
          return { url: `${baseUrl}/api/images/${act_media_row.name}` };
        });
        // PDF list
        let pdfs = (item.product_media as any[])
          .filter((media) => media.name && media.name.toLowerCase().endsWith('.pdf') && media.product_media_blobs && media.product_media_blobs.pdf_blob)
          .map((media) => {
            return {
              name: media.name,
              mediaId: String(media.id),
            };
          });
        // Documents list
        let documents = (item.product_media as any[])
          .filter((media) => {
            const ext = media.name?.toLowerCase().split('.').pop();
            return (
              ["txt", "doc", "docx"].includes(ext) &&
              media.product_media_blobs &&
              media.product_media_blobs.other_blob
            );
          })
          .map((media) => {
            return {
              name: media.name,
              mediaId: String(media.id),
            };
          });
        delete (item as { product_media?: { name: string }[] }).product_media;
        // Pass through course_materials as is
        return {
          ...item,
          images,
          videos,
          course_materials: item.course_materials || [],
          pdfs,
          documents,
        };
      })
    );
    const responseData = {
      items: productData.length,
      data: productData,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}


export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  const { productId } = params;
  const data = await request.json();
  console.log("[API] Received product update payload:", data);
  const { name, description, price } = data;

  if (!name || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const updated = await prisma.products.update({
      where: { id: BigInt(productId) },
      data: { name, description, price: parseFloat(price) },
    });
    // Insert new course material links if not already present
    if (Array.isArray(data.websiteLinks)) {
      for (const link of data.websiteLinks) {
        const existing = await prisma.course_materials.findFirst({
          where: {
            product_id: BigInt(productId),
            name: link,
          },
        });
        if (!existing) {
          await prisma.course_materials.create({
            data: {
              product_id: BigInt(productId),
              name: link,
            },
          });
        }
      }
    }
    return NextResponse.json({ message: "Product updated", product: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}


// PDF download/view endpoint
export async function GET_pdf(request: NextRequest, { params }: { params: { productId: string, mediaId: string } }) {
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



