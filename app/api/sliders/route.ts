import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import sharp from 'sharp';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    // Fetch active sliders (not deleted)
    const sliders = await prisma.slider.findMany({
      where: {
        deleted_at: null,
      },
    });

    // Randomly select up to 6 sliders
    const shuffledSliders = sliders.sort(() => Math.random() - 0.5);
    const selectedSliders = shuffledSliders.slice(0, 6);

    // Construct image URLs
    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/images/sliders`;
    const slidersWithImages = selectedSliders.map((slider) => ({
      id: slider.id,
      title: slider.title,
      description: slider.description,
      category: slider.category,
      subcategory: slider.subcategory,
      images: {
        url: `${baseUrl}/${slider.image}`, // e.g., http://localhost:3000/api/images/sliders/cZuUfD7LsU.avif
      },
      created_at: slider.created_at,
      updated_at: slider.updated_at,
    }));

    return NextResponse.json({
      status: true,
      data: slidersWithImages,
    });
  } catch (error) {
    console.error('Error fetching sliders:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch sliders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const category = formData.get('category') as string | null;
    const subcategory = formData.get('subcategory') as string | null;
    const image = formData.get('image') as File;

    if (!title || !image) {
      return NextResponse.json(
        { status: false, message: 'Title and image are required' },
        { status: 400 }
      );
    }

    // Generate unique image identifier
    const imageId = nanoid(10); // e.g., cZuUfD7LsU
    const imageName = `${imageId}.avif`;

    // Read image as ArrayBuffer
    const imageBuffer = await image.arrayBuffer();

    // Convert and compress to AVIF
    const avifBuffer = await sharp(Buffer.from(imageBuffer))
      .resize({ width: 1920, height: 1080, fit: 'inside' })
      .avif({ quality: 80 })
      .toBuffer();

    console.log('AVIF image buffer size:', avifBuffer.length);

    // Create slider and blob in a transaction
    const newSlider = await prisma.$transaction(async (tx) => {
      // Create slider record
      const slider = await tx.slider.create({
        data: {
          title,
          description,
          category,
          subcategory,
          image: imageName,
        },
      });

      // Create blob record
      await tx.slider_blobs.create({
        data: {
          slider_id: slider.id,
          image_blob: avifBuffer,
        },
      });

      return slider;
    });

    return NextResponse.json({
      status: true,
      message: 'Slider created successfully',
      data: {
        id: newSlider.id,
        title: newSlider.title,
        description: newSlider.description,
        category: newSlider.category,
        subcategory: newSlider.subcategory,
        images: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/images/sliders/${imageName}`,
        },
        created_at: newSlider.created_at,
        updated_at: newSlider.updated_at,
      },
    });
  } catch (error) {
    console.error('Error creating slider:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create slider' },
      { status: 500 }
    );
  }
}