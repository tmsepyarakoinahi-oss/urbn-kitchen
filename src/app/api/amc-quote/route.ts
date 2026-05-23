import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/amc-quote - List quotes (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [quotes, total] = await Promise.all([
      db.amcQuote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.amcQuote.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'AMC quotes fetched successfully',
      data: {
        quotes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('AMC quotes fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch AMC quotes' },
      { status: 500 }
    )
  }
}

// POST /api/amc-quote - Submit AMC quote request (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, plan, equipmentList, kitchenSize, city, message } = body

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { status: false, message: 'Name is required' },
        { status: 400 }
      )
    }
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { status: false, message: 'Valid email is required' },
        { status: 400 }
      )
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { status: false, message: 'Phone number is required' },
        { status: 400 }
      )
    }
    if (!plan || !['Basic', 'Standard', 'Premium', 'Custom'].includes(plan)) {
      return NextResponse.json(
        { status: false, message: 'Valid plan selection is required' },
        { status: 400 }
      )
    }

    // Save to database
    const quote = await db.amcQuote.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company?.trim() || null,
        plan,
        equipmentList: equipmentList || null,
        kitchenSize: kitchenSize || null,
        city: city?.trim() || null,
        message: message?.trim() || null,
        status: 'new',
        emailSent: false,
      },
    })

    return NextResponse.json({
      status: true,
      message: 'AMC quote request submitted successfully! Our team will contact you within 24 hours.',
      data: {
        id: quote.id,
        plan: quote.plan,
        referenceNumber: `#AMC-${quote.id.slice(-6).toUpperCase()}`,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('AMC quote create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to submit quote request. Please try again.' },
      { status: 500 }
    )
  }
}

// PATCH /api/amc-quote - Update quote status (admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { status: false, message: 'Quote ID and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['new', 'contacted', 'quotation_sent', 'won', 'lost']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { status: false, message: 'Invalid status value' },
        { status: 400 }
      )
    }

    const updated = await db.amcQuote.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({
      status: true,
      message: 'Quote status updated',
      data: updated,
    })
  } catch (error) {
    console.error('AMC quote update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update quote status' },
      { status: 500 }
    )
  }
}
