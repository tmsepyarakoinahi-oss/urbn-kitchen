import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/assets/[id] - Fetch single asset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.asset.findUnique({
      where: { id },
      include: {
        assignee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!result) {
      return Response.json(
        { status: false, message: 'Asset not found' },
        { status: 404 }
      )
    }

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Asset fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch asset' },
      { status: 500 }
    )
  }
}

// PUT /api/assets/[id] - Update asset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, serialNo, value, assignedTo, purchaseDate, status } = body

    const existing = await db.asset.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Asset not found' },
        { status: 404 }
      )
    }

    const result = await db.asset.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(serialNo !== undefined && { serialNo }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(purchaseDate !== undefined && { purchaseDate: purchaseDate ? new Date(purchaseDate) : null }),
        ...(status !== undefined && { status }),
      },
      include: {
        assignee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Asset update error:', error)
    return Response.json(
      { status: false, message: 'Failed to update asset' },
      { status: 500 }
    )
  }
}

// DELETE /api/assets/[id] - Delete asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.asset.findUnique({ where: { id } })
    if (!existing) {
      return Response.json(
        { status: false, message: 'Asset not found' },
        { status: 404 }
      )
    }

    await db.asset.delete({ where: { id } })

    return Response.json({ status: true, data: { id } })
  } catch (error) {
    console.error('Asset delete error:', error)
    return Response.json(
      { status: false, message: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
