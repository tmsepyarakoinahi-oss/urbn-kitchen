import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/leaves - List leaves for an employee
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status
    if (type) where.type = type

    const [leaves, total] = await Promise.all([
      db.leave.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              department: true,
              designation: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.leave.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Leaves fetched successfully',
      data: {
        leaves,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Leaves fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch leaves' },
      { status: 500 }
    )
  }
}

// POST /api/leaves - Apply for leave
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, type, startDate, endDate, reason } = body

    if (!employeeId || !type || !startDate || !endDate) {
      return NextResponse.json(
        { status: false, message: 'Employee ID, type, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Verify employee exists
    const employee = await db.employee.findUnique({ where: { id: employeeId } })
    if (!employee) {
      return NextResponse.json(
        { status: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end < start) {
      return NextResponse.json(
        { status: false, message: 'End date cannot be before start date' },
        { status: 400 }
      )
    }

    const leave = await db.leave.create({
      data: {
        employeeId,
        type,
        startDate: start,
        endDate: end,
        reason: reason || null,
        status: 'pending',
      },
      include: {
        employee: {
          select: {
            id: true,
            department: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Leave application submitted successfully',
      data: leave,
    }, { status: 201 })
  } catch (error) {
    console.error('Leave create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to apply for leave' },
      { status: 500 }
    )
  }
}

// PUT /api/leaves - Update leave status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { leaveId, status } = body

    if (!leaveId || !status) {
      return NextResponse.json(
        { status: false, message: 'Leave ID and status are required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { status: false, message: 'Status must be approved or rejected' },
        { status: 400 }
      )
    }

    const existingLeave = await db.leave.findUnique({ where: { id: leaveId } })
    if (!existingLeave) {
      return NextResponse.json(
        { status: false, message: 'Leave not found' },
        { status: 404 }
      )
    }

    const leave = await db.leave.update({
      where: { id: leaveId },
      data: { status },
      include: {
        employee: {
          select: {
            id: true,
            department: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({
      status: true,
      message: `Leave ${status} successfully`,
      data: leave,
    })
  } catch (error) {
    console.error('Leave update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update leave' },
      { status: 500 }
    )
  }
}
