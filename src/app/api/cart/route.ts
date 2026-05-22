import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/cart - Get user's cart items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { status: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            featuredImage: true,
            stock: true,
            status: true,
            steelGrade: true,
            capacity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0)
    const tax = Math.round(subtotal * 0.18 * 100) / 100
    const shipping = subtotal > 50000 ? 0 : 2500
    const total = subtotal + tax + shipping

    return NextResponse.json({
      status: true,
      message: 'Cart fetched successfully',
      data: {
        items: cartItems,
        summary: { subtotal, tax, shipping, total, itemCount: cartItems.length },
      },
    })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, qty } = body

    if (!userId || !productId) {
      return NextResponse.json(
        { status: false, message: 'User ID and Product ID are required' },
        { status: 400 }
      )
    }

    // Verify product exists and is active
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.status !== 'active') {
      return NextResponse.json(
        { status: false, message: 'Product is not available' },
        { status: 400 }
      )
    }

    // Check if already in cart
    const existingItem = await db.cartItem.findFirst({
      where: { userId, productId },
    })

    if (existingItem) {
      // Update quantity
      const newQty = existingItem.qty + (qty || 1)
      if (newQty > product.stock) {
        return NextResponse.json(
          { status: false, message: `Only ${product.stock} items available in stock` },
          { status: 400 }
        )
      }
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: newQty },
        include: { product: { select: { id: true, name: true, price: true, featuredImage: true, stock: true } } },
      })

      return NextResponse.json({
        status: true,
        message: 'Cart item quantity updated',
        data: updated,
      })
    }

    const quantity = qty || 1
    if (quantity > product.stock) {
      return NextResponse.json(
        { status: false, message: `Only ${product.stock} items available in stock` },
        { status: 400 }
      )
    }

    const cartItem = await db.cartItem.create({
      data: { userId, productId, qty: quantity },
      include: { product: { select: { id: true, name: true, price: true, featuredImage: true, stock: true } } },
    })

    return NextResponse.json({
      status: true,
      message: 'Item added to cart',
      data: cartItem,
    }, { status: 201 })
  } catch (error) {
    console.error('Cart add error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartItemId, qty } = body

    if (!cartItemId || qty === undefined) {
      return NextResponse.json(
        { status: false, message: 'Cart item ID and quantity are required' },
        { status: 400 }
      )
    }

    if (qty < 1) {
      return NextResponse.json(
        { status: false, message: 'Quantity must be at least 1' },
        { status: 400 }
      )
    }

    const existingItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    })

    if (!existingItem) {
      return NextResponse.json(
        { status: false, message: 'Cart item not found' },
        { status: 404 }
      )
    }

    if (qty > existingItem.product.stock) {
      return NextResponse.json(
        { status: false, message: `Only ${existingItem.product.stock} items available in stock` },
        { status: 400 }
      )
    }

    const cartItem = await db.cartItem.update({
      where: { id: cartItemId },
      data: { qty },
      include: { product: { select: { id: true, name: true, price: true, featuredImage: true, stock: true } } },
    })

    return NextResponse.json({
      status: true,
      message: 'Cart item updated',
      data: cartItem,
    })
  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Remove from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get('cartItemId')
    const userId = searchParams.get('userId')

    if (cartItemId) {
      const existingItem = await db.cartItem.findUnique({ where: { id: cartItemId } })
      if (!existingItem) {
        return NextResponse.json(
          { status: false, message: 'Cart item not found' },
          { status: 404 }
        )
      }

      await db.cartItem.delete({ where: { id: cartItemId } })

      return NextResponse.json({
        status: true,
        message: 'Item removed from cart',
        data: null,
      })
    }

    // If userId is provided without cartItemId, clear entire cart
    if (userId) {
      await db.cartItem.deleteMany({ where: { userId } })

      return NextResponse.json({
        status: true,
        message: 'Cart cleared',
        data: null,
      })
    }

    return NextResponse.json(
      { status: false, message: 'Cart item ID or User ID is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Cart delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to remove cart item' },
      { status: 500 }
    )
  }
}
