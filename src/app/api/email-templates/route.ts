import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/email-templates - List email templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (category) where.category = category

    const templates = await db.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      status: true,
      data: templates,
    })
  } catch (error) {
    console.error('Email templates fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch email templates' },
      { status: 500 }
    )
  }
}

// POST /api/email-templates - Create email template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, body: templateBody, category, variables } = body

    if (!name || !subject || !templateBody) {
      return NextResponse.json(
        { status: false, message: 'Name, subject, and body are required' },
        { status: 400 }
      )
    }

    const template = await db.emailTemplate.create({
      data: {
        name,
        subject,
        body: templateBody,
        category: category || 'general',
        variables: variables || '[]',
      },
    })

    return NextResponse.json({
      status: true,
      data: template,
    }, { status: 201 })
  } catch (error) {
    console.error('Email template create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create email template' },
      { status: 500 }
    )
  }
}
