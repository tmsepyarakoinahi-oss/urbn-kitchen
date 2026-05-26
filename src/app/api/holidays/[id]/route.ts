import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/holidays/[id] - Fetch single holiday
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.holiday.findUnique({ where: { id } })

    if (!result) {
      return Response.json(
        { status: false, message: 'Holiday not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Holiday fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch holiday' },
      { status: 500 }
    )
  }
}

// PUT /api/holidays/[id] - Update holiday
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, date, type } = body

    const existing = await db.holiday.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Holiday not found' },
        { status: 404 }
      )
    }

    const result = await db.holiday.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(type !== undefined && { type }),
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Holiday update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update holiday' },
      { status: 500 }
    )
  }
}

// DELETE /api/holidays/[id] - Delete holiday
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.holiday.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Holiday not found' },
        { status: 404 }
      )
    }

    await db.holiday.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Holiday delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete holiday' },
      { status: 500 }
    )
  }
}
