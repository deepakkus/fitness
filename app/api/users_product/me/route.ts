import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
 
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = BigInt(session.user.id);
  const userProduct = await prisma.users_product.findUnique({ where: { user_id: userId } });
  
  if (!userProduct) {
    return NextResponse.json({ hasPlan: false });
  }
  return NextResponse.json({
    hasPlan: true,
    total_product_remaining: userProduct.total_product_remaining,
    total_product: userProduct.total_product,
  });
}