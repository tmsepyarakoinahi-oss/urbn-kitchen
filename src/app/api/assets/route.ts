import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// GET /api/assets - List assets with type, status filters, include assignee relation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status

    const result = await db.asset.findMany({
      where,
      include: {
        assignee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ status: true, data: result })
  } catch (error) {
    console.error('Assets fetch error:', error)
    return Response.json(
      { status: false, message: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

// POST /api/assets - Create asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, serialNo, value, assignedTo, purchaseDate, status } = body

    if (!name) {
      return Response.json(
        { status: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    const result = await db.asset.create({
      data: {
        name,
        type: type || 'electronics',
        serialNo: serialNo || null,
        value: value ? parseFloat(value) : 0,
        assignedTo: assignedTo || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        status: status || 'available',
      },
      include: {
        assignee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return Response.json({ status: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Asset create error:', error)
    return Response.json(
      { status: false, message: 'Failed to create asset' },
      { status: 500 }
    )
  }
}
