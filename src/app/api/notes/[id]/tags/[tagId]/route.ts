import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: {
    id: string
    tagId: string
  }
}

// DELETE /api/notes/[id]/tags/[tagId] - Remove a tag from a note
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: noteId, tagId } = params

    // Check if association exists
    const existingAssociation = await prisma.noteTag.findUnique({
      where: {
        noteId_tagId: {
          noteId,
          tagId
        }
      }
    })

    if (!existingAssociation) {
      return NextResponse.json(
        { error: 'Tag is not associated with this note' },
        { status: 404 }
      )
    }

    // Delete association
    await prisma.noteTag.delete({
      where: {
        noteId_tagId: {
          noteId,
          tagId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing tag from note:', error)
    return NextResponse.json(
      { error: 'Failed to remove tag from note' },
      { status: 500 }
    )
  }
}
