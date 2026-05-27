import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/work-reports - List work reports with employeeId, status filters, include employee relation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const result = await db.workReport.findMany({
      where,
      include: {
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Work reports fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch work reports' },
      { status: 500 }
    )
  }
}

// POST /api/work-reports - Create work report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, date, hours, tasks, summary, status } = body

    if (!employeeId || !date) {
      return Response.json(
        { status: false, message: 'Employee ID and date are required' },
        { status: 400 }
      )
    }

    const result = await db.workReport.create({
      data: {
        employeeId,
        date: new Date(date),
        hours: hours ? parseFloat(hours) : 8,
        tasks: tasks || null,
        summary: summary || null,
        status: status || 'submitted',
      },
      include: {
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Work report create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create work report' },
      { status: 500 }
    )
  }
}
