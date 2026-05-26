import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/companies - List companies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { industry: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const companies = await db.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        _count: { select: { leads: true } },
      },
    })

    return NextResponse.json({
      status: true,
      data: companies,
    })
  } catch (error) {
    console.error('Companies fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

// POST /api/companies - Create company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, industry, website, phone, email, address, gstNumber, revenue, status, notes } = body

    if (!name) {
      return NextResponse.json(
        { status: false, message: 'Company name is required' },
        { status: 400 }
      )
    }

    const company = await db.company.create({
      data: {
        name,
        industry: industry || null,
        website: website || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        gstNumber: gstNumber || null,
        revenue: revenue || 0,
        status: status || 'prospect',
        notes: notes || null,
      },
    })

    return NextResponse.json({
      status: true,
      data: company,
    }, { status: 201 })
  } catch (error) {
    console.error('Company create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create company' },
      { status: 500 }
    )
  }
}
