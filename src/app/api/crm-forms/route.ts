import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/crm-forms - List CRM forms
export async function GET(request: NextRequest) {
  try {
    const forms = await db.crmForm.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      status: true,
      data: forms,
    })
  } catch (error) {
    console.error('CRM forms fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch CRM forms' },
      { status: 500 }
    )
  }
}

// POST /api/crm-forms - Create CRM form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, fields, status } = body

    if (!name) {
      return NextResponse.json(
        { status: false, message: 'Form name is required' },
        { status: 400 }
      )
    }

    const form = await db.crmForm.create({
      data: {
        name,
        fields: fields || '[]',
        status: status || 'active',
      },
    })

    return NextResponse.json({
      status: true,
      data: form,
    }, { status: 201 })
  } catch (error) {
    console.error('CRM form create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create CRM form' },
      { status: 500 }
    )
  }
}
