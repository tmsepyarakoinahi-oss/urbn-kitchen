import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/integrations/[id] - Get single integration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const integration = await db.integration.findUnique({ where: { id } })

    if (!integration) {
      return NextResponse.json(
        { status: false, message: 'Integration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: integration,
    })
  } catch (error) {
    console.error('Integration fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch integration' },
      { status: 500 }
    )
  }
}

// PUT /api/integrations/[id] - Update integration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.integration.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Integration not found' },
        { status: 404 }
      )
    }

    const { name, category, config, status } = body
    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (category) updateData.category = category
    if (config) updateData.config = config
    if (status) updateData.status = status

    const integration = await db.integration.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      status: true,
      data: integration,
    })
  } catch (error) {
    console.error('Integration update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update integration' },
      { status: 500 }
    )
  }
}

// DELETE /api/integrations/[id] - Delete integration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.integration.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Integration not found' },
        { status: 404 }
      )
    }

    await db.integration.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      data: { id },
    })
  } catch (error) {
    console.error('Integration delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete integration' },
      { status: 500 }
    )
  }
}
