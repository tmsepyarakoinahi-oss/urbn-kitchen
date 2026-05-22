import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/leads - List leads (admin/manager)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const assignedTo = searchParams.get('assignedTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (source) where.source = source
    if (assignedTo) where.assignedTo = assignedTo

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          _count: { select: { quotations: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.lead.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Leads fetched successfully',
      data: {
        leads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Leads fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Create lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, company, phone, email, city, requirement, message, source, assignedTo } = body

    if (!name) {
      return NextResponse.json(
        { status: false, message: 'Lead name is required' },
        { status: 400 }
      )
    }

    const lead = await db.lead.create({
      data: {
        name,
        company: company || null,
        phone: phone || null,
        email: email || null,
        city: city || null,
        requirement: requirement || null,
        message: message || null,
        source: source || 'website',
        assignedTo: assignedTo || null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Lead created successfully',
      data: lead,
    }, { status: 201 })
  } catch (error) {
    console.error('Lead create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
