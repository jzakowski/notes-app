import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories/[id] - Fetch a single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Replace with actual user ID from session
    const userId = 'cmk46g1dk00001l6caypzlz40';

    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if category exists and belongs to user
    const existing = await prisma.category.findFirst({
      where: {
        id: params.id,
        userId
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing category
    if (name.trim() !== existing.name) {
      const nameConflict = await prisma.category.findUnique({
        where: {
          userId_name: {
            userId,
            name: name.trim()
          }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        color: color || existing.color
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Replace with actual user ID from session
    const userId = 'cmk46g1dk00001l6caypzlz40';

    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        userId
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Delete category (notes will automatically have categoryId set to null)
    await prisma.category.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
