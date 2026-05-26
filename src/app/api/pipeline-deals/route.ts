import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pipeline-deals - List pipeline deals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pipelineId = searchParams.get('pipelineId')

    const where: Record<string, unknown> = {}
    if (pipelineId) where.pipelineId = pipelineId

    const deals = await db.pipelineDeal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pipeline: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      status: true,
      data: deals,
    })
  } catch (error) {
    console.error('Pipeline deals fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch pipeline deals' },
      { status: 500 }
    )
  }
}

// POST /api/pipeline-deals - Create pipeline deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pipelineId, leadId, title, value, stage, probability, assigneeId, closeDate, status } = body

    if (!pipelineId || !title) {
      return NextResponse.json(
        { status: false, message: 'Pipeline ID and title are required' },
        { status: 400 }
      )
    }

    const deal = await db.pipelineDeal.create({
      data: {
        pipelineId,
        leadId: leadId || null,
        title,
        value: value || 0,
        stage: stage || 'New',
        probability: probability || 50,
        assigneeId: assigneeId || null,
        closeDate: closeDate ? new Date(closeDate) : null,
        status: status || 'open',
      },
      include: {
        pipeline: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      status: true,
      data: deal,
    }, { status: 201 })
  } catch (error) {
    console.error('Pipeline deal create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create pipeline deal' },
      { status: 500 }
    )
  }
}
