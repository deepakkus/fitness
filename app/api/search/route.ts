// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { activities_age_group, Prisma } from "@prisma/client";
// // Define the search API handler

// interface ActivitySearchItem {
//   id: string;
//   title: string;
//   sub_title: string | null;
//   description: string | null;
//   activity_type: string;
//   activity_type_id: bigint;
//   start_time: Date;
//   end_time: Date | null;
//   max_participants: number | null;
//   available_spots: string | number;
//   zip: string;
//   city: string;
//   images: {
//     url: string;
//   }[];
//   peopleInterested: number;
// }

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);

//   // Extract the query parameters
//   const title = searchParams.get("title") || "";
//   const zip = searchParams.get("zip") || "";
//   const city = searchParams.get("city") || "";

//   const categoryType = searchParams.get("activity_type_id") || "";
//   const ageGroup = (searchParams.get("age_group") as activities_age_group) || ""; // Use enum type

//   const fromDate = searchParams.get("fromDate") || "";
//   const toDate = searchParams.get("toDate") || "";

//   // Initialize a filter object
//   let filter: Prisma.activitiesWhereInput = {};

//   // String search for title, sub_title, or description using `search`

//   if (zip) {
//     filter.OR = [{ location: { contains: zip } }];
//   }
//   if (city) {
//     filter.OR = [{ location: { contains: city } }];
//   }
//   if (title) {
//     filter.OR = [
//       { title: { contains: title } },
//       { sub_title: { contains: title } },
//       { description: { contains: title } },
//     ];
//   }
//   if (ageGroup) {
//     filter.age_group = ageGroup;
//   }

//   if (categoryType && categoryType !== "all") {
//     filter.activity_type_id = parseInt(categoryType, 10);
//   }

//   // Add date range filtering on start_time

//   if (fromDate && toDate) {
//     filter.start_time = {
//       gte: new Date(fromDate),
//       lte: new Date(toDate),
//     };
//   } else if (fromDate) {
//     filter.start_time = { gte: new Date(fromDate) };
//   } else if (toDate) {
//     filter.start_time = { lte: new Date(toDate) };
//   }

//   try {
//     // Fetch activities based on the dynamic filters
//     const activities = await prisma.activities.findMany({
//       where: filter,
//       include: {
//         users: true, // Include user information
//         ref_activity_types: true, // Include activity type details
//         activity_media: true, // Include associated media
//         _count: {
//           select: {
//             activity_members: true, // Include member count
//           },
//         },
//       },
//     });

//     // Process activities and map the required data
//     const activityData: ActivitySearchItem[] = activities.map((activity) => {
//       const city = activity.location.split("city: ")[1].split(", zip")[0];
//       const zip = activity.location.split("zip: ")[1];

//       return {
//         id: activity.id.toString(),
//         title: activity.title,
//         sub_title: activity.sub_title,
//         description: activity.description,
//         activity_type: activity.ref_activity_types.name,
//         activity_type_id: activity.activity_type_id,
//         start_time: activity.start_time,
//         end_time: activity.end_time,
//         is_event: activity.is_event,
//         age_group: activity.age_group,
//         added_by: activity.users.name,
//         max_participants: activity.max_participants,
//         available_spots: activity.max_participants ? activity.max_participants - activity._count.activity_members : "∞",
//         zip: zip,
//         city: city,
//         images: activity.activity_media.map((media) => ({
//           url: `/api/images/${media.name}`,
//         })),
//         peopleInterested: activity._count.activity_members,
//       };
//     });

//     // Return the filtered and processed activities
//     return NextResponse.json({ data: activityData });
//   } catch (error) {
//     console.error("Error fetching activities:", error);
//     return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
//   }
// }






import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { activities_age_group, Prisma } from "@prisma/client";
import logger from "@/lib/logger";

interface ActivitySearchItem {
  id: string;
  title: string;
  sub_title: string | null;
  description: string | null;
  activity_type: string;
  activity_type_id: bigint;
  start_time: Date;
  end_time: Date | null;
  max_participants: number | null;
  available_spots: string | number;
  zip: string;
  city: string;
  images: {
    url: string;
  }[];
  peopleInterested: number;
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
   let filter: Prisma.activitiesWhereInput = {
    AND: [],
  } as Prisma.activitiesWhereInput; // Type assertion to help TypeScript


  // Apply title filter with OR logic as before
  if (title) {
    (filter.AND as Prisma.activitiesWhereInput[]).push({ // Type assertion to treat AND as array
      OR: [
        { title: { contains: title } },
        { sub_title: { contains: title } },
        { description: { contains: title } },
        { users: { name: { contains: title } } }, // Search by user name who created the post
      ]
    });
  }

  // Apply other filters with AND logic
  if (zip) {
    (filter.AND as Prisma.activitiesWhereInput[]).push({ location: { contains: `zip: ${zip}`} }); // Type assertion
  }

  if (city) {
    (filter.AND as Prisma.activitiesWhereInput[]).push({ location: { contains: `city: ${city}`} }); // Type assertion
  }

  if (ageGroup) {
    (filter.AND as Prisma.activitiesWhereInput[]).push({ age_group: ageGroup }); // Type assertion
  }

  if (categoryType && categoryType !== "all") {
    (filter.AND as Prisma.activitiesWhereInput[]).push({ activity_type_id: parseInt(categoryType, 10) }); // Type assertion
  }

  if (fromDate && toDate) {
    (filter.AND as Prisma.activitiesWhereInput[]).push({ // Type assertion
      start_time: {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      },
    });
  } else if (fromDate) {
    (filter.AND as Prisma.activitiesWhereInput[]).push({ start_time: { gte: new Date(fromDate) } }); // Type assertion
  } else if (toDate) {
    (filter.AND as Prisma.activitiesWhereInput[]).push({ start_time: { lte: new Date(toDate) } }); // Type assertion
  }

  // Remove the AND array if it's empty (no filters other than potentially title were added)
  if (filter.AND && (filter.AND as Prisma.activitiesWhereInput[]).length === 0) { // Type assertion for length check
    delete filter.AND;
  }


  try {
    const total = await prisma.activities.count({ where: filter });

    const activities = await prisma.activities.findMany({
      where: filter,
      skip: (page - 1) * pageSize,
      take: pageSize,
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

    const activityData: ActivitySearchItem[] = activities.map((activity) => {
      const city = activity.location.split("city: ")[1]?.split(", zip")[0] || ""; // Use optional chaining to avoid errors if city is missing
      const zip = activity.location.split("zip: ")[1] || ""; // Use optional chaining to avoid errors if zip is missing

      return {
        id: activity.id.toString(),
        title: activity.title,
        sub_title: activity.sub_title,
        description: activity.description,
        activity_type: activity.ref_activity_types.name,
        activity_type_id: activity.activity_type_id,
        start_time: activity.start_time,
        end_time: activity.end_time,
        is_event: activity.is_event,
        age_group: activity.age_group,
        added_by: activity.users.name,
        max_participants: activity.max_participants,
        available_spots: activity.max_participants ? activity.max_participants - activity._count.activity_members : "∞",
        zip: zip,
        city: city,
        images: activity.activity_media.map((media) => ({
          url: `/api/images/${media.name}`,
        })),
        peopleInterested: activity._count.activity_members,
      };
    });

    return NextResponse.json({ data: activityData, total, page, pageSize });
  } catch (error) {
    logger.error(`Error fetching activities:${error}`);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}