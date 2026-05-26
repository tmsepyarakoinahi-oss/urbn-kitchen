import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pipelines - List pipelines
export async function GET(request: NextRequest) {
  try {
    const pipelines = await db.pipeline.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { deals: true } },
      },
    })

    return NextResponse.json({
      status: true,
      data: pipelines,
    })
  } catch (error) {
    console.error('Pipelines fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch pipelines' },
      { status: 500 }
    )
  }
}

// POST /api/pipelines - Create pipeline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, isDefault, stages } = body

    if (!name) {
      return NextResponse.json(
        { status: false, message: 'Pipeline name is required' },
        { status: 400 }
      )
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.pipeline.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    const pipeline = await db.pipeline.create({
      data: {
        name,
        description: description || null,
        isDefault: isDefault || false,
        stages: stages || '[]',
      },
    })

    return NextResponse.json({
      status: true,
      data: pipeline,
    }, { status: 201 })
  } catch (error) {
    console.error('Pipeline create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create pipeline' },
      { status: 500 }
    )
  }
}
