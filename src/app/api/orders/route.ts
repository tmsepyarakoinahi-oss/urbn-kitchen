import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Customer can only see their own orders
    if (userRole === 'customer' && userId) {
      where.customerId = userId
    } else if (userId && userRole !== 'customer') {
      // Admin/manager can filter by customer
      where.customerId = userId
    }

    if (status) {
      where.orderStatus = status
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true, featuredImage: true, price: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Orders fetched successfully',
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create order from cart items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, items, shippingAddress, notes, paymentMethod } = body

    if (!customerId || !items || !items.length) {
      return NextResponse.json(
        { status: false, message: 'Customer ID and order items are required' },
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

    // Validate all products and get prices
    const productIds = items.map((item: { productId: string }) => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { status: false, message: 'One or more products not found' },
        { status: 404 }
      )
    }

    // Calculate totals
    const productMap = new Map(products.map(p => [p.id, p]))
    let subtotal = 0
    const orderItems = items.map((item: { productId: string; qty: number }) => {
      const product = productMap.get(item.productId)!
      const price = product.price
      subtotal += price * item.qty
      return { productId: item.productId, qty: item.qty, price }
    })

    const tax = Math.round(subtotal * 0.18 * 100) / 100
    const shipping = subtotal > 50000 ? 0 : 2500
    const total = subtotal + tax + shipping

    // Generate order number
    const orderCount = await db.order.count()
    const orderNumber = `ORD-2024-${String(1001 + orderCount)}`

    const order = await db.order.create({
      data: {
        customerId,
        orderNumber,
        subtotal,
        tax,
        shipping,
        total,
        paymentStatus: 'pending',
        paymentMethod: paymentMethod || 'cod',
        orderStatus: 'pending',
        shippingAddress: shippingAddress || null,
        notes: notes || null,
        items: { create: orderItems },
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, featuredImage: true, price: true } },
          },
        },
      },
    })

    // Clear user's cart after order
    await db.cartItem.deleteMany({ where: { userId: customerId } })

    return NextResponse.json({
      status: true,
      message: 'Order created successfully',
      data: order,
    }, { status: 201 })
  } catch (error) {
    console.error('Order create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create order' },
      { status: 500 }
    )
  }
}
