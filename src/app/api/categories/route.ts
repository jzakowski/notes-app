import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - Fetch all categories for the current user
export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual user ID from session
    const userId = 'cmk46g1dk00001l6caypzlz40';

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    // TODO: Replace with actual user ID from session
    const userId = 'cmk46g1dk00001l6caypzlz40';

    const body = await request.json();
    const { name, color } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: 'Category name must be less than 50 characters' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await prisma.category.findUnique({
      where: {
        userId_name: {
          userId,
          name: name.trim()
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        color: color || '#3B82F6',
        userId
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
