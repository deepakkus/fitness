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
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sort = searchParams.get('sort') || 'newest';
    const orderBy = sort === 'oldest' ? { created_at: 'asc' } : { created_at: 'desc' };

    const productsCount = await prisma.products.findMany({
      where: { is_active: 1 },
      include: {
        product_media: true, // Media associated with the activity
      },
      skip: offset,
      take: limit,
      orderBy,
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const productData = productsCount.map((item) => {
      const images = item.product_media.map((media) => {
        return { url: `${baseUrl}/api/images/${media.name}` };
      });

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        is_active: item.is_active,
        is_home: item.is_home,
        description: item.description,
        created_at: item.created_at,
        images: images,
      };
    });

    const responseData = { items: productData.length, data: productData };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error fetching products:", error);

    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
