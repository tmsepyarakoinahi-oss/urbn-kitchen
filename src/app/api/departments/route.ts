import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/departments - List departments with status filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const result = await db.department.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Departments fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

// POST /api/departments - Create department
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, head, budget, status } = body

    if (!name) {
      return Response.json(
        { status: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    const result = await db.department.create({
      data: {
        name,
        head: head || null,
        budget: budget ? parseFloat(budget) : 0,
        status: status || 'active',
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Department create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create department' },
      { status: 500 }
    )
  }
}
