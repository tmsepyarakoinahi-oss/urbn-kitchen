import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/attendance - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (employeeId) where.employeeId = employeeId

    if (date) {
      const targetDate = new Date(date)
      where.date = {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lte: new Date(targetDate.setHours(23, 59, 59, 999)),
      }
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const [records, total] = await Promise.all([
      db.attendance.findMany({
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
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      db.attendance.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Attendance records fetched successfully',
      data: {
        records,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Attendance fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch attendance records' },
      { status: 500 }
    )
  }
}

// POST /api/attendance - Check in/out
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, action } = body // action: 'checkin' or 'checkout'

    if (!employeeId || !action) {
      return NextResponse.json(
        { status: false, message: 'Employee ID and action (checkin/checkout) are required' },
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if attendance record exists for today
    const existingRecord = await db.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 86400000),
        },
      },
    })

    if (action === 'checkin') {
      if (existingRecord) {
        return NextResponse.json(
          { status: false, message: 'Already checked in today' },
          { status: 400 }
        )
      }

      const record = await db.attendance.create({
        data: {
          employeeId,
          date: today,
          checkin: new Date(),
          status: 'present',
        },
      })

      return NextResponse.json({
        status: true,
        message: 'Checked in successfully',
        data: record,
      }, { status: 201 })
    }

    if (action === 'checkout') {
      if (!existingRecord) {
        return NextResponse.json(
          { status: false, message: 'No check-in record found for today. Please check in first.' },
          { status: 400 }
        )
      }

      if (existingRecord.checkout) {
        return NextResponse.json(
          { status: false, message: 'Already checked out today' },
          { status: 400 }
        )
      }

      const record = await db.attendance.update({
        where: { id: existingRecord.id },
        data: { checkout: new Date() },
      })

      return NextResponse.json({
        status: true,
        message: 'Checked out successfully',
        data: record,
      })
    }

    return NextResponse.json(
      { status: false, message: 'Invalid action. Use "checkin" or "checkout"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Attendance error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to process attendance' },
      { status: 500 }
    )
  }
}
