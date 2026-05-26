import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/departments/[id] - Fetch single department
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.department.findUnique({ where: { id } })

    if (!result) {
      return Response.json(
        { status: false, message: 'Department not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Department fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch department' },
      { status: 500 }
    )
  }
}

// PUT /api/departments/[id] - Update department
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, head, budget, status } = body

    const existing = await db.department.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Department not found' },
        { status: 404 }
      )
    }

    const result = await db.department.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(head !== undefined && { head }),
        ...(budget !== undefined && { budget: parseFloat(budget) }),
        ...(status !== undefined && { status }),
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Department update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update department' },
      { status: 500 }
    )
  }
}

// DELETE /api/departments/[id] - Delete department
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.department.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Department not found' },
        { status: 404 }
      )
    }

    await db.department.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Department delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete department' },
      { status: 500 }
    )
  }
}
