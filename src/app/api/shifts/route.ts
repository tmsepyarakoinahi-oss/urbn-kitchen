import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shifts - List shifts with status filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const result = await db.shift.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Shifts fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch shifts' },
      { status: 500 }
    )
  }
}

// POST /api/shifts - Create shift
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, startTime, endTime, breakDuration, employees, supervisor, status } = body

    if (!name || !startTime || !endTime) {
      return Response.json(
        { status: false, message: 'Name, start time, and end time are required' },
        { status: 400 }
      )
    }

    const result = await db.shift.create({
      data: {
        name,
        startTime,
        endTime,
        breakDuration: breakDuration ? parseInt(breakDuration) : 30,
        employees: employees ? parseInt(employees) : 0,
        supervisor: supervisor || null,
        status: status || 'active',
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Shift create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create shift' },
      { status: 500 }
    )
  }
}
