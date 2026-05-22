import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/service-requests - List service requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const contractId = searchParams.get('contractId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (customerId) where.customerId = customerId
    if (status) where.status = status
    if (priority) where.priority = priority
    if (contractId) where.contractId = contractId

    const [serviceRequests, total] = await Promise.all([
      db.serviceRequest.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          contract: { select: { id: true, plan: true, status: true } },
          technician: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.serviceRequest.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Service requests fetched successfully',
      data: {
        serviceRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Service requests fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch service requests' },
      { status: 500 }
    )
  }
}

// POST /api/service-requests - Create service request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, contractId, issue, priority, assignedTechnician } = body

    if (!customerId || !issue) {
      return NextResponse.json(
        { status: false, message: 'Customer ID and issue description are required' },
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

    const serviceRequest = await db.serviceRequest.create({
      data: {
        customerId,
        contractId: contractId || null,
        issue,
        priority: priority || 'medium',
        assignedTechnician: assignedTechnician || null,
        status: 'open',
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        contract: { select: { id: true, plan: true } },
        technician: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Service request created successfully',
      data: serviceRequest,
    }, { status: 201 })
  } catch (error) {
    console.error('Service request create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create service request' },
      { status: 500 }
    )
  }
}

// PUT /api/service-requests - Update service request status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status, assignedTechnician, priority, resolution } = body

    if (!requestId) {
      return NextResponse.json(
        { status: false, message: 'Request ID is required' },
        { status: 400 }
      )
    }

    const existingRequest = await db.serviceRequest.findUnique({ where: { id: requestId } })
    if (!existingRequest) {
      return NextResponse.json(
        { status: false, message: 'Service request not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (assignedTechnician !== undefined) updateData.assignedTechnician = assignedTechnician || null
    if (priority) updateData.priority = priority
    if (resolution !== undefined) updateData.resolution = resolution || null

    const serviceRequest = await db.serviceRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        contract: { select: { id: true, plan: true } },
        technician: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Service request updated successfully',
      data: serviceRequest,
    })
  } catch (error) {
    console.error('Service request update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update service request' },
      { status: 500 }
    )
  }
}
