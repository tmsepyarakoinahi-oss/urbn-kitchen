import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/categories/[id] - Update category
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, slug, image, parentId } = body

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ status: false, message: 'Category not found' }, { status: 404 })

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (slug) updateData.slug = slug
    if (image !== undefined) updateData.image = image || null
    if (parentId !== undefined) updateData.parentId = parentId || null

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
