// app/api/popular-activities/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const popularActivityTypesCounts = await prisma.activities.groupBy({
      by: ['activity_type_id'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
      select: {
        activity_type_id: true,
      },
    });
    
    const popularActivityTypeIds = popularActivityTypesCounts.map(
      (item) => item.activity_type_id
    );
    
    const popularActivityTypes = await prisma.ref_activity_types.findMany({
      where: {
        id: {
          in: popularActivityTypeIds,
        },
      },
    });
    
    // Return objects with both id and name instead of just names
    const popularActivities = popularActivityTypes.map(item => ({
      id: item.id,
      name: item.name
    }));
    
    return NextResponse.json(popularActivities);
  } catch (error) {
    console.error('Error fetching popular activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular activities' },
      { status: 500 }
    );
  }
}