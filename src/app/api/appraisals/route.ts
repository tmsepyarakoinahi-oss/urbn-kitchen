import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/appraisals - List appraisals with employeeId, status filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const result = await db.appraisal.findMany({
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
    console.error('Appraisals fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch appraisals' },
      { status: 500 }
    )
  }
}

// POST /api/appraisals - Create appraisal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, cycle, rating, hikePercent, newSalary, comments, status } = body

    if (!employeeId || !cycle) {
      return Response.json(
        { status: false, message: 'Employee ID and cycle are required' },
        { status: 400 }
      )
    }

    const result = await db.appraisal.create({
      data: {
        employeeId,
        cycle,
        rating: rating ? parseFloat(rating) : 0,
        hikePercent: hikePercent ? parseFloat(hikePercent) : 0,
        newSalary: newSalary ? parseFloat(newSalary) : 0,
        comments: comments || null,
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
    console.error('Appraisal create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create appraisal' },
      { status: 500 }
    )
  }
}
