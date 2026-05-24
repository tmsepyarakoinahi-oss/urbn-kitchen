import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/wishlist - Get user's wishlist items
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

    const wishlistItems = await db.wishlistItem.findMany({
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
            shortDescription: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      status: true,
      message: 'Wishlist fetched successfully',
      data: wishlistItems,
    })
  } catch (error) {
    console.error('Wishlist fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

// POST /api/wishlist - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId } = body

    if (!userId || !productId) {
      return NextResponse.json(
        { status: false, message: 'User ID and Product ID are required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if already in wishlist
    const existing = await db.wishlistItem.findFirst({
      where: { userId, productId },
    })

    if (existing) {
      return NextResponse.json(
        { status: false, message: 'Product already in wishlist' },
        { status: 409 }
      )
    }

    const wishlistItem = await db.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            featuredImage: true,
            stock: true,
          },
        },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Added to wishlist',
      data: wishlistItem,
    }, { status: 201 })
  } catch (error) {
    console.error('Wishlist add error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/wishlist - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')
    const wishlistItemId = searchParams.get('id')

    if (wishlistItemId) {
      const existing = await db.wishlistItem.findUnique({ where: { id: wishlistItemId } })
      if (!existing) {
        return NextResponse.json(
          { status: false, message: 'Wishlist item not found' },
          { status: 404 }
        )
      }
      await db.wishlistItem.delete({ where: { id: wishlistItemId } })
      return NextResponse.json({
        status: true,
        message: 'Removed from wishlist',
        data: null,
      })
    }

    if (userId && productId) {
      const existing = await db.wishlistItem.findFirst({
        where: { userId, productId },
      })
      if (!existing) {
        return NextResponse.json(
          { status: false, message: 'Wishlist item not found' },
          { status: 404 }
        )
      }
      await db.wishlistItem.delete({ where: { id: existing.id } })
      return NextResponse.json({
        status: true,
        message: 'Removed from wishlist',
        data: null,
      })
    }

    return NextResponse.json(
      { status: false, message: 'User ID and Product ID, or wishlist item ID is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Wishlist delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}
