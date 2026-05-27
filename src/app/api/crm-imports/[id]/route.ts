import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/crm-imports/[id] - Get single CRM import
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const crmImport = await db.crmImport.findUnique({ where: { id } })

    if (!crmImport) {
      return NextResponse.json(
        { status: false, message: 'CRM import not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: crmImport,
    })
  } catch (error) {
    console.error('CRM import fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch CRM import' },
      { status: 500 }
    )
  }
}

// PUT /api/crm-imports/[id] - Update CRM import
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.crmImport.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'CRM import not found' },
        { status: 404 }
      )
    }

    const { fileName, source, records, successful, failed, status, errors } = body
    const updateData: Record<string, unknown> = {}

    if (fileName) updateData.fileName = fileName
    if (source) updateData.source = source
    if (records !== undefined) updateData.records = records
    if (successful !== undefined) updateData.successful = successful
    if (failed !== undefined) updateData.failed = failed
    if (status) updateData.status = status
    if (errors !== undefined) updateData.errors = errors || null

    const crmImport = await db.crmImport.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      status: true,
      data: crmImport,
    })
  } catch (error) {
    console.error('CRM import update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update CRM import' },
      { status: 500 }
    )
  }
}

// DELETE /api/crm-imports/[id] - Delete CRM import
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.crmImport.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'CRM import not found' },
        { status: 404 }
      )
    }

    await db.crmImport.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      data: { id },
    })
  } catch (error) {
    console.error('CRM import delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete CRM import' },
      { status: 500 }
    )
  }
}
