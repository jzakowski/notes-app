import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userId = 'cmk46g1dk00001l6caypzlz40';
    const categories = await prisma.category.findMany({
      where: { userId }
    });
    return NextResponse.json({ success: true, count: categories.length, categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}
