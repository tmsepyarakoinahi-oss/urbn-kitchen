import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products - List products with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { shortDescription: { contains: search } },
        { steelGrade: { contains: search } },
      ]
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (status) {
      where.status = status
    } else {
      where.status = 'active'
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Products fetched successfully',
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create product (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, categoryId, description, shortDescription, price, steelGrade, capacity, dimensions, stock, moq, leadTime, featuredImage, status, featured, slug } = body

    if (!name || !categoryId || !description || !price) {
      return NextResponse.json(
        { status: false, message: 'Name, categoryId, description, and price are required' },
        { status: 400 }
      )
    }

    // Verify category exists
    const category = await db.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json(
        { status: false, message: 'Category not found' },
        { status: 404 }
      )
    }

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const product = await db.product.create({
      data: {
        name,
        slug: productSlug,
        categoryId,
        description,
        shortDescription: shortDescription || null,
        price: parseFloat(price),
        steelGrade: steelGrade || null,
        capacity: capacity || null,
        dimensions: dimensions || null,
        stock: stock ? parseInt(stock) : 0,
        moq: moq ? parseInt(moq) : 1,
        leadTime: leadTime || null,
        featuredImage: featuredImage || null,
        status: status || 'active',
        featured: featured || false,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Product created successfully',
      data: product,
    }, { status: 201 })
  } catch (error) {
    console.error('Product create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create product' },
      { status: 500 }
    )
  }
}
