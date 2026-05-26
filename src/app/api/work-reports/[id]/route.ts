import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/work-reports/[id] - Fetch single work report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.workReport.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!result) {
      return Response.json(
        { status: false, message: 'Work report not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Work report fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch work report' },
      { status: 500 }
    )
  }
}

// PUT /api/work-reports/[id] - Update work report
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { employeeId, date, hours, tasks, summary, status } = body

    const existing = await db.workReport.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Work report not found' },
        { status: 404 }
      )
    }

    const result = await db.workReport.update({
      where: { id },
      data: {
        ...(employeeId !== undefined && { employeeId }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(hours !== undefined && { hours: parseFloat(hours) }),
        ...(tasks !== undefined && { tasks }),
        ...(summary !== undefined && { summary }),
        ...(status !== undefined && { status }),
      },
      include: {
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Work report update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update work report' },
      { status: 500 }
    )
  }
}

// DELETE /api/work-reports/[id] - Delete work report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.workReport.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Work report not found' },
        { status: 404 }
      )
    }

    await db.workReport.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Work report delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete work report' },
      { status: 500 }
    )
  }
}
