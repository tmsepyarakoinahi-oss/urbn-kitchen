import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/integrations - List integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (category) where.category = category

    const integrations = await db.integration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      status: true,
      data: integrations,
    })
  } catch (error) {
    console.error('Integrations fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

// POST /api/integrations - Create integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, config, status } = body

    if (!name) {
      return NextResponse.json(
        { status: false, message: 'Integration name is required' },
        { status: 400 }
      )
    }

    const integration = await db.integration.create({
      data: {
        name,
        category: category || 'crm',
        config: config || '{}',
        status: status || 'disconnected',
      },
    })

    return NextResponse.json({
      status: true,
      data: integration,
    }, { status: 201 })
  } catch (error) {
    console.error('Integration create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create integration' },
      { status: 500 }
    )
  }
}
