import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/holidays - List holidays with type filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (type) where.type = type

    const result = await db.holiday.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Holidays fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch holidays' },
      { status: 500 }
    )
  }
}

// POST /api/holidays - Create holiday
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, date, type } = body

    if (!name || !date) {
      return Response.json(
        { status: false, message: 'Name and date are required' },
        { status: 400 }
      )
    }

    const result = await db.holiday.create({
      data: {
        name,
        date: new Date(date),
        type: type || 'public',
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Holiday create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create holiday' },
      { status: 500 }
    )
  }
}
