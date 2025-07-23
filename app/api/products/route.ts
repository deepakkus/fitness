import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

/**
 * @swagger
 * /api/products:
 * get:
 * description: Get a list of events for the authenticated user
 * responses:
 * 200:
 * description: Returns a list of events
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * items:
 * type: number
 * type:
 * type: string
 * data:
 * type: array
 * items:
 * type: object
 * properties:
 * id:
 * type: number
 * name:
 * type: string
 * description:
 * type: string
 * price:
 * type: number
 * is_home:
 * type: boolean
 * is_active:
 * type: boolean
 * userId:
 * type: number
 * created_at:
 * type: string
 * format: date-time
 * updated_at:
 * type: string
 * format: date-time
 * images:
 * type: array
 * items:
 * type: object
 * properties:
 * url:
 * type: string
 * 401:
 * description: Unauthorized
 * 500:
 * description: Internal Server Error
 */

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const { searchParams } = new URL(request.url);
  const userIdFromQuery = searchParams.get("userId");

  let user_id;

  if (userIdFromQuery) {
    user_id = BigInt(userIdFromQuery);
  } else {
    if (!token || !token.user || !token.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    user_id = BigInt(token.user.id);
  }

  try {
    const productsCount = await prisma.products.findMany({
      where: { userId: user_id },
      include: {
        product_media: {
          include: {
            product_media_blobs: true,
          },
        },
      },
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const productData = productsCount.map((item) => {
      const images = item.product_media
        .filter(media => media.product_media_blobs && media.product_media_blobs.image_blob)
        .map((media) => {
          const base64 = Buffer.from(media.product_media_blobs.image_blob).toString('base64');
          return { url: `data:image/jpeg;base64,${base64}`, name: media.name };
        });
      
      return {
        id: item.id,
        name: item.name,
        price:item.price,
        is_active:item.is_active,
        is_home: item.is_home,
        description: item.description,
        created_at: item.created_at,
        updated_at: item.updated_at,
        images: images,
      };
    });

    const responseData = { items: productData.length, data: productData };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error fetching events:", error);

    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
