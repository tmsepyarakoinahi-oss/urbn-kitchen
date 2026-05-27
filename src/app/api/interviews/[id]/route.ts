import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/interviews/[id] - Fetch single interview
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.interview.findUnique({ where: { id } })

    if (!result) {
      return Response.json(
        { status: false, message: 'Interview not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Interview fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch interview' },
      { status: 500 }
    )
  }
}

// PUT /api/interviews/[id] - Update interview
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { candidateName, candidateEmail, candidatePhone, position, date, interviewer, rating, feedback, status } = body

    const existing = await db.interview.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Interview not found' },
        { status: 404 }
      )
    }

    const result = await db.interview.update({
      where: { id },
      data: {
        ...(candidateName !== undefined && { candidateName }),
        ...(candidateEmail !== undefined && { candidateEmail }),
        ...(candidatePhone !== undefined && { candidatePhone }),
        ...(position !== undefined && { position }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(interviewer !== undefined && { interviewer }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
        ...(feedback !== undefined && { feedback }),
        ...(status !== undefined && { status }),
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Interview update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update interview' },
      { status: 500 }
    )
  }
}

// DELETE /api/interviews/[id] - Delete interview
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.interview.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Interview not found' },
        { status: 404 }
      )
    }

    await db.interview.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Interview delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete interview' },
      { status: 500 }
    )
  }
}
