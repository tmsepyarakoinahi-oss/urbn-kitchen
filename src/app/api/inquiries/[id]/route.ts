import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/inquiries/[id] - Update inquiry status
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ status: false, message: 'Status is required' }, { status: 400 })
    }

    const existing = await db.inquiry.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ status: false, message: 'Inquiry not found' }, { status: 404 })

    const inquiry = await db.inquiry.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ status: true, message: 'Inquiry updated successfully', data: inquiry })
  } catch (error) {
    console.error('Inquiry update error:', error)
    return NextResponse.json({ status: false, message: 'Failed to update inquiry' }, { status: 500 })
  }
}
