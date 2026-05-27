import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/email-sequences - List email sequences
export async function GET(request: NextRequest) {
  try {
    const sequences = await db.emailSequence.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { steps: true, enrollments: true } },
      },
    })

    return NextResponse.json({
      status: true,
      data: sequences,
    })
  } catch (error) {
    console.error('Email sequences fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch email sequences' },
      { status: 500 }
    )
  }
}

// POST /api/email-sequences - Create email sequence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, triggerType, status } = body

    if (!name) {
      return NextResponse.json(
        { status: false, message: 'Sequence name is required' },
        { status: 400 }
      )
    }

    const sequence = await db.emailSequence.create({
      data: {
        name,
        description: description || null,
        triggerType: triggerType || 'manual',
        status: status || 'active',
      },
    })

    return NextResponse.json({
      status: true,
      data: sequence,
    }, { status: 201 })
  } catch (error) {
    console.error('Email sequence create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create email sequence' },
      { status: 500 }
    )
  }
}
