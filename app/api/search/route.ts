import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { activities_age_group, Prisma } from "@prisma/client";

interface ActivitySearchItem {
  id: string;
  title: string;
  sub_title: string | null;
  description: string | null;
  activity_type: string;
  activity_type_id: string;
  start_time: string;
  age_group: string | null;
  added_by: string | null;
  is_event: boolean;
  created_at: string;
  end_time: string;
  max_participants: number | null;
  available_spots: number;
  zip: string;
  city: string;
  images: { url: string }[];
  peopleInterested: number;
}

interface ProductSearchItem {
  id: string;
  name: string | null;
  description: string | null;
  price: number;
  created_at: string;
  images: { url: string }[];
  type: 'product';
  added_by: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  // Extract the query parameters
  const title = searchParams.get("title") || "";
  const zip = searchParams.get("zip") || "";
  const city = searchParams.get("city") || "";

  const categoryType = searchParams.get("activity_type_id") || "";
  const ageGroup = (searchParams.get("age_group") as activities_age_group) || "";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  // Initialize a filter object with AND condition
  let activityFilter: Prisma.activitiesWhereInput = {
    AND: [],
  } as Prisma.activitiesWhereInput;

  // Initialize product filter
  let productFilter: Prisma.productsWhereInput = {
    AND: [],
  } as Prisma.productsWhereInput;

  // Apply title filter with OR logic for activities
  if (title) {
    (activityFilter.AND as Prisma.activitiesWhereInput[]).push({
      OR: [
        { title: { contains: title } },
        { sub_title: { contains: title } },
        { description: { contains: title } },
        { users: { name: { contains: title } } },
      ]
    });

    // Apply title filter for products
    (productFilter.AND as Prisma.productsWhereInput[]).push({
      OR: [
        { name: { contains: title } },
        { description: { contains: title } },
      ]
    });
  }

  // Apply other filters with AND logic for activities
  if (zip) {
    (activityFilter.AND as Prisma.activitiesWhereInput[]).push({ location: { contains: `zip: ${zip}`} });
  }

  if (city) {
    (activityFilter.AND as Prisma.activitiesWhereInput[]).push({ location: { contains: `city: ${city}`} });
  }

  if (ageGroup) {
    (activityFilter.AND as Prisma.activitiesWhereInput[]).push({ age_group: ageGroup });
  }

  if (categoryType && categoryType !== "all") {
    (activityFilter.AND as Prisma.activitiesWhereInput[]).push({ activity_type_id: parseInt(categoryType, 10) });
  }

  if (fromDate && toDate) {
    (activityFilter.AND as Prisma.activitiesWhereInput[]).push({
      start_time: {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      },
    });
  } else if (fromDate) {
    (activityFilter.AND as Prisma.activitiesWhereInput[]).push({ start_time: { gte: new Date(fromDate) } });
  } else if (toDate) {
    (activityFilter.AND as Prisma.activitiesWhereInput[]).push({ start_time: { lte: new Date(toDate) } });
  }

  // Remove the AND array if it's empty for activities
  if (activityFilter.AND && (activityFilter.AND as Prisma.activitiesWhereInput[]).length === 0) {
    delete activityFilter.AND;
  }

  // Remove the AND array if it's empty for products
  if (productFilter.AND && (productFilter.AND as Prisma.productsWhereInput[]).length === 0) {
    delete productFilter.AND;
  }

  try {
    // Fetch activities (without pagination to get all results)
    const activities = await prisma.activities.findMany({
      where: activityFilter,
      include: {
        users: true,
        ref_activity_types: true,
        activity_media: true,
        _count: {
          select: {
            activity_members: true,
          },
        },
      },
    });

    // Fetch products (without pagination to get all results)
    let products = await prisma.products.findMany({
      where: productFilter,
      include: {
        product_media: true,
      },
    });

    // If searching by user name, also search for products by user
    if (title) {
      // Find users whose names contain the search term
      const matchingUsers = await prisma.users.findMany({
        where: {
          name: { contains: title }
        },
        select: {
          id: true
        }
      });

      if (matchingUsers.length > 0) {
        const userIds = matchingUsers.map(user => user.id);
        // Add products created by these users to the search results
        const userProducts = await prisma.products.findMany({
          where: {
            userId: { in: userIds }
          },
          include: {
            product_media: true,
          },
        });
        
        // Merge with existing products, avoiding duplicates
        const existingProductIds = new Set(products.map(p => p.id.toString()));
        const newProducts = userProducts.filter(p => !existingProductIds.has(p.id.toString()));
        products.push(...newProducts);
        
        // Remove duplicates from the final products array
        const uniqueProducts = products.filter((product, index, self) => 
          index === self.findIndex(p => p.id.toString() === product.id.toString())
        );
        products = uniqueProducts;
      }
    }

    // Fetch user information for products
    const productUserIds = products.map(product => product.userId);
    const productUsers = await prisma.users.findMany({
      where: {
        id: { in: productUserIds }
      },
      select: {
        id: true,
        name: true,
      }
    });

    // Create a map of userId to user name
    const userMap = new Map(productUsers.map(user => [user.id.toString(), user.name]));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Process activities
    const activityData: ActivitySearchItem[] = activities.map((activity) => {
      const city = activity.location.split("city: ")[1]?.split(", zip")[0] || "";
      const zip = activity.location.split("zip: ")[1] || "";

      return {
        id: activity.id.toString(),
        title: activity.title,
        sub_title: activity.sub_title,
        description: activity.description,
        activity_type: activity.ref_activity_types.name,
        activity_type_id: activity.activity_type_id.toString(),
        start_time: activity.start_time.toISOString(),
        end_time: activity.end_time?.toISOString() || "",
        is_event: activity.is_event,
        age_group: activity.age_group || null,
        added_by: activity.users.name,
        max_participants: activity.max_participants,
        available_spots: activity.max_participants ? activity.max_participants - activity._count.activity_members : 0,
        zip: zip,
        city: city,
        images: activity.activity_media.map((media) => ({
          url: `${baseUrl}/api/images/${media.name}`,
        })),
        peopleInterested: activity._count.activity_members,
        created_at: activity.created_at.toISOString(),
      };
    });

    // Process products
    const productData: ProductSearchItem[] = products.map((product) => {
      const images = product.product_media.map((media) => ({
        url: `${baseUrl}/api/images/${media.name}`,
      }));

      const userName = userMap.get(product.userId.toString()) || 'Unknown User';

      return {
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: Number(product.price),
        created_at: product.created_at.toISOString(),
        images: images,
        type: 'product',
        added_by: userName,
      };
    });

    // Combine and sort results by creation date (newest first)
    const combinedResults = [...activityData, ...productData].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Apply pagination to combined results
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = combinedResults.slice(startIndex, endIndex);

    return NextResponse.json({ 
      data: paginatedResults,
      pageSize: pageSize,
      total: combinedResults.length,
      hasMore: endIndex < combinedResults.length
    });
  } catch (error) {
    console.error("Error fetching search results:", error);
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}