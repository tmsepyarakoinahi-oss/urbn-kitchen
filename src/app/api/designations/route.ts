import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/designations - List designations with status filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const result = await db.designation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Designations fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch designations' },
      { status: 500 }
    )
  }
}

// POST /api/designations - Create designation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, level, minSalary, maxSalary, status } = body

    if (!name) {
      return Response.json(
        { status: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    const result = await db.designation.create({
      data: {
        name,
        level: level ? parseInt(level) : 1,
        minSalary: minSalary ? parseFloat(minSalary) : 0,
        maxSalary: maxSalary ? parseFloat(maxSalary) : 0,
        status: status || 'active',
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Designation create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create designation' },
      { status: 500 }
    )
  }
}
