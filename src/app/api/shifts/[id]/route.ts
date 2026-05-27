import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shifts/[id] - Fetch single shift
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.shift.findUnique({ where: { id } })

    if (!result) {
      return Response.json(
        { status: false, message: 'Shift not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Shift fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch shift' },
      { status: 500 }
    )
  }
}

// PUT /api/shifts/[id] - Update shift
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, startTime, endTime, breakDuration, employees, supervisor, status } = body

    const existing = await db.shift.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Shift not found' },
        { status: 404 }
      )
    }

    const result = await db.shift.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(breakDuration !== undefined && { breakDuration: parseInt(breakDuration) }),
        ...(employees !== undefined && { employees: parseInt(employees) }),
        ...(supervisor !== undefined && { supervisor }),
        ...(status !== undefined && { status }),
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Shift update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update shift' },
      { status: 500 }
    )
  }
}

// DELETE /api/shifts/[id] - Delete shift
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.shift.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Shift not found' },
        { status: 404 }
      )
    }

    await db.shift.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Shift delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete shift' },
      { status: 500 }
    )
  }
}
