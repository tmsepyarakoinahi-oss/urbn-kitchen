import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@urbankitchens.com'

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface LineItem {
  desc: string
  hsn?: string
  qty: number
  unit?: string
  rate: number
  discount?: number
  gstPercent?: number
  amount: number
}

function parseItems(raw: string | null | undefined): LineItem[] {
  if (!raw) return []
  try {
    return JSON.parse(raw) as LineItem[]
  } catch {
    return []
  }
}

function parseTerms(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [String(parsed)]
  } catch {
    return raw.split('\n').filter(Boolean)
  }
}

function parseBankDetails(raw: string | null | undefined): {
  bankName?: string
  accountName?: string
  accountNumber?: string
  ifsc?: string
  branch?: string
} | null {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ─── Lazy nodemailer transport ────────────────────────────────────────────────

async function createTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    return null
  }
  const nodemailer = await import('nodemailer')
  return nodemailer.default.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

// ─── HTML email generator ─────────────────────────────────────────────────────

function generateQuotationEmailHtml(
  quotation: {
    quotationNumber: string
    customerName: string
    customerCompany?: string | null
    customerEmail?: string | null
    customerPhone?: string | null
    customerAddress?: string | null
    customerGst?: string | null
    items: string | null
    subtotal: number
    cgstAmount: number
    sgstAmount: number
    igstAmount: number
    discountAmount: number
    totalGst: number
    amount: number
    notes?: string | null
    terms?: string | null
    bankDetails?: string | null
    validUntil?: Date | null
    deliveryPeriod?: string | null
    installation?: string | null
    warranty?: string | null
    createdAt: Date
  },
  lead: { name: string; company?: string | null; phone?: string | null; email?: string | null; city?: string | null } | null,
  settings: Record<string, string>
) {
  const items = parseItems(quotation.items)
  const terms = parseTerms(quotation.terms)
  const bank = parseBankDetails(quotation.bankDetails)

  const companyName = settings.company_name || 'Urban Kitchen Manufacturing & Solutions'
  const companyPhone = settings.company_phone || '+91-7080488840'
  const companyEmail = settings.company_email || 'info@urbankitchens.com'
  const companyAddress = settings.company_address || 'Plot No. 45, Sector 12, Industrial Area, New Delhi - 110020'
  const companyWebsite = settings.company_website || 'www.urbankitchens.com'
  const companyGst = settings.company_gst || ''

  const itemsRows = items.length > 0
    ? items
        .map(
          (item, i) => `
      <tr style="border-bottom: 1px solid #1f1f1f;">
        <td style="padding: 10px 12px; color: #d1d5db; font-size: 13px; text-align: center;">${i + 1}</td>
        <td style="padding: 10px 12px; color: #ffffff; font-size: 13px;">${item.desc}${item.hsn ? `<br><span style="color:#6b7280;font-size:11px;">HSN: ${item.hsn}</span>` : ''}</td>
        <td style="padding: 10px 12px; color: #d1d5db; font-size: 13px; text-align: center;">${item.qty} ${item.unit || ''}</td>
        <td style="padding: 10px 12px; color: #d1d5db; font-size: 13px; text-align: right;">${formatINR(item.rate)}</td>
        ${item.discount ? `<td style="padding: 10px 12px; color: #f87171; font-size: 13px; text-align: right;">-${formatINR(item.discount)}</td>` : ''}
        <td style="padding: 10px 12px; color: #d1d5db; font-size: 13px; text-align: center;">${item.gstPercent ?? 0}%</td>
        <td style="padding: 10px 12px; color: #59ff00; font-size: 13px; font-weight: 600; text-align: right;">${formatINR(item.amount)}</td>
      </tr>`
        )
        .join('')
    : `<tr><td colspan="7" style="padding: 20px; text-align: center; color: #6b7280;">No line items</td></tr>`

  const hasDiscounts = items.some((item) => item.discount && item.discount > 0)
  const discountColHeader = hasDiscounts ? '<th style="padding: 10px 12px; color: #9ca3af; font-size: 11px; text-transform: uppercase; text-align: right;">Discount</th>' : ''
  const discountCell = (item: LineItem) =>
    hasDiscounts && item.discount
      ? `<td style="padding: 10px 12px; color: #f87171; font-size: 13px; text-align: right;">-${formatINR(item.discount)}</td>`
      : ''

  // Rebuild items rows with conditional discount column
  const itemsRowsFixed = items.length > 0
    ? items
        .map(
          (item, i) => `
      <tr style="border-bottom: 1px solid #1f1f1f;">
        <td style="padding: 10px 12px; color: #d1d5db; font-size: 13px; text-align: center;">${i + 1}</td>
        <td style="padding: 10px 12px; color: #ffffff; font-size: 13px;">${item.desc}${item.hsn ? `<br><span style="color:#6b7280;font-size:11px;">HSN: ${item.hsn}</span>` : ''}</td>
        <td style="padding: 10px 12px; color: #d1d5db; font-size: 13px; text-align: center;">${item.qty} ${item.unit || ''}</td>
        <td style="padding: 10px 12px; color: #d1d5db; font-size: 13px; text-align: right;">${formatINR(item.rate)}</td>
        ${discountCell(item)}
        <td style="padding: 10px 12px; color: #d1d5db; font-size: 13px; text-align: center;">${item.gstPercent ?? 0}%</td>
        <td style="padding: 10px 12px; color: #59ff00; font-size: 13px; font-weight: 600; text-align: right;">${formatINR(item.amount)}</td>
      </tr>`
        )
        .join('')
    : `<tr><td colspan="7" style="padding: 20px; text-align: center; color: #6b7280;">No line items</td></tr>`

  const termsHtml =
    terms.length > 0
      ? terms
          .map(
            (t, i) =>
              `<li style="padding: 3px 0; color: #d1d5db; font-size: 12px; line-height: 1.5;">${t}</li>`
          )
          .join('')
      : '<li style="color: #6b7280; font-size: 12px;">Standard terms apply</li>'

  const bankHtml = bank
    ? `
    <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px 20px; margin-top: 20px;">
      <h3 style="margin: 0 0 12px; color: #59ff00; font-size: 14px;">Bank Details for Payment</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${bank.bankName ? `<tr><td style="padding: 4px 0; color: #9ca3af; font-size: 12px; width: 130px;">Bank</td><td style="padding: 4px 0; color: #ffffff; font-size: 13px;">${bank.bankName}</td></tr>` : ''}
        ${bank.accountName ? `<tr><td style="padding: 4px 0; color: #9ca3af; font-size: 12px;">Account Name</td><td style="padding: 4px 0; color: #ffffff; font-size: 13px;">${bank.accountName}</td></tr>` : ''}
        ${bank.accountNumber ? `<tr><td style="padding: 4px 0; color: #9ca3af; font-size: 12px;">Account No.</td><td style="padding: 4px 0; color: #ffffff; font-size: 13px; font-family: monospace;">${bank.accountNumber}</td></tr>` : ''}
        ${bank.ifsc ? `<tr><td style="padding: 4px 0; color: #9ca3af; font-size: 12px;">IFSC Code</td><td style="padding: 4px 0; color: #ffffff; font-size: 13px; font-family: monospace;">${bank.ifsc}</td></tr>` : ''}
        ${bank.branch ? `<tr><td style="padding: 4px 0; color: #9ca3af; font-size: 12px;">Branch</td><td style="padding: 4px 0; color: #ffffff; font-size: 13px;">${bank.branch}</td></tr>` : ''}
      </table>
    </div>`
    : ''

  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #111; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0b0b0b 0%, #1a1a1a 100%); padding: 28px 32px; border-bottom: 2px solid #59ff00;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td>
            <h1 style="margin: 0; color: #59ff00; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Urban Kitchen</h1>
            <p style="margin: 4px 0 0; color: #9ca3af; font-size: 12px;">Manufacturing & Solutions</p>
          </td>
          <td style="text-align: right;">
            <p style="margin: 0; color: #59ff00; font-size: 18px; font-weight: 700;">QUOTATION</p>
            <p style="margin: 4px 0 0; color: #9ca3af; font-size: 13px;">${quotation.quotationNumber}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Quotation Meta -->
    <div style="padding: 24px 32px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 50%;">
            <p style="margin: 0 0 4px; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Bill To</p>
            <p style="margin: 0; color: #ffffff; font-size: 15px; font-weight: 600;">${quotation.customerName}</p>
            ${quotation.customerCompany ? `<p style="margin: 2px 0 0; color: #d1d5db; font-size: 13px;">${quotation.customerCompany}</p>` : ''}
            ${quotation.customerAddress ? `<p style="margin: 6px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">${quotation.customerAddress}</p>` : ''}
            ${quotation.customerGst ? `<p style="margin: 4px 0 0; color: #6b7280; font-size: 11px;">GSTIN: ${quotation.customerGst}</p>` : ''}
          </td>
          <td style="vertical-align: top; text-align: right;">
            <table style="border-collapse: collapse; margin-left: auto;">
              <tr>
                <td style="padding: 4px 16px 4px 0; color: #9ca3af; font-size: 12px;">Date</td>
                <td style="padding: 4px 0; color: #ffffff; font-size: 13px; font-weight: 500;">${formatDate(quotation.createdAt)}</td>
              </tr>
              <tr>
                <td style="padding: 4px 16px 4px 0; color: #9ca3af; font-size: 12px;">Valid Until</td>
                <td style="padding: 4px 0; color: #ffffff; font-size: 13px; font-weight: 500;">${formatDate(quotation.validUntil)}</td>
              </tr>
              ${quotation.deliveryPeriod ? `<tr>
                <td style="padding: 4px 16px 4px 0; color: #9ca3af; font-size: 12px;">Delivery</td>
                <td style="padding: 4px 0; color: #ffffff; font-size: 13px; font-weight: 500;">${quotation.deliveryPeriod}</td>
              </tr>` : ''}
              ${quotation.installation ? `<tr>
                <td style="padding: 4px 16px 4px 0; color: #9ca3af; font-size: 12px;">Installation</td>
                <td style="padding: 4px 0; color: #ffffff; font-size: 13px; font-weight: 500;">${quotation.installation}</td>
              </tr>` : ''}
              ${quotation.warranty ? `<tr>
                <td style="padding: 4px 16px 4px 0; color: #9ca3af; font-size: 12px;">Warranty</td>
                <td style="padding: 4px 0; color: #ffffff; font-size: 13px; font-weight: 500;">${quotation.warranty}</td>
              </tr>` : ''}
            </table>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <div style="padding: 24px 32px;">
      <table style="width: 100%; border-collapse: collapse; background: #0d0d0d; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="border-bottom: 2px solid #59ff00;">
            <th style="padding: 12px; color: #59ff00; font-size: 11px; text-transform: uppercase; text-align: center;">#</th>
            <th style="padding: 12px; color: #59ff00; font-size: 11px; text-transform: uppercase; text-align: left;">Description</th>
            <th style="padding: 12px; color: #59ff00; font-size: 11px; text-transform: uppercase; text-align: center;">Qty</th>
            <th style="padding: 12px; color: #59ff00; font-size: 11px; text-transform: uppercase; text-align: right;">Rate</th>
            ${hasDiscounts ? '<th style="padding: 12px; color: #59ff00; font-size: 11px; text-transform: uppercase; text-align: right;">Discount</th>' : ''}
            <th style="padding: 12px; color: #59ff00; font-size: 11px; text-transform: uppercase; text-align: center;">GST</th>
            <th style="padding: 12px; color: #59ff00; font-size: 11px; text-transform: uppercase; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsFixed}
        </tbody>
      </table>
    </div>

    <!-- Summary -->
    <div style="padding: 0 32px 24px;">
      <table style="width: 280px; border-collapse: collapse; margin-left: auto;">
        <tr>
          <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Subtotal</td>
          <td style="padding: 6px 0; color: #d1d5db; font-size: 13px; text-align: right;">${formatINR(quotation.subtotal)}</td>
        </tr>
        ${quotation.discountAmount > 0 ? `<tr>
          <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Discount</td>
          <td style="padding: 6px 0; color: #f87171; font-size: 13px; text-align: right;">-${formatINR(quotation.discountAmount)}</td>
        </tr>` : ''}
        ${quotation.cgstAmount > 0 ? `<tr>
          <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">CGST</td>
          <td style="padding: 6px 0; color: #d1d5db; font-size: 13px; text-align: right;">${formatINR(quotation.cgstAmount)}</td>
        </tr>` : ''}
        ${quotation.sgstAmount > 0 ? `<tr>
          <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">SGST</td>
          <td style="padding: 6px 0; color: #d1d5db; font-size: 13px; text-align: right;">${formatINR(quotation.sgstAmount)}</td>
        </tr>` : ''}
        ${quotation.igstAmount > 0 ? `<tr>
          <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">IGST</td>
          <td style="padding: 6px 0; color: #d1d5db; font-size: 13px; text-align: right;">${formatINR(quotation.igstAmount)}</td>
        </tr>` : ''}
        <tr style="border-top: 2px solid #59ff00;">
          <td style="padding: 12px 0 4px; color: #ffffff; font-size: 16px; font-weight: 700;">Total</td>
          <td style="padding: 12px 0 4px; color: #59ff00; font-size: 18px; font-weight: 700; text-align: right;">${formatINR(quotation.amount)}</td>
        </tr>
      </table>
    </div>

    <!-- Notes -->
    ${quotation.notes ? `
    <div style="padding: 0 32px 20px;">
      <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px 20px;">
        <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 13px;">Notes</h3>
        <p style="margin: 0; color: #d1d5db; font-size: 13px; line-height: 1.6;">${quotation.notes}</p>
      </div>
    </div>` : ''}

    <!-- Terms & Conditions -->
    <div style="padding: 0 32px 20px;">
      <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px 20px;">
        <h3 style="margin: 0 0 10px; color: #ffffff; font-size: 13px;">Terms & Conditions</h3>
        <ol style="margin: 0; padding-left: 20px;">
          ${termsHtml}
        </ol>
      </div>
    </div>

    <!-- Bank Details -->
    ${bankHtml ? `<div style="padding: 0 32px 20px;">${bankHtml}</div>` : ''}

    <!-- CTA Button -->
    <div style="padding: 12px 32px 28px; text-align: center;">
      <a href="mailto:${companyEmail}?subject=Re: Quotation ${quotation.quotationNumber}" style="display: inline-block; background: #59ff00; color: #000000; font-size: 14px; font-weight: 700; padding: 14px 36px; border-radius: 8px; text-decoration: none; letter-spacing: 0.5px;">
        Reply to This Quotation
      </a>
      <p style="margin: 12px 0 0; color: #6b7280; font-size: 12px;">
        Have questions? Reach us at <a href="tel:${companyPhone}" style="color: #59ff00;">${companyPhone}</a> or <a href="mailto:${companyEmail}" style="color: #59ff00;">${companyEmail}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #0b0b0b; padding: 20px 32px; border-top: 1px solid #1a1a1a; text-align: center;">
      <p style="margin: 0; color: #d1d5db; font-size: 13px; font-weight: 600;">${companyName}</p>
      <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">${companyAddress}</p>
      ${companyGst ? `<p style="margin: 4px 0 0; color: #6b7280; font-size: 11px;">GSTIN: ${companyGst}</p>` : ''}
      <p style="margin: 8px 0 0; color: #6b7280; font-size: 11px;">
        <a href="tel:${companyPhone}" style="color: #6b7280; text-decoration: none;">${companyPhone}</a>
        &nbsp;|&nbsp;
        <a href="mailto:${companyEmail}" style="color: #6b7280; text-decoration: none;">${companyEmail}</a>
        &nbsp;|&nbsp;
        ${companyWebsite}
      </p>
    </div>
  </div>
  `
}

// ─── WhatsApp message generator ───────────────────────────────────────────────

function generateWhatsAppMessage(
  quotation: {
    quotationNumber: string
    customerName: string
    amount: number
    items: string | null
    validUntil?: Date | null
  },
  settings: Record<string, string>
): string {
  const items = parseItems(quotation.items)
  const companyPhone = settings.company_phone || '+91-7080488840'
  const companyEmail = settings.company_email || 'info@urbankitchens.com'

  const itemsBrief =
    items.length > 0
      ? items
          .slice(0, 5)
          .map((item) => `  • ${item.desc} — ${item.qty} ${item.unit || 'pcs'} × ${formatINR(item.rate)}`)
          .join('\n') + (items.length > 5 ? `\n  ... and ${items.length - 5} more item(s)` : '')
      : '  (Details in the email)'

  const validity = quotation.validUntil
    ? `Valid until: ${formatDate(quotation.validUntil)}`
    : ''

  const message = `Hello ${quotation.customerName},

Thank you for your interest in Urban Kitchen products. Here is your quotation:

📋 *Quotation: ${quotation.quotationNumber}*
💰 *Total Amount: ${formatINR(quotation.amount)}*

Items:
${itemsBrief}
${validity ? `\n📅 ${validity}` : ''}

A detailed quotation with complete pricing, tax breakdown, and terms has been sent to your email.

For any queries, contact us:
📞 ${companyPhone}
✉️ ${companyEmail}

We look forward to working with you!

— Urban Kitchen Manufacturing & Solutions`

  return message
}

// ─── Fetch settings helper ────────────────────────────────────────────────────

async function fetchSettings(): Promise<Record<string, string>> {
  const rows = await db.setting.findMany()
  const map: Record<string, string> = {}
  for (const row of rows) {
    map[row.key] = row.value
  }
  return map
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quotationId, method } = body as {
      quotationId?: string
      method?: 'email' | 'whatsapp' | 'both'
    }

    // ── Validate input ──────────────────────────────────────────────────
    if (!quotationId) {
      return NextResponse.json(
        { status: false, message: 'quotationId is required' },
        { status: 400 }
      )
    }

    if (!method || !['email', 'whatsapp', 'both'].includes(method)) {
      return NextResponse.json(
        { status: false, message: 'method must be "email", "whatsapp", or "both"' },
        { status: 400 }
      )
    }

    // ── Fetch quotation ─────────────────────────────────────────────────
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: { lead: true },
    })

    if (!quotation) {
      return NextResponse.json(
        { status: false, message: 'Quotation not found' },
        { status: 404 }
      )
    }

    // ── Fetch company settings ──────────────────────────────────────────
    const settings = await fetchSettings()

    const result: {
      emailSent?: boolean
      emailError?: string
      whatsappUrl?: string
      whatsappSent?: boolean
    } = {}

    // ── EMAIL SENDING ───────────────────────────────────────────────────
    if (method === 'email' || method === 'both') {
      if (!quotation.customerEmail) {
        return NextResponse.json(
          { status: false, message: 'Quotation has no customer email address. Cannot send via email.' },
          { status: 400 }
        )
      }

      const transporter = await createTransporter()

      if (!transporter) {
        console.warn('[QuotationSend] SMTP not configured. Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable email sending.')
        return NextResponse.json(
          { status: false, message: 'Email sending is not configured. Please set up SMTP credentials.' },
          { status: 503 }
        )
      }

      const htmlBody = generateQuotationEmailHtml(quotation, quotation.lead, settings)

      try {
        await transporter.sendMail({
          from: `"Urban Kitchen" <${EMAIL_FROM}>`,
          to: quotation.customerEmail,
          subject: `Quotation ${quotation.quotationNumber} — ${quotation.customerName} | Urban Kitchen`,
          html: htmlBody,
        })

        // Update quotation: mark email sent
        await db.quotation.update({
          where: { id: quotationId },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
            status: quotation.status === 'draft' ? 'sent' : quotation.status,
          },
        })

        result.emailSent = true
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown email error'
        console.error('[QuotationSend] Failed to send quotation email:', message)
        result.emailSent = false
        result.emailError = message
      }
    }

    // ── WHATSAPP SENDING ────────────────────────────────────────────────
    if (method === 'whatsapp' || method === 'both') {
      if (!quotation.customerPhone) {
        return NextResponse.json(
          { status: false, message: 'Quotation has no customer phone number. Cannot send via WhatsApp.' },
          { status: 400 }
        )
      }

      const waMessage = generateWhatsAppMessage(quotation, settings)
      // Clean phone number: strip +, spaces, dashes
      const cleanPhone = quotation.customerPhone.replace(/[\s+\-()]/g, '')
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`

      // Update quotation: mark whatsapp sent
      await db.quotation.update({
        where: { id: quotationId },
        data: {
          whatsappSent: true,
          whatsappSentAt: new Date(),
        },
      })

      result.whatsappSent = true
      result.whatsappUrl = waUrl
    }

    // ── Update lead status (only if quotation has a lead) ──────────────
    if (quotation.leadId && quotation.lead) {
      const leadStatusOrder = ['new', 'contacted', 'quotation_sent', 'negotiation', 'won', 'lost']
      const currentLeadStatus = quotation.lead.status || 'new'
      const currentIndex = leadStatusOrder.indexOf(currentLeadStatus)
      const targetIndex = leadStatusOrder.indexOf('quotation_sent')

      if (currentIndex < targetIndex) {
        await db.lead.update({
          where: { id: quotation.leadId },
          data: { status: 'quotation_sent' },
        })
      }
    }

    // ── Return response ─────────────────────────────────────────────────
    return NextResponse.json({
      status: true,
      message: `Quotation ${method === 'both' ? 'sent via email and WhatsApp' : method === 'email' ? 'sent via email' : 'WhatsApp link generated'}`,
      data: result,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[QuotationSend] Unexpected error:', message)
    return NextResponse.json(
      { status: false, message: 'Failed to process quotation send request', error: message },
      { status: 500 }
    )
  }
}
