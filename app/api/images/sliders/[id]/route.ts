import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const imageName = params.id; // e.g., cZuUfD7LsU.avif

    // Find the slider with the matching image identifier
    const slider = await prisma.slider.findFirst({
      where: {
        image: imageName,
      },
      include: {
        slider_blobs: true,
      },
    });

    if (!slider || !slider.slider_blobs?.image_blob) {
      return NextResponse.json(
        { status: false, message: 'Image not found' },
        { status: 404 }
      );
    }

    // Serve the AVIF image
    return new NextResponse(slider.slider_blobs.image_blob, {
      status: 200,
      headers: {
        'Content-Type': 'image/avif',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to serve image' },
      { status: 500 }
    );
  }
}