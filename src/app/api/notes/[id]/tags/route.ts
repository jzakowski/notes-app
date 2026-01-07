import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: {
    id: string
  }
}

// GET /api/notes/[id]/tags - Get all tags for a note
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params

    const noteTags = await prisma.noteTag.findMany({
      where: { noteId: id },
      include: {
        tag: true
      }
    })

    const tags = noteTags.map(nt => nt.tag)

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching note tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note tags' },
      { status: 500 }
    )
  }
}

// POST /api/notes/[id]/tags - Add a tag to a note
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: noteId } = params
    const body = await request.json()
    const { tagId } = body

    // Validate input
    if (!tagId) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      )
    }

    // Check if note exists
    const note = await prisma.note.findUnique({
      where: { id: noteId }
    })

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: tagId }
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Check if association already exists
    const existingAssociation = await prisma.noteTag.findUnique({
      where: {
        noteId_tagId: {
          noteId,
          tagId
        }
      }
    })

    if (existingAssociation) {
      return NextResponse.json(tag)
    }

    // Create association
    const noteTag = await prisma.noteTag.create({
      data: {
        noteId,
        tagId
      },
      include: {
        tag: true
      }
    })

    return NextResponse.json(noteTag.tag, { status: 201 })
  } catch (error) {
    console.error('Error adding tag to note:', error)
    return NextResponse.json(
      { error: 'Failed to add tag to note' },
      { status: 500 }
    )
  }
}
