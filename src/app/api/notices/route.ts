import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/notices - List notices with priority filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const priority = searchParams.get('priority')

    const where: Record<string, unknown> = {}
    if (priority) where.priority = priority

    const result = await db.notice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Notices fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch notices' },
      { status: 500 }
    )
  }
}

// POST /api/notices - Create notice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, priority, postedBy, status } = body

    if (!title || !content) {
      return Response.json(
        { status: false, message: 'Title and content are required' },
        { status: 400 }
      )
    }

    const result = await db.notice.create({
      data: {
        title,
        content,
        priority: priority || 'normal',
        postedBy: postedBy || null,
        status: status || 'active',
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Notice create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create notice' },
      { status: 500 }
    )
  }
}
