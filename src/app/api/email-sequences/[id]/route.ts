import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/email-sequences/[id] - Get single email sequence
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sequence = await db.emailSequence.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { order: 'asc' } },
        enrollments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!sequence) {
      return NextResponse.json(
        { status: false, message: 'Email sequence not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: sequence,
    })
  } catch (error) {
    console.error('Email sequence fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch email sequence' },
      { status: 500 }
    )
  }
}

// PUT /api/email-sequences/[id] - Update email sequence
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.emailSequence.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Email sequence not found' },
        { status: 404 }
      )
    }

    const { name, description, triggerType, status } = body
    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description || null
    if (triggerType) updateData.triggerType = triggerType
    if (status) updateData.status = status

    const sequence = await db.emailSequence.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      status: true,
      data: sequence,
    })
  } catch (error) {
    console.error('Email sequence update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update email sequence' },
      { status: 500 }
    )
  }
}

// DELETE /api/email-sequences/[id] - Delete email sequence
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.emailSequence.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Email sequence not found' },
        { status: 404 }
      )
    }

    await db.emailSequence.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      data: { id },
    })
  } catch (error) {
    console.error('Email sequence delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete email sequence' },
      { status: 500 }
    )
  }
}
