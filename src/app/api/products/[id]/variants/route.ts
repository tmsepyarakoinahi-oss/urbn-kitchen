import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products/[id]/variants - List variants for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    const variants = await db.productVariant.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      status: true,
      message: 'Variants fetched successfully',
      data: variants,
    })
  } catch (error) {
    console.error('Variants fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch variants' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/variants - Add a new variant to a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, sku, price, stock, weight, dimensions, isDefault, sortOrder } = body

    if (!name || price === undefined) {
      return NextResponse.json(
        { status: false, message: 'Variant name and price are required' },
        { status: 400 }
      )
    }

    const variant = await db.productVariant.create({
      data: {
        productId: id,
        name,
        sku: sku || null,
        price: parseFloat(String(price)),
        stock: stock !== undefined ? parseInt(String(stock)) : 0,
        weight: weight || null,
        dimensions: dimensions || null,
        isDefault: isDefault || false,
        sortOrder: sortOrder !== undefined ? parseInt(String(sortOrder)) : 0,
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Variant created successfully',
      data: variant,
    }, { status: 201 })
  } catch (error) {
    console.error('Variant create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create variant' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id]/variants - Update a variant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { variantId, name, sku, price, stock, weight, dimensions, isDefault, sortOrder } = body

    if (!variantId) {
      return NextResponse.json(
        { status: false, message: 'variantId is required' },
        { status: 400 }
      )
    }

    const existingVariant = await db.productVariant.findFirst({
      where: { id: variantId, productId: id },
    })
    if (!existingVariant) {
      return NextResponse.json(
        { status: false, message: 'Variant not found for this product' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (sku !== undefined) updateData.sku = sku || null
    if (price !== undefined) updateData.price = parseFloat(String(price))
    if (stock !== undefined) updateData.stock = parseInt(String(stock))
    if (weight !== undefined) updateData.weight = weight || null
    if (dimensions !== undefined) updateData.dimensions = dimensions || null
    if (isDefault !== undefined) updateData.isDefault = Boolean(isDefault)
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(String(sortOrder))

    const variant = await db.productVariant.update({
      where: { id: variantId },
      data: updateData,
    })

    return NextResponse.json({
      status: true,
      message: 'Variant updated successfully',
      data: variant,
    })
  } catch (error) {
    console.error('Variant update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update variant' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]/variants - Delete a variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { variantId } = body

    if (!variantId) {
      return NextResponse.json(
        { status: false, message: 'variantId is required' },
        { status: 400 }
      )
    }

    const existingVariant = await db.productVariant.findFirst({
      where: { id: variantId, productId: id },
    })
    if (!existingVariant) {
      return NextResponse.json(
        { status: false, message: 'Variant not found for this product' },
        { status: 404 }
      )
    }

    await db.productVariant.delete({ where: { id: variantId } })

    return NextResponse.json({
      status: true,
      message: 'Variant deleted successfully',
      data: null,
    })
  } catch (error) {
    console.error('Variant delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete variant' },
      { status: 500 }
    )
  }
}
