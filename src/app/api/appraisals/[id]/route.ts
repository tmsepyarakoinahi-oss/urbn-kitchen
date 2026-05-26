import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/appraisals/[id] - Fetch single appraisal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.appraisal.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!result) {
      return Response.json(
        { status: false, message: 'Appraisal not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Appraisal fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch appraisal' },
      { status: 500 }
    )
  }
}

// PUT /api/appraisals/[id] - Update appraisal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { employeeId, cycle, rating, hikePercent, newSalary, comments, status } = body

    const existing = await db.appraisal.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Appraisal not found' },
        { status: 404 }
      )
    }

    const result = await db.appraisal.update({
      where: { id },
      data: {
        ...(employeeId !== undefined && { employeeId }),
        ...(cycle !== undefined && { cycle }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
        ...(hikePercent !== undefined && { hikePercent: parseFloat(hikePercent) }),
        ...(newSalary !== undefined && { newSalary: parseFloat(newSalary) }),
        ...(comments !== undefined && { comments }),
        ...(status !== undefined && { status }),
      },
      include: {
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Appraisal update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update appraisal' },
      { status: 500 }
    )
  }
}

// DELETE /api/appraisals/[id] - Delete appraisal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.appraisal.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Appraisal not found' },
        { status: 404 }
      )
    }

    await db.appraisal.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Appraisal delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete appraisal' },
      { status: 500 }
    )
  }
}
