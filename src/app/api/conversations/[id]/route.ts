import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/conversations/[id] - Get single conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { status: false, message: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: conversation,
    })
  } catch (error) {
    console.error('Conversation fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

// PUT /api/conversations/[id] - Update conversation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.conversation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Conversation not found' },
        { status: 404 }
      )
    }

    const { channel, subject, status, assigneeId } = body
    const updateData: Record<string, unknown> = {}

    if (channel) updateData.channel = channel
    if (subject !== undefined) updateData.subject = subject || null
    if (status) updateData.status = status
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null

    const conversation = await db.conversation.update({
      where: { id },
      data: updateData,
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json({
      status: true,
      data: conversation,
    })
  } catch (error) {
    console.error('Conversation update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.conversation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Conversation not found' },
        { status: 404 }
      )
    }

    await db.conversation.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      data: { id },
    })
  } catch (error) {
    console.error('Conversation delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}
