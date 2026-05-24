import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/employees/[id] - Get single employee with user data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, status: true } },
        _count: { select: { tasks: true, attendance: true, salarySlips: true, leaves: true } },
      },
    })

    if (!employee) {
      return NextResponse.json(
        { status: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      message: 'Employee fetched successfully',
      data: employee,
    })
  } catch (error) {
    console.error('Employee fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { department, designation, salary, status, bankDetails, documents } = body

    const existingEmployee = await db.employee.findUnique({ where: { id } })
    if (!existingEmployee) {
      return NextResponse.json(
        { status: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (department) updateData.department = department
    if (designation) updateData.designation = designation
    if (salary !== undefined) updateData.salary = parseFloat(String(salary))
    if (status) updateData.status = status
    if (bankDetails !== undefined) updateData.bankDetails = bankDetails ? JSON.stringify(bankDetails) : null
    if (documents !== undefined) updateData.documents = documents ? JSON.stringify(documents) : null

    const employee = await db.employee.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, status: true } },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Employee updated successfully',
      data: employee,
    })
  } catch (error) {
    console.error('Employee update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

// DELETE /api/employees/[id] - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingEmployee = await db.employee.findUnique({ where: { id } })
    if (!existingEmployee) {
      return NextResponse.json(
        { status: false, message: 'Employee not found' },
        { status: 404 }
      )
    }

    // Delete employee and associated user in a transaction
    await db.$transaction(async (tx) => {
      await tx.employee.delete({ where: { id } })
      await tx.user.delete({ where: { id: existingEmployee.userId } })
    })

    return NextResponse.json({
      status: true,
      message: 'Employee deleted successfully',
      data: null,
    })
  } catch (error) {
    console.error('Employee delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
