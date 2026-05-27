import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pipeline-deals/[id] - Get single pipeline deal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const deal = await db.pipelineDeal.findUnique({
      where: { id },
      include: {
        pipeline: { select: { id: true, name: true, stages: true } },
        lead: { select: { id: true, name: true, email: true, phone: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    })

    if (!deal) {
      return NextResponse.json(
        { status: false, message: 'Pipeline deal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: deal,
    })
  } catch (error) {
    console.error('Pipeline deal fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch pipeline deal' },
      { status: 500 }
    )
  }
}

// PUT /api/pipeline-deals/[id] - Update pipeline deal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.pipelineDeal.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Pipeline deal not found' },
        { status: 404 }
      )
    }

    const { pipelineId, leadId, title, value, stage, probability, assigneeId, closeDate, status } = body
    const updateData: Record<string, unknown> = {}

    if (pipelineId) updateData.pipelineId = pipelineId
    if (leadId !== undefined) updateData.leadId = leadId || null
    if (title) updateData.title = title
    if (value !== undefined) updateData.value = value
    if (stage) updateData.stage = stage
    if (probability !== undefined) updateData.probability = probability
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null
    if (closeDate !== undefined) updateData.closeDate = closeDate ? new Date(closeDate) : null
    if (status) updateData.status = status

    const deal = await db.pipelineDeal.update({
      where: { id },
      data: updateData,
      include: {
        pipeline: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      status: true,
      data: deal,
    })
  } catch (error) {
    console.error('Pipeline deal update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update pipeline deal' },
      { status: 500 }
    )
  }
}

// DELETE /api/pipeline-deals/[id] - Delete pipeline deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.pipelineDeal.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Pipeline deal not found' },
        { status: 404 }
      )
    }

    await db.pipelineDeal.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      data: { id },
    })
  } catch (error) {
    console.error('Pipeline deal delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete pipeline deal' },
      { status: 500 }
    )
  }
}
