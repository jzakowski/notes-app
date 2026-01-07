import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags - Fetch all tags for current user
export async function GET(request: NextRequest) {
  try {
    // For now, use the first user (temp user)
    // TODO: Replace with proper authentication
    const user = await prisma.user.findFirst({
      where: { email: 'temp@example.com' }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { noteTags: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    // Remove # if user included it
    const tagName = name.replace(/^#/, '').trim()

    if (tagName.length === 0) {
      return NextResponse.json(
        { error: 'Tag name cannot be empty' },
        { status: 400 }
      )
    }

    if (tagName.length > 50) {
      return NextResponse.json(
        { error: 'Tag name must be 50 characters or less' },
        { status: 400 }
      )
    }

    // For now, use the first user (temp user)
    const user = await prisma.user.findFirst({
      where: { email: 'temp@example.com' }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: {
        userId_name: {
          userId: user.id,
          name: tagName
        }
      }
    })

    if (existingTag) {
      return NextResponse.json(existingTag)
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: {
        name: tagName,
        userId: user.id
      }
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}
