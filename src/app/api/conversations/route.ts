import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/conversations - List conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (channel) where.channel = channel
    if (status) where.status = status

    const conversations = await db.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return NextResponse.json({
      status: true,
      data: conversations,
    })
  } catch (error) {
    console.error('Conversations fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Create conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, channel, subject, status, assigneeId } = body

    const conversation = await db.conversation.create({
      data: {
        leadId: leadId || null,
        channel: channel || 'email',
        subject: subject || null,
        status: status || 'open',
        assigneeId: assigneeId || null,
      },
    })

    return NextResponse.json({
      status: true,
      data: conversation,
    }, { status: 201 })
  } catch (error) {
    console.error('Conversation create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
