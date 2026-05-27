import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pipelines/[id] - Get single pipeline
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pipeline = await db.pipeline.findUnique({
      where: { id },
      include: {
        deals: {
          include: {
            lead: { select: { id: true, name: true, email: true } },
            assignee: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!pipeline) {
      return NextResponse.json(
        { status: false, message: 'Pipeline not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: pipeline,
    })
  } catch (error) {
    console.error('Pipeline fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch pipeline' },
      { status: 500 }
    )
  }
}

// PUT /api/pipelines/[id] - Update pipeline
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.pipeline.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Pipeline not found' },
        { status: 404 }
      )
    }

    const { name, description, isDefault, stages, status } = body
    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description || null
    if (isDefault !== undefined) {
      updateData.isDefault = isDefault
      // If setting as default, unset others
      if (isDefault) {
        await db.pipeline.updateMany({
          where: { isDefault: true, id: { not: id } },
          data: { isDefault: false },
        })
      }
    }
    if (stages) updateData.stages = stages
    if (status) updateData.status = status

    const pipeline = await db.pipeline.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      status: true,
      data: pipeline,
    })
  } catch (error) {
    console.error('Pipeline update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update pipeline' },
      { status: 500 }
    )
  }
}

// DELETE /api/pipelines/[id] - Delete pipeline
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.pipeline.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Pipeline not found' },
        { status: 404 }
      )
    }

    await db.pipeline.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      data: { id },
    })
  } catch (error) {
    console.error('Pipeline delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete pipeline' },
      { status: 500 }
    )
  }
}
