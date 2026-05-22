import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/amc - List AMC contracts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (customerId) where.customerId = customerId
    if (status) where.status = status

    const [contracts, total] = await Promise.all([
      db.amcContract.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { serviceRequests: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.amcContract.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'AMC contracts fetched successfully',
      data: {
        contracts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('AMC fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch AMC contracts' },
      { status: 500 }
    )
  }
}

// POST /api/amc - Create AMC contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, plan, startDate, endDate, amount, coverage } = body

    if (!customerId || !plan || !startDate || !endDate || !amount) {
      return NextResponse.json(
        { status: false, message: 'Customer ID, plan, start date, end date, and amount are required' },
        { status: 400 }
      )
    }

    // Verify customer exists
    const customer = await db.user.findUnique({ where: { id: customerId } })
    if (!customer) {
      return NextResponse.json(
        { status: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    const contract = await db.amcContract.create({
      data: {
        customerId,
        plan,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amount: parseFloat(amount),
        status: 'active',
        coverage: coverage ? JSON.stringify(coverage) : null,
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'AMC contract created successfully',
      data: contract,
    }, { status: 201 })
  } catch (error) {
    console.error('AMC create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create AMC contract' },
      { status: 500 }
    )
  }
}
