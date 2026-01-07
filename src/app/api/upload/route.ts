import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Debug logging
    console.log('Upload request - File name:', file.name)
    console.log('Upload request - File type:', file.type)
    console.log('Upload request - File size:', file.size)

    // Determine if file is image or video
    let isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    let isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    // Fallback: check file extension if mime type is not detected
    if (!isImage && !isVideo) {
      const ext = file.name.toLowerCase().split('.').pop()
      if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp') {
        isImage = true
        console.log('Upload - Detected image from extension:', ext)
      } else if (ext === 'mp4' || ext === 'mov' || ext === 'webm') {
        isVideo = true
        console.log('Upload - Detected video from extension:', ext)
      }
    }

    // Validate file type
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, WEBP, MP4, MOV, and WEBM are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size based on type
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Image size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: 'Video size exceeds 100MB limit' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const uniqueFilename = `${uuidv4()}${fileExtension}`
    const filepath = path.join(uploadsDir, uniqueFilename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the URL to access the file
    const fileUrl = `/uploads/${uniqueFilename}`

    return NextResponse.json({
      url: fileUrl,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      category: isVideo ? 'video' : 'image'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
