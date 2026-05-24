import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/leaves/[id] - Approve/reject leave
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ status: false, message: 'Status must be approved or rejected' }, { status: 400 })
    }

    const existing = await db.leave.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ status: false, message: 'Leave not found' }, { status: 404 })

    const leave = await db.leave.update({
      where: { id },
      data: { status },
      include: {
        employee: {
          select: {
            id: true, department: true, designation: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({ status: true, message: `Leave ${status} successfully`, data: leave })
  } catch (error) {
    console.error('Leave update error:', error)
    return NextResponse.json({ status: false, message: 'Failed to update leave' }, { status: 500 })
  }
}
