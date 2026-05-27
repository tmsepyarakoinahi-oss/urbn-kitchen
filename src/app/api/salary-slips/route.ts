import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/salary-slips - List salary slips for an employee
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (employeeId) where.employeeId = employeeId
    if (month) where.month = month

    const [slips, total] = await Promise.all([
      db.salarySlip.findMany({
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
        orderBy: { month: 'desc' },
        skip,
        take: limit,
      }),
      db.salarySlip.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Salary slips fetched successfully',
      data: {
        salarySlips: slips,
        slips,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Salary slips fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch salary slips' },
      { status: 500 }
    )
  }
}
