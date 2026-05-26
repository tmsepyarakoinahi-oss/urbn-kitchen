import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/training-programs - List training programs with status filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const result = await db.trainingProgram.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Training programs fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch training programs' },
      { status: 500 }
    )
  }
}

// POST /api/training-programs - Create training program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, duration, trainer, enrolled, maxSeats, startDate, endDate, status } = body

    if (!name) {
      return Response.json(
        { status: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    const result = await db.trainingProgram.create({
      data: {
        name,
        type: type || 'internal',
        duration: duration || null,
        trainer: trainer || null,
        enrolled: enrolled ? parseInt(enrolled) : 0,
        maxSeats: maxSeats ? parseInt(maxSeats) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'upcoming',
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Training program create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create training program' },
      { status: 500 }
    )
  }
}
