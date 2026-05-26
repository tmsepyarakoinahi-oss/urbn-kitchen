import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/job-openings/[id] - Fetch single job opening
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.jobOpening.findUnique({ where: { id } })

    if (!result) {
      return Response.json(
        { status: false, message: 'Job opening not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Job opening fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch job opening' },
      { status: 500 }
    )
  }
}

// PUT /api/job-openings/[id] - Update job opening
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, department, type, experience, salaryRange, description, requirements, location, status } = body

    const existing = await db.jobOpening.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Job opening not found' },
        { status: 404 }
      )
    }

    const result = await db.jobOpening.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(department !== undefined && { department }),
        ...(type !== undefined && { type }),
        ...(experience !== undefined && { experience }),
        ...(salaryRange !== undefined && { salaryRange }),
        ...(description !== undefined && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(location !== undefined && { location }),
        ...(status !== undefined && { status }),
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Job opening update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update job opening' },
      { status: 500 }
    )
  }
}

// DELETE /api/job-openings/[id] - Delete job opening
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.jobOpening.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Job opening not found' },
        { status: 404 }
      )
    }

    await db.jobOpening.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Job opening delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete job opening' },
      { status: 500 }
    )
  }
}
