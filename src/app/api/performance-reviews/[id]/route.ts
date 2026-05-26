import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/performance-reviews/[id] - Fetch single performance review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.performanceReview.findUnique({
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
        { status: false, message: 'Performance review not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Performance review fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch performance review' },
      { status: 500 }
    )
  }
}

// PUT /api/performance-reviews/[id] - Update performance review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { employeeId, reviewerId, period, score, goals, feedback, status } = body

    const existing = await db.performanceReview.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Performance review not found' },
        { status: 404 }
      )
    }

    const result = await db.performanceReview.update({
      where: { id },
      data: {
        ...(employeeId !== undefined && { employeeId }),
        ...(reviewerId !== undefined && { reviewerId }),
        ...(period !== undefined && { period }),
        ...(score !== undefined && { score: parseFloat(score) }),
        ...(goals !== undefined && { goals }),
        ...(feedback !== undefined && { feedback }),
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
    console.error('Performance review update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update performance review' },
      { status: 500 }
    )
  }
}

// DELETE /api/performance-reviews/[id] - Delete performance review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.performanceReview.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Performance review not found' },
        { status: 404 }
      )
    }

    await db.performanceReview.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Performance review delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete performance review' },
      { status: 500 }
    )
  }
}
