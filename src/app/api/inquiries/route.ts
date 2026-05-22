import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/inquiries - List inquiries (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [inquiries, total] = await Promise.all([
      db.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.inquiry.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Inquiries fetched successfully',
      data: {
        inquiries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Inquiries fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}

// POST /api/inquiries - Submit inquiry (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, productId } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { status: false, message: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    const inquiry = await db.inquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        productId: productId || null,
        status: 'new',
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Inquiry submitted successfully. We will get back to you soon!',
      data: inquiry,
    }, { status: 201 })
  } catch (error) {
    console.error('Inquiry create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}
