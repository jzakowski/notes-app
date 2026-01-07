import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteS3File } from '@/lib/s3'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// GET single note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        noteTags: {
          include: {
            tag: true
          }
        },
        attachments: true
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT update note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, content, categoryId } = body

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must not be empty' },
          { status: 400 }
        )
      }
      if (title.length > 200) {
        return NextResponse.json(
          { error: 'Title must be less than 200 characters' },
          { status: 400 }
        )
      }
    }

    const note = await prisma.note.update({
      where: { id: params.id },
      data: {
        title,
        content: content || '',
        categoryId: categoryId || null,
        updatedAt: new Date()
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

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { error: 'Failed to update note', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get note with attachments before deleting
    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: { attachments: true }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Delete all attachments from S3 or local storage
    for (const attachment of note.attachments) {
      const url = attachment.url

      // Try S3 deletion first
      const s3Deleted = await deleteS3File(url)

      // If S3 deletion failed or returned false, try local file deletion
      if (!s3Deleted && url.startsWith('/uploads/')) {
        const filename = url.replace('/uploads/', '')
        const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

        if (existsSync(filepath)) {
          try {
            await unlink(filepath)
            console.log(`Deleted local file: ${filepath}`)
          } catch (error) {
            console.error(`Failed to delete local file: ${filepath}`, error)
          }
        }
      }
    }

    // Delete the note (attachments will be cascade deleted from DB)
    await prisma.note.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
