import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { postId: string } }) {
  const { postId } = params;
  const body = await request.json();
  const { is_active } = body;
  if (typeof is_active !== 'boolean') {
    return NextResponse.json({ error: 'is_active must be boolean' }, { status: 400 });
  }
  try {
    const updated = await prisma.activities.update({
      where: { id: BigInt(postId) },
      data: { is_active },
    });
    return NextResponse.json({ success: true, post: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update status', details: (err as any)?.message || String(err) }, { status: 500 });
  }
} 