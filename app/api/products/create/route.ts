import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma"; // Make sure you have the Prisma client setup correctly
import { differenceInDays } from 'date-fns';
import logger from "@/lib/logger";

// If you have prisma errors here, it's likely because you need to regenerate the prisma client.
// Run `npx prisma generate` in your terminal.

export async function POST(request: NextRequest){
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const user_id = BigInt(token.user.id);

  try{
    const data = await request.json();
    //logger.info(`Received data for creating product: ${JSON.stringify(data)}`);

    // Destructure the incoming data
    const {
      name,
      description,
      price,
      websiteLinks,
    } = data;

    // Validation (simple example, you can extend it)
    if (!name || !description) {
      logger.error("Missing required fields for creating product: name, description, price");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check user's product plan
    const userPlan = await prisma.users_product.findUnique({ where: { user_id } });
    if (!userPlan || !userPlan.total_product_remaining || userPlan.total_product_remaining <= 0) {
      return NextResponse.json({ error: "No product slots remaining. Please purchase a plan." }, { status: 403 });
    }

    // Create a new product and decrement remaining count in a transaction
    const newProduct = await prisma.$transaction(async (tx) => {
        const product = await tx.products.create({
          data: {
            name,
            description,
            price,
            is_active: 1,
            userId: user_id
          },
        });
        
        if (websiteLinks && Array.isArray(websiteLinks)) {
            for (const link of websiteLinks) {
              const exists = await tx.course_materials.findFirst({
                where: {
                  product_id: product.id,
                  name: link,
                },
              });
              if (!exists) {
                await tx.course_materials.create({
                  data: {
                    product_id: product.id,
                    name: link,
                  },
                });
              }
            }
        }
        // Decrement total_product_remaining
        await tx.users_product.update({
          where: { user_id },
          data: { total_product_remaining: { decrement: 1 } },
        });
        return product;
    });

    //logger.info(`Product created successfully: ${JSON.stringify(newProduct)}`);
    return NextResponse.json({ message: "Product created successfully", product: newProduct });
  }
  catch (error) {
      logger.error(`Error creating event:${error}`);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}