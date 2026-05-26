import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/quotations/[id] - Get a single quotation
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const quotation = await db.quotation.findUnique({
      where: { id },
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
            message: true,
            status: true,
            source: true,
            assignedTo: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    if (!quotation) {
      return NextResponse.json(
        { status: false, message: 'Quotation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      message: 'Quotation fetched successfully',
      data: quotation,
    })
  } catch (error) {
    console.error('Quotation fetch error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch quotation' },
      { status: 500 }
    )
  }
}

// PUT /api/quotations/[id] - Update a quotation
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const existing = await db.quotation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Quotation not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      customerName,
      customerCompany,
      customerEmail,
      customerPhone,
      customerAddress,
      customerGst,
      items,
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      discountAmount,
      totalGst,
      amount,
      notes,
      terms,
      bankDetails,
      validUntil,
      status,
      deliveryPeriod,
      installation,
      warranty,
      emailSent,
      whatsappSent,
      pdf,
    } = body

    // Build update data object
    const updateData: Record<string, unknown> = {}

    // Customer details
    if (customerName !== undefined) updateData.customerName = customerName
    if (customerCompany !== undefined) updateData.customerCompany = customerCompany
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone
    if (customerAddress !== undefined) updateData.customerAddress = customerAddress
    if (customerGst !== undefined) updateData.customerGst = customerGst

    // Items and calculations
    if (items !== undefined) {
      const parsedItems = typeof items === 'string' ? JSON.parse(items) : items
      updateData.items = JSON.stringify(parsedItems)

      // Auto-recalculate from items if subtotal is not explicitly provided
      if (subtotal === undefined) {
        const calculatedSubtotal = parsedItems.reduce(
          (sum: number, item: { qty?: number; rate?: number; discount?: number }) => {
            const itemDiscount = item.discount || 0
            return sum + (item.qty || 0) * (item.rate || 0) - itemDiscount
          },
          0
        )

        updateData.subtotal = calculatedSubtotal
        updateData.discountAmount = parsedItems.reduce(
          (sum: number, item: { discount?: number }) => sum + (item.discount || 0),
          0
        )

        let totalCgst = 0
        let totalSgst = 0
        let totalIgst = 0

        for (const item of parsedItems) {
          const itemDiscount = item.discount || 0
          const taxableAmount = (item.qty || 0) * (item.rate || 0) - itemDiscount
          const gstPercent = item.gstPercent || 0

          if (gstPercent > 0) {
            if (igstAmount !== undefined && cgstAmount === undefined && sgstAmount === undefined) {
              totalIgst += taxableAmount * (gstPercent / 100)
            } else {
              totalCgst += taxableAmount * (gstPercent / 200)
              totalSgst += taxableAmount * (gstPercent / 200)
            }
          }
        }

        updateData.cgstAmount = cgstAmount ?? Math.round(totalCgst * 100) / 100
        updateData.sgstAmount = sgstAmount ?? Math.round(totalSgst * 100) / 100
        updateData.igstAmount = igstAmount ?? Math.round(totalIgst * 100) / 100
        updateData.totalGst =
          Math.round(
            ((updateData.cgstAmount as number) + (updateData.sgstAmount as number) + (updateData.igstAmount as number)) * 100
          ) / 100
        updateData.amount =
          Math.round(
            ((updateData.subtotal as number) + (updateData.totalGst as number) - (updateData.discountAmount as number)) * 100
          ) / 100
      }
    }

    // Explicit financial overrides
    if (subtotal !== undefined) updateData.subtotal = parseFloat(String(subtotal))
    if (cgstAmount !== undefined) updateData.cgstAmount = parseFloat(String(cgstAmount))
    if (sgstAmount !== undefined) updateData.sgstAmount = parseFloat(String(sgstAmount))
    if (igstAmount !== undefined) updateData.igstAmount = parseFloat(String(igstAmount))
    if (discountAmount !== undefined) updateData.discountAmount = parseFloat(String(discountAmount))
    if (totalGst !== undefined) updateData.totalGst = parseFloat(String(totalGst))
    if (amount !== undefined) updateData.amount = parseFloat(String(amount))

    // Additional fields
    if (notes !== undefined) updateData.notes = notes
    if (terms !== undefined) {
      updateData.terms = typeof terms === 'string' ? terms : JSON.stringify(terms)
    }
    if (bankDetails !== undefined) {
      updateData.bankDetails =
        typeof bankDetails === 'string' ? bankDetails : JSON.stringify(bankDetails)
    }
    if (validUntil !== undefined) {
      updateData.validUntil = validUntil ? new Date(validUntil) : null
    }
    if (deliveryPeriod !== undefined) updateData.deliveryPeriod = deliveryPeriod
    if (installation !== undefined) updateData.installation = installation
    if (warranty !== undefined) updateData.warranty = warranty
    if (pdf !== undefined) updateData.pdf = pdf

    // Email/WhatsApp sent tracking
    if (emailSent !== undefined) {
      updateData.emailSent = emailSent
      if (emailSent && !existing.emailSentAt) {
        updateData.emailSentAt = new Date()
      } else if (!emailSent) {
        updateData.emailSentAt = null
      }
    }
    if (whatsappSent !== undefined) {
      updateData.whatsappSent = whatsappSent
      if (whatsappSent && !existing.whatsappSentAt) {
        updateData.whatsappSentAt = new Date()
      } else if (!whatsappSent) {
        updateData.whatsappSentAt = null
      }
    }

    // Status change handling
    if (status !== undefined && status !== existing.status) {
      updateData.status = status

      // Update associated lead status based on quotation status
      if (existing.leadId) {
        const leadUpdate: { status?: string } = {}

        if (status === 'sent') {
          leadUpdate.status = 'quotation_sent'
        } else if (status === 'accepted') {
          leadUpdate.status = 'won'
        } else if (status === 'rejected') {
          // Only update lead to "lost" if it's not already "won"
          const lead = await db.lead.findUnique({
            where: { id: existing.leadId },
            select: { status: true },
          })
          if (lead && lead.status !== 'won') {
            leadUpdate.status = 'lost'
          }
        }

        if (leadUpdate.status) {
          await db.lead.update({
            where: { id: existing.leadId },
            data: leadUpdate,
          })
        }
      }
    }

    const quotation = await db.quotation.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({
      status: true,
      message: 'Quotation updated successfully',
      data: quotation,
    })
  } catch (error) {
    console.error('Quotation update error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update quotation' },
      { status: 500 }
    )
  }
}

// DELETE /api/quotations/[id] - Delete a quotation
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const existing = await db.quotation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { status: false, message: 'Quotation not found' },
        { status: 404 }
      )
    }

    await db.quotation.delete({ where: { id } })

    return NextResponse.json({
      status: true,
      message: 'Quotation deleted successfully',
    })
  } catch (error) {
    console.error('Quotation delete error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete quotation' },
      { status: 500 }
    )
  }
}
