import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/lead-sources - List lead sources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (type) where.type = type

    const sources = await db.leadSource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      status: true,
      data: sources,
    })
  } catch (error) {
    console.error('Lead sources fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch lead sources' },
      { status: 500 }
    )
  }
}

// POST /api/lead-sources - Create lead source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, cost, status } = body

    if (!name) {
      return NextResponse.json(
        { status: false, message: 'Lead source name is required' },
        { status: 400 }
      )
    }

    const source = await db.leadSource.create({
      data: {
        name,
        type: type || 'organic',
        cost: cost || 0,
        status: status || 'active',
      },
    })

    return NextResponse.json({
      status: true,
      data: source,
    }, { status: 201 })
  } catch (error) {
    console.error('Lead source create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create lead source' },
      { status: 500 }
    )
  }
}
