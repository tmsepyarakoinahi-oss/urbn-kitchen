import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/categories/[id] - Update category
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      slug,
      image,
      parentId,
      description,
      displayType,
      menuOrder,
      thumbnail,
      bannerImage,
      seoTitle,
      seoDescription,
      status,
    } = body

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ status: false, message: 'Category not found' }, { status: 404 })

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (image !== undefined) updateData.image = image || null
    if (parentId !== undefined) updateData.parentId = parentId || null
    if (description !== undefined) updateData.description = description || null
    if (displayType !== undefined) updateData.displayType = displayType
    if (menuOrder !== undefined) updateData.menuOrder = parseInt(String(menuOrder))
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail || null
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage || null
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle || null
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription || null
    if (status !== undefined) updateData.status = status

    const category = await db.category.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ status: true, message: 'Category updated successfully', data: category })
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json({ status: false, message: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ status: false, message: 'Category not found' }, { status: 404 })

    const productCount = await db.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return NextResponse.json({ status: false, message: `Cannot delete category with ${productCount} products` }, { status: 400 })
    }

    await db.category.delete({ where: { id } })
    return NextResponse.json({ status: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json({ status: false, message: 'Failed to delete category' }, { status: 500 })
  }
}
