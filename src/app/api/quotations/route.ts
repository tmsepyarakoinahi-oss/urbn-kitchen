import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/quotations - List quotations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (leadId) where.leadId = leadId
    if (status) where.status = status

    const [quotations, total] = await Promise.all([
      db.quotation.findMany({
        where,
        include: {
          lead: { select: { id: true, name: true, company: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.quotation.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Quotations fetched successfully',
      data: {
        quotations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Quotations fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch quotations' },
      { status: 500 }
    )
  }
}

// POST /api/quotations - Create quotation for a lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, amount, items, status, validUntil } = body

    if (!leadId || !amount) {
      return NextResponse.json(
        { status: false, message: 'Lead ID and amount are required' },
        { status: 400 }
      )
    }

    // Verify lead exists
    const lead = await db.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return NextResponse.json(
        { status: false, message: 'Lead not found' },
        { status: 404 }
      )
    }

    // Generate quotation number
    const count = await db.quotation.count()
    const quotationNumber = `QUO-2024-${String(count + 1).padStart(3, '0')}`

    const quotation = await db.quotation.create({
      data: {
        leadId,
        quotationNumber,
        amount: parseFloat(amount),
        items: items ? JSON.stringify(items) : null,
        status: status || 'draft',
        validUntil: validUntil ? new Date(validUntil) : null,
      },
      include: {
        lead: { select: { id: true, name: true, company: true, email: true } },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Quotation created successfully',
      data: quotation,
    }, { status: 201 })
  } catch (error) {
    console.error('Quotation create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create quotation' },
      { status: 500 }
    )
  }
}
