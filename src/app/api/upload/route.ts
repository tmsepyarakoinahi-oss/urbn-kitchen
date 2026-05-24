import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_MIME_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// POST /api/upload - Image upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { status: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { status: false, message: 'Invalid file type. Only jpg, jpeg, png, webp, and gif images are allowed' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { status: false, message: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Get file extension
    const originalName = file.name.toLowerCase()
    const extension = path.extname(originalName).toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { status: false, message: 'Invalid file extension. Only jpg, jpeg, png, webp, and gif are allowed' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}${extension}`

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Write file to disk
    const filePath = path.join(uploadsDir, uniqueFilename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Return the URL path
    const urlPath = `/uploads/${uniqueFilename}`

    return NextResponse.json({
      status: true,
      message: 'File uploaded successfully',
      data: {
        url: urlPath,
        filename: uniqueFilename,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
