import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/leads/[id] - Get lead with quotations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        quotations: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!lead) {
      return NextResponse.json(
        { status: false, message: 'Lead not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      message: 'Lead fetched successfully',
      data: lead,
    })
  } catch (error) {
    console.error('Lead fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

// PUT /api/leads/[id] - Update lead status, assign, add notes
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, assignedTo, notes, name, company, phone, email, city, requirement, message, source } = body

    const existingLead = await db.lead.findUnique({ where: { id } })
    if (!existingLead) {
      return NextResponse.json(
        { status: false, message: 'Lead not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (status) updateData.status = status
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null
    if (name) updateData.name = name
    if (company !== undefined) updateData.company = company || null
    if (phone !== undefined) updateData.phone = phone || null
    if (email !== undefined) updateData.email = email || null
    if (city !== undefined) updateData.city = city || null
    if (requirement !== undefined) updateData.requirement = requirement || null
    if (message !== undefined) updateData.message = message || null
    if (source) updateData.source = source

    // Handle notes - append new note to existing notes
    if (notes) {
      const existingNotes = existingLead.notes ? JSON.parse(existingLead.notes as string) : []
      existingNotes.push({
        text: notes,
        date: new Date().toISOString(),
      })
      updateData.notes = JSON.stringify(existingNotes)
    }

    const lead = await db.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        quotations: true,
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Lead updated successfully',
      data: lead,
    })
  } catch (error) {
    console.error('Lead update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update lead' },
      { status: 500 }
    )
  }
}
