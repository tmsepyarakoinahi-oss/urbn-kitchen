import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/performance-reviews - List performance reviews with employeeId, status filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const result = await db.performanceReview.findMany({
      where,
      include: {
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Performance reviews fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch performance reviews' },
      { status: 500 }
    )
  }
}

// POST /api/performance-reviews - Create performance review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, reviewerId, period, score, goals, feedback, status } = body

    if (!employeeId || !period) {
      return Response.json(
        { status: false, message: 'Employee ID and period are required' },
        { status: 400 }
      )
    }

    const result = await db.performanceReview.create({
      data: {
        employeeId,
        reviewerId: reviewerId || null,
        period,
        score: score ? parseFloat(score) : 0,
        goals: goals || null,
        feedback: feedback || null,
        status: status || 'pending',
      },
      include: {
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Performance review create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create performance review' },
      { status: 500 }
    )
  }
}
