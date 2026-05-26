import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/crm-imports - List CRM imports
export async function GET(request: NextRequest) {
  try {
    const imports = await db.crmImport.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      status: true,
      data: imports,
    })
  } catch (error) {
    console.error('CRM imports fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch CRM imports' },
      { status: 500 }
    )
  }
}

// POST /api/crm-imports - Create CRM import
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, source, records, successful, failed, status, errors } = body

    if (!fileName) {
      return NextResponse.json(
        { status: false, message: 'File name is required' },
        { status: 400 }
      )
    }

    const crmImport = await db.crmImport.create({
      data: {
        fileName,
        source: source || 'csv',
        records: records || 0,
        successful: successful || 0,
        failed: failed || 0,
        status: status || 'pending',
        errors: errors || null,
      },
    })

    return NextResponse.json({
      status: true,
      data: crmImport,
    }, { status: 201 })
  } catch (error) {
    console.error('CRM import create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create CRM import' },
      { status: 500 }
    )
  }
}
