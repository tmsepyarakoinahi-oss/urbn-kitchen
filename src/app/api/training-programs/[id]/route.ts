import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/training-programs/[id] - Fetch single training program
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.trainingProgram.findUnique({ where: { id } })

    if (!result) {
      return Response.json(
        { status: false, message: 'Training program not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Training program fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch training program' },
      { status: 500 }
    )
  }
}

// PUT /api/training-programs/[id] - Update training program
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, duration, trainer, enrolled, maxSeats, startDate, endDate, status } = body

    const existing = await db.trainingProgram.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Training program not found' },
        { status: 404 }
      )
    }

    const result = await db.trainingProgram.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(duration !== undefined && { duration }),
        ...(trainer !== undefined && { trainer }),
        ...(enrolled !== undefined && { enrolled: parseInt(enrolled) }),
        ...(maxSeats !== undefined && { maxSeats: parseInt(maxSeats) }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status !== undefined && { status }),
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Training program update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update training program' },
      { status: 500 }
    )
  }
}

// DELETE /api/training-programs/[id] - Delete training program
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.trainingProgram.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Training program not found' },
        { status: 404 }
      )
    }

    await db.trainingProgram.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Training program delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete training program' },
      { status: 500 }
    )
  }
}
