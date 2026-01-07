import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all notes
export async function GET() {
  try {
    // For now, get all notes (authentication will be added later)
    const notes = await prisma.note.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        category: true,
        noteTags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

// POST create new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, categoryId } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // For now, use a temporary user ID (authentication will be added later)
    // Create or get a temporary user
    let tempUser = await prisma.user.findFirst({
      where: { email: 'temp@example.com' }
    })

    if (!tempUser) {
      tempUser = await prisma.user.create({
        data: {
          email: 'temp@example.com',
          password: 'temp', // Will be replaced with proper auth
          name: 'Temp User'
        }
      })
    }

    const note = await prisma.note.create({
      data: {
        title,
        content: content || '',
        userId: tempUser.id,
        categoryId: categoryId || null
      },
      include: {
        category: true,
        noteTags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
