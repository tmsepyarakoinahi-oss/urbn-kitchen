import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      message: 'Product fetched successfully',
      data: product,
    })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingProduct = await db.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'slug', 'categoryId', 'description', 'shortDescription', 'price', 'steelGrade', 'capacity', 'dimensions', 'stock', 'moq', 'leadTime', 'featuredImage', 'status', 'featured']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'price') {
          updateData[field] = parseFloat(body[field])
        } else if (field === 'stock' || field === 'moq') {
          updateData[field] = parseInt(body[field])
        } else if (field === 'featured') {
          updateData[field] = Boolean(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Product updated successfully',
      data: product,
    })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingProduct = await db.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete related images first (cascade should handle this, but being explicit)
    await db.productImage.deleteMany({ where: { productId: id } })
    await db.product.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      message: 'Product deleted successfully',
      data: null,
    })
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
