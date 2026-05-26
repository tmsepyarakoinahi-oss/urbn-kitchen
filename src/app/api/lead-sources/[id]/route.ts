import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/lead-sources/[id] - Get single lead source
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const source = await db.leadSource.findUnique({ where: { id } })

    if (!source) {
      return NextResponse.json(
        { status: false, message: 'Lead source not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: source,
    })
  } catch (error) {
    console.error('Lead source fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch lead source' },
      { status: 500 }
    )
  }
}

// PUT /api/lead-sources/[id] - Update lead source
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.leadSource.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Lead source not found' },
        { status: 404 }
      )
    }

    const { name, type, cost, status } = body
    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (type) updateData.type = type
    if (cost !== undefined) updateData.cost = cost
    if (status) updateData.status = status

    const source = await db.leadSource.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      status: true,
      data: source,
    })
  } catch (error) {
    console.error('Lead source update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update lead source' },
      { status: 500 }
    )
  }
}

// DELETE /api/lead-sources/[id] - Delete lead source
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.leadSource.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Lead source not found' },
        { status: 404 }
      )
    }

    await db.leadSource.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      data: { id },
    })
  } catch (error) {
    console.error('Lead source delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete lead source' },
      { status: 500 }
    )
  }
}
