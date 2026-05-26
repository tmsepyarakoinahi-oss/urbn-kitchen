import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/interviews - List interviews with status filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const result = await db.interview.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Interviews fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch interviews' },
      { status: 500 }
    )
  }
}

// POST /api/interviews - Create interview
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidateName, candidateEmail, candidatePhone, position, date, interviewer, rating, feedback, status } = body

    if (!candidateName || !position || !date) {
      return Response.json(
        { status: false, message: 'Candidate name, position, and date are required' },
        { status: 400 }
      )
    }

    const result = await db.interview.create({
      data: {
        candidateName,
        candidateEmail: candidateEmail || null,
        candidatePhone: candidatePhone || null,
        position,
        date: new Date(date),
        interviewer: interviewer || null,
        rating: rating ? parseFloat(rating) : 0,
        feedback: feedback || null,
        status: status || 'scheduled',
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Interview create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create interview' },
      { status: 500 }
    )
  }
}
