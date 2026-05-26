import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/email-templates/[id] - Get single email template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const template = await db.emailTemplate.findUnique({ where: { id } })

    if (!template) {
      return NextResponse.json(
        { status: false, message: 'Email template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: template,
    })
  } catch (error) {
    console.error('Email template fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch email template' },
      { status: 500 }
    )
  }
}

// PUT /api/email-templates/[id] - Update email template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.emailTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Email template not found' },
        { status: 404 }
      )
    }

    const { name, subject, body: templateBody, category, variables, status } = body
    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (subject) updateData.subject = subject
    if (templateBody) updateData.body = templateBody
    if (category) updateData.category = category
    if (variables) updateData.variables = variables
    if (status) updateData.status = status

    const template = await db.emailTemplate.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      status: true,
      data: template,
    })
  } catch (error) {
    console.error('Email template update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update email template' },
      { status: 500 }
    )
  }
}

// DELETE /api/email-templates/[id] - Delete email template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.emailTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Email template not found' },
        { status: 404 }
      )
    }

    await db.emailTemplate.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      data: { id },
    })
  } catch (error) {
    console.error('Email template delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete email template' },
      { status: 500 }
    )
  }
}
