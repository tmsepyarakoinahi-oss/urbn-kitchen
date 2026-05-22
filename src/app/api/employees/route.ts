import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// GET /api/employees - List employees with user details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (department) where.department = department
    if (status) where.status = status

    const [employees, total] = await Promise.all([
      db.employee.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatar: true, status: true } },
          _count: { select: { tasks: true, attendance: true } },
        },
        orderBy: { joiningDate: 'desc' },
        skip,
        take: limit,
      }),
      db.employee.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Employees fetched successfully',
      data: {
        employees,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Employees fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

// POST /api/employees - Create employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, department, designation, salary, joiningDate, bankDetails, documents } = body

    if (!name || !email || !department || !designation || !salary) {
      return NextResponse.json(
        { status: false, message: 'Name, email, department, designation, and salary are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { status: false, message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Find employee role
    const employeeRole = await db.role.findUnique({ where: { roleName: 'employee' } })
    if (!employeeRole) {
      return NextResponse.json(
        { status: false, message: 'Employee role not found. Please seed the database first.' },
        { status: 500 }
      )
    }

    const hashedPassword = await hashPassword(password || 'employee123')

    // Create user and employee in a transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          roleId: employeeRole.id,
          status: 'active',
          emailVerified: true,
        },
      })

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          department,
          designation,
          salary: parseFloat(salary),
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          status: 'active',
          bankDetails: bankDetails ? JSON.stringify(bankDetails) : null,
          documents: documents ? JSON.stringify(documents) : null,
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      })

      return employee
    })

    return NextResponse.json({
      status: true,
      message: 'Employee created successfully',
      data: result,
    }, { status: 201 })
  } catch (error) {
    console.error('Employee create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
