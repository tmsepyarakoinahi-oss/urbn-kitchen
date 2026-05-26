import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/job-openings - List job openings with department, status filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (department) where.department = department
    if (status) where.status = status

    const result = await db.jobOpening.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Job openings fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch job openings' },
      { status: 500 }
    )
  }
}

// POST /api/job-openings - Create job opening
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, department, type, experience, salaryRange, description, requirements, location, status } = body

    if (!title || !department) {
      return Response.json(
        { status: false, message: 'Title and department are required' },
        { status: 400 }
      )
    }

    const result = await db.jobOpening.create({
      data: {
        title,
        department,
        type: type || 'full-time',
        experience: experience || null,
        salaryRange: salaryRange || null,
        description: description || null,
        requirements: requirements || null,
        location: location || null,
        status: status || 'open',
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Job opening create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create job opening' },
      { status: 500 }
    )
  }
}
