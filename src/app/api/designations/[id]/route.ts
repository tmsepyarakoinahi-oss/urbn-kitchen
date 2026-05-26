import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/designations/[id] - Fetch single designation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.designation.findUnique({ where: { id } })

    if (!result) {
      return Response.json(
        { status: false, message: 'Designation not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Designation fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch designation' },
      { status: 500 }
    )
  }
}

// PUT /api/designations/[id] - Update designation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, level, minSalary, maxSalary, status } = body

    const existing = await db.designation.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Designation not found' },
        { status: 404 }
      )
    }

    const result = await db.designation.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(level !== undefined && { level: parseInt(level) }),
        ...(minSalary !== undefined && { minSalary: parseFloat(minSalary) }),
        ...(maxSalary !== undefined && { maxSalary: parseFloat(maxSalary) }),
        ...(status !== undefined && { status }),
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Designation update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update designation' },
      { status: 500 }
    )
  }
}

// DELETE /api/designations/[id] - Delete designation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.designation.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Designation not found' },
        { status: 404 }
      )
    }

    await db.designation.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Designation delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete designation' },
      { status: 500 }
    )
  }
}
