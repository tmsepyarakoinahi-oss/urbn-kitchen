import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/notices/[id] - Fetch single notice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.notice.findUnique({ where: { id } })

    if (!result) {
      return Response.json(
        { status: false, message: 'Notice not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Notice fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch notice' },
      { status: 500 }
    )
  }
}

// PUT /api/notices/[id] - Update notice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content, priority, postedBy, status } = body

    const existing = await db.notice.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Notice not found' },
        { status: 404 }
      )
    }

    const result = await db.notice.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(priority !== undefined && { priority }),
        ...(postedBy !== undefined && { postedBy }),
        ...(status !== undefined && { status }),
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Notice update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update notice' },
      { status: 500 }
    )
  }
}

// DELETE /api/notices/[id] - Delete notice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.notice.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Notice not found' },
        { status: 404 }
      )
    }

    await db.notice.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Notice delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete notice' },
      { status: 500 }
    )
  }
}
