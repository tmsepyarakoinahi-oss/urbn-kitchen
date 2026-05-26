import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/quotations - List quotations with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (leadId) where.leadId = leadId
    if (status) where.status = status

    const [quotations, total] = await Promise.all([
      db.quotation.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
              phone: true,
              city: true,
              requirement: true,
              status: true,
              source: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.quotation.count({ where }),
    ])

    return NextResponse.json({
      status: true,
      message: 'Quotations fetched successfully',
      data: {
        quotations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Quotations fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch quotations' },
      { status: 500 }
    )
  }
}

// POST /api/quotations - Create a quotation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      leadId,
      customerName: bodyCustomerName,
      customerCompany,
      customerEmail,
      customerPhone,
      customerAddress,
      customerGst,
      items,
      subtotal: bodySubtotal,
      cgstAmount: bodyCgst,
      sgstAmount: bodySgst,
      igstAmount: bodyIgst,
      discountAmount: bodyDiscount,
      totalGst: bodyTotalGst,
      amount: bodyAmount,
      notes,
      terms,
      bankDetails,
      validUntil,
      status,
      deliveryPeriod,
      installation,
      warranty,
    } = body

    // customerName is required (either explicitly or via lead)
    if (!bodyCustomerName && !leadId) {
      return NextResponse.json(
        { status: false, message: 'customerName is required when leadId is not provided' },
        { status: 400 }
      )
    }

    // If leadId is provided, fetch the lead
    let lead: any = null
    if (leadId) {
      lead = await db.lead.findUnique({ where: { id: leadId } })
      if (!lead) {
        return NextResponse.json(
          { status: false, message: 'Lead not found' },
          { status: 404 }
        )
      }
    }

    // Resolve customer details: explicit values take priority, then fill from lead
    const customerName = bodyCustomerName || (lead ? lead.name : '')
    const resolvedCustomerCompany = customerCompany ?? (lead?.company ?? null)
    const resolvedCustomerEmail = customerEmail ?? (lead?.email ?? null)
    const resolvedCustomerPhone = customerPhone ?? (lead?.phone ?? null)

    // Build customer address from lead city if not explicitly provided
    const resolvedCustomerAddress = customerAddress ?? (lead?.city ?? null)

    // Auto-generate quotation number
    const count = await db.quotation.count()
    const quotationNumber = `QUO-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`

    // Parse items and auto-calculate totals if items provided
    let parsedItems: Array<{
      desc?: string
      hsn?: string
      qty?: number
      unit?: string
      rate?: number
      discount?: number
      gstPercent?: number
      amount?: number
    }> | null = null

    if (items) {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items
    }

    let subtotal = bodySubtotal ? parseFloat(String(bodySubtotal)) : 0
    let cgstAmount = bodyCgst ? parseFloat(String(bodyCgst)) : 0
    let sgstAmount = bodySgst ? parseFloat(String(bodySgst)) : 0
    let igstAmount = bodyIgst ? parseFloat(String(bodyIgst)) : 0
    let discountAmount = bodyDiscount ? parseFloat(String(bodyDiscount)) : 0
    let totalGst = bodyTotalGst ? parseFloat(String(bodyTotalGst)) : 0
    let amount = bodyAmount ? parseFloat(String(bodyAmount)) : 0

    // Auto-calculate from items if subtotal not provided
    if (parsedItems && parsedItems.length > 0 && !bodySubtotal) {
      subtotal = parsedItems.reduce((sum, item) => {
        const itemDiscount = item.discount || 0
        const itemAmount = (item.qty || 0) * (item.rate || 0) - itemDiscount
        return sum + itemAmount
      }, 0)

      // Calculate tax amounts per item
      let totalCgst = 0
      let totalSgst = 0
      let totalIgst = 0

      for (const item of parsedItems) {
        const itemDiscount = item.discount || 0
        const taxableAmount = (item.qty || 0) * (item.rate || 0) - itemDiscount
        const gstPercent = item.gstPercent || 0

        if (gstPercent > 0) {
          // If it's an inter-state supply, use IGST; otherwise split into CGST + SGST
          // We'll use a simple heuristic: if customerGst is provided (business), split CGST+SGST
          // Otherwise use IGST. But for simplicity, we check if both CGST and SGST were explicitly 0
          if (bodyIgst && !bodyCgst && !bodySgst) {
            totalIgst += taxableAmount * (gstPercent / 100)
          } else {
            totalCgst += taxableAmount * (gstPercent / 200)
            totalSgst += taxableAmount * (gstPercent / 200)
          }
        }
      }

      if (!bodyCgst) cgstAmount = Math.round(totalCgst * 100) / 100
      if (!bodySgst) sgstAmount = Math.round(totalSgst * 100) / 100
      if (!bodyIgst) igstAmount = Math.round(totalIgst * 100) / 100

      discountAmount = parsedItems.reduce(
        (sum, item) => sum + (item.discount || 0),
        0
      )

      totalGst = Math.round((cgstAmount + sgstAmount + igstAmount) * 100) / 100
      amount = Math.round((subtotal + totalGst) * 100) / 100
    } else if (bodySubtotal && bodyAmount) {
      // Use provided values as-is
    } else if (bodySubtotal && !bodyAmount) {
      // Calculate amount from subtotal + taxes
      totalGst = Math.round((cgstAmount + sgstAmount + igstAmount) * 100) / 100
      amount = Math.round((subtotal + totalGst - discountAmount) * 100) / 100
    } else if (!parsedItems || parsedItems.length === 0) {
      // No items, just use the provided amount
      if (!bodyAmount) {
        return NextResponse.json(
          { status: false, message: 'amount is required when no items are provided' },
          { status: 400 }
        )
      }
    }

    const quotation = await db.quotation.create({
      data: {
        leadId: leadId || null,
        quotationNumber,
        amount,
        customerName,
        customerCompany: resolvedCustomerCompany,
        customerEmail: resolvedCustomerEmail,
        customerPhone: resolvedCustomerPhone,
        customerAddress: resolvedCustomerAddress,
        customerGst: customerGst || null,
        items: parsedItems ? JSON.stringify(parsedItems) : null,
        subtotal,
        cgstAmount,
        sgstAmount,
        igstAmount,
        discountAmount,
        totalGst,
        notes: notes || null,
        terms: terms ? (typeof terms === 'string' ? terms : JSON.stringify(terms)) : null,
        bankDetails: bankDetails
          ? typeof bankDetails === 'string'
            ? bankDetails
            : JSON.stringify(bankDetails)
          : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        status: status || 'draft',
        deliveryPeriod: deliveryPeriod || null,
        installation: installation || null,
        warranty: warranty || null,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
            city: true,
            requirement: true,
            status: true,
            source: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        status: true,
        message: 'Quotation created successfully',
        data: quotation,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Quotation create error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create quotation' },
      { status: 500 }
    )
  }
}
