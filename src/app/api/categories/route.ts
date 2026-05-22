import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/categories - List all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      status: true,
      message: 'Categories fetched successfully',
      data: categories,
    })
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, image, parentId } = body

    if (!name) {
      return NextResponse.json(
        { status: false, message: 'Category name is required' },
        { status: 400 }
      )
    }

    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // Check if slug already exists
    const existing = await db.category.findUnique({ where: { slug: categorySlug } })
    if (existing) {
      return NextResponse.json(
        { status: false, message: 'Category with this slug already exists' },
        { status: 409 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        slug: categorySlug,
        image: image || null,
        parentId: parentId || null,
      },
    })

    return NextResponse.json({
      status: true,
      message: 'Category created successfully',
      data: category,
    }, { status: 201 })
  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create category' },
      { status: 500 }
    )
  }
}
