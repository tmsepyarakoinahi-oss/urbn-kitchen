import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/companies/[id] - Get single company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const company = await db.company.findUnique({
      where: { id },
      include: {
        leads: true,
      },
    })

    if (!company) {
      return NextResponse.json(
        { status: false, message: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: company,
    })
  } catch (error) {
    console.error('Company fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

// PUT /api/companies/[id] - Update company
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.company.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Company not found' },
        { status: 404 }
      )
    }

    const { name, industry, website, phone, email, address, gstNumber, revenue, status, notes } = body
    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (industry !== undefined) updateData.industry = industry || null
    if (website !== undefined) updateData.website = website || null
    if (phone !== undefined) updateData.phone = phone || null
    if (email !== undefined) updateData.email = email || null
    if (address !== undefined) updateData.address = address || null
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber || null
    if (revenue !== undefined) updateData.revenue = revenue
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes || null

    const company = await db.company.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      status: true,
      data: company,
    })
  } catch (error) {
    console.error('Company update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update company' },
      { status: 500 }
    )
  }
}

// DELETE /api/companies/[id] - Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.company.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Company not found' },
        { status: 404 }
      )
    }

    await db.company.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      data: { id },
    })
  } catch (error) {
    console.error('Company delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete company' },
      { status: 500 }
    )
  }
}
