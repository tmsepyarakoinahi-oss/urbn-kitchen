import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/crm-forms/[id] - Get single CRM form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const form = await db.crmForm.findUnique({ where: { id } })

    if (!form) {
      return NextResponse.json(
        { status: false, message: 'CRM form not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: form,
    })
  } catch (error) {
    console.error('CRM form fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch CRM form' },
      { status: 500 }
    )
  }
}

// PUT /api/crm-forms/[id] - Update CRM form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.crmForm.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'CRM form not found' },
        { status: 404 }
      )
    }

    const { name, fields, status } = body
    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (fields) updateData.fields = fields
    if (status) updateData.status = status

    const form = await db.crmForm.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      status: true,
      data: form,
    })
  } catch (error) {
    console.error('CRM form update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update CRM form' },
      { status: 500 }
    )
  }
}

// DELETE /api/crm-forms/[id] - Delete CRM form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.crmForm.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'CRM form not found' },
        { status: 404 }
      )
    }

    await db.crmForm.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      data: { id },
    })
  } catch (error) {
    console.error('CRM form delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete CRM form' },
      { status: 500 }
    )
  }
}
