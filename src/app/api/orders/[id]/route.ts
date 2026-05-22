import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/orders/[id] - Get order with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, featuredImage: true, price: true, steelGrade: true, capacity: true },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { status: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      message: 'Order fetched successfully',
      data: order,
    })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { orderStatus, paymentStatus, notes } = body

    const existingOrder = await db.order.findUnique({ where: { id } })
    if (!existingOrder) {
      return NextResponse.json(
        { status: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (orderStatus) updateData.orderStatus = orderStatus
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (notes !== undefined) updateData.notes = notes

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, featuredImage: true } },
          },
        },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Order updated successfully',
      data: order,
    })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update order' },
      { status: 500 }
    )
  }
}
