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
        variants: { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!product) {
      return NextResponse.json(
        { status: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Compute priceRange and defaultVariant if variants exist
    let responseData: typeof product & { priceRange?: { min: number; max: number }; defaultVariant?: typeof product.variants[0] | null } = product
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map((v) => v.price)
      const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0]
      responseData = {
        ...product,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
        defaultVariant,
      }
    }

    return NextResponse.json({
      status: true,
      message: 'Product fetched successfully',
      data: responseData,
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
    const allowedFields = ['name', 'slug', 'categoryId', 'description', 'shortDescription', 'longDescription', 'price', 'steelGrade', 'capacity', 'dimensions', 'stock', 'moq', 'leadTime', 'featuredImage', 'status', 'featured', 'variants']

    for (const field of allowedFields) {
      if (field === 'variants') continue // Handle variants separately
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

    // Handle variants update in a transaction
    const product = await db.$transaction(async (tx) => {
      // Update the product fields first
      const updated = await tx.product.update({
        where: { id },
        data: updateData,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { orderBy: { sortOrder: 'asc' } },
        },
      })

      // Handle variants if provided
      if (body.variants !== undefined && Array.isArray(body.variants)) {
        const newVariants = body.variants as Array<{
          id?: string
          name: string
          sku?: string
          price: number
          stock: number
          weight?: string
          dimensions?: string
          isDefault?: boolean
          sortOrder?: number
        }>

        // Get existing variant IDs
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
          select: { id: true },
        })
        const existingVariantIds = new Set(existingVariants.map((v) => v.id))

        // Determine which variant IDs are in the new list
        const newVariantIds = new Set(
          newVariants.filter((v) => v.id).map((v) => v.id)
        )

        // Delete variants that are not in the new list
        const variantIdsToDelete = [...existingVariantIds].filter(
          (vid) => !newVariantIds.has(vid)
        )
        if (variantIdsToDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: variantIdsToDelete } },
          })
        }

        // Upsert variants from the list
        for (const variant of newVariants) {
          const variantData = {
            name: variant.name,
            sku: variant.sku || null,
            price: parseFloat(String(variant.price)),
            stock: parseInt(String(variant.stock)) || 0,
            weight: variant.weight || null,
            dimensions: variant.dimensions || null,
            isDefault: variant.isDefault || false,
            sortOrder: variant.sortOrder || 0,
          }

          if (variant.id && existingVariantIds.has(variant.id)) {
            // Update existing variant
            await tx.productVariant.update({
              where: { id: variant.id },
              data: variantData,
            })
          } else {
            // Create new variant
            await tx.productVariant.create({
              data: {
                productId: id,
                ...variantData,
              },
            })
          }
        }

        // Re-fetch with updated variants
        return tx.product.findUnique({
          where: { id },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            variants: { orderBy: { sortOrder: 'asc' } },
          },
        })
      }

      return updated
    })

    // Compute priceRange and defaultVariant for the response
    const responseData = product ? (() => {
      if (product.variants && product.variants.length > 0) {
        const prices = product.variants.map((v) => v.price)
        const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0]
        return {
          ...product,
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices),
          },
          defaultVariant,
        }
      }
      return product
    })() : null

    return NextResponse.json({
      status: true,
      message: 'Product updated successfully',
      data: responseData,
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

    // Delete related images first (cascade should handle variants and images, but being explicit for images)
    await db.productImage.deleteMany({ where: { productId: id } })
    await db.productVariant.deleteMany({ where: { productId: id } })
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
