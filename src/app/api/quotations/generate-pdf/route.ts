import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import { db } from '@/lib/db'

// ─── Indian Number to Words ──────────────────────────────────────────────────

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
]

function convertBelowThousand(n: number): string {
  if (n === 0) return ''
  if (n < 20) return ONES[n]
  if (n < 100) {
    return TENS[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ONES[n % 10] : '')
  }
  return (
    ONES[Math.floor(n / 100)] +
    ' Hundred' +
    (n % 100 !== 0 ? ' ' + convertBelowThousand(n % 100) : '')
  )
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero'
  if (num < 0) return 'Minus ' + numberToWords(-num)

  let result = ''

  // Crores (1,00,00,000)
  if (num >= 10000000) {
    result += convertBelowThousand(Math.floor(num / 10000000)) + ' Crore '
    num %= 10000000
  }

  // Lakhs (1,00,000)
  if (num >= 100000) {
    result += convertBelowThousand(Math.floor(num / 100000)) + ' Lakh '
    num %= 100000
  }

  // Thousands (1,000)
  if (num >= 1000) {
    result += convertBelowThousand(Math.floor(num / 1000)) + ' Thousand '
    num %= 1000
  }

  // Hundreds & below
  if (num > 0) {
    result += convertBelowThousand(num)
  }

  return result.trim()
}

function amountToWords(amount: number): string {
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)

  let words = 'Rupees ' + numberToWords(rupees)
  if (paise > 0) {
    words += ' and ' + numberToWords(paise) + ' Paise'
  }
  words += ' Only'
  return words
}

// ─── Color Constants ─────────────────────────────────────────────────────────

const GREEN_ACCENT = rgb(89 / 255, 1.0, 0 / 255) // #59ff00
const DARK_GREEN = rgb(0.15, 0.45, 0.1)
const BLACK = rgb(0, 0, 0)
const WHITE = rgb(1, 1, 1)
const LIGHT_GRAY = rgb(0.95, 0.95, 0.95)
const MEDIUM_GRAY = rgb(0.6, 0.6, 0.6)
const TABLE_HEADER_BG = rgb(0.13, 0.42, 0.08) // Dark green for table header
const TABLE_ALT_ROW = rgb(0.96, 1.0, 0.96) // Very light green tint

// ─── PDF Generation Helper ───────────────────────────────────────────────────

interface DrawTextOptions {
  text: string
  x: number
  y: number
  size?: number
  font?: 'regular' | 'bold'
  color?: ReturnType<typeof rgb>
  maxWidth?: number
  align?: 'left' | 'right' | 'center'
}

interface ColumnDef {
  header: string
  width: number
  align?: 'left' | 'right' | 'center'
}

class QuotationPDFBuilder {
  private pdfDoc: PDFDocument
  private pageWidth = 595.28
  private pageHeight = 841.89
  private margin = 45
  private currentY = 0
  private currentPage = 0
  private pages: PDFPage[] = []
  private fontRegular!: PDFFont
  private fontBold!: PDFFont

  private constructor(pdfDoc: PDFDocument) {
    this.pdfDoc = pdfDoc
  }

  static async create(): Promise<QuotationPDFBuilder> {
    const pdfDoc = await PDFDocument.create()
    const builder = new QuotationPDFBuilder(pdfDoc)
    builder.fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    builder.fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    return builder
  }

  private newPage() {
    const page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight])
    this.pages.push(page)
    this.currentPage = this.pages.length - 1
    this.currentY = this.pageHeight - this.margin
    return page
  }

  private getPage() {
    return this.pages[this.currentPage]
  }

  private checkPageBreak(needed: number): boolean {
    if (this.currentY - needed < this.margin + 40) {
      this.newPage()
      return true
    }
    return false
  }

  private drawText(opts: DrawTextOptions) {
    const page = this.getPage()
    const font = opts.font === 'bold' ? this.fontBold : this.fontRegular
    const size = opts.size || 9
    const color = opts.color || BLACK
    let x = opts.x

    if (opts.align === 'right' && opts.maxWidth) {
      const textWidth = font.widthOfTextAtSize(opts.text, size)
      x = opts.x + opts.maxWidth - textWidth
    } else if (opts.align === 'center' && opts.maxWidth) {
      const textWidth = font.widthOfTextAtSize(opts.text, size)
      x = opts.x + (opts.maxWidth - textWidth) / 2
    }

    page.drawText(opts.text, { x, y: opts.y, size, font, color })
  }

  private drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: ReturnType<typeof rgb>,
    borderColor?: ReturnType<typeof rgb>
  ) {
    const page = this.getPage()
    page.drawRectangle({ x, y, width, height, color })
    if (borderColor) {
      page.drawRectangle({ x, y, width, height, borderColor, borderWidth: 0.5 })
    }
  }

  private drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: ReturnType<typeof rgb> = MEDIUM_GRAY,
    thickness: number = 0.5
  ) {
    const page = this.getPage()
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      color,
      thickness,
    })
  }

  private textWidth(text: string, size: number = 9, font: 'regular' | 'bold' = 'regular'): number {
    const f = font === 'bold' ? this.fontBold : this.fontRegular
    return f.widthOfTextAtSize(text, size)
  }

  // ─── Draw Company Header ─────────────────────────────────────────────────

  private drawCompanyHeader(settings: Record<string, string>) {
    const contentWidth = this.pageWidth - this.margin * 2

    // Green accent bar at very top
    this.drawRect(0, this.pageHeight - 8, this.pageWidth, 8, GREEN_ACCENT)

    // Company name box
    const headerBoxHeight = 72
    const headerY = this.currentY - headerBoxHeight

    // Dark green background for company header
    this.drawRect(this.margin, headerY, contentWidth, headerBoxHeight, TABLE_HEADER_BG)

    // Green accent strip on left
    this.drawRect(this.margin, headerY, 5, headerBoxHeight, GREEN_ACCENT)

    // Company name
    const companyName =
      (settings.company_name as string) || 'URBAN KITCHEN MANUFACTURING & SOLUTIONS'
    this.drawText({
      text: companyName.toUpperCase(),
      x: this.margin + 15,
      y: headerY + headerBoxHeight - 22,
      size: 16,
      font: 'bold',
      color: WHITE,
    })

    // Company details line
    const companyAddress = settings.company_address || 'Plot No. 45, Industrial Area, Phase-II, Chandigarh 160002'
    const companyPhone = settings.company_phone ? `Ph: ${settings.company_phone}` : 'Ph: +91 172 4567890'
    const companyEmail = settings.company_email ? `Email: ${settings.company_email}` : 'Email: info@urbankitchen.com'
    const gstNumber = settings.gst_number ? `GSTIN: ${settings.gst_number}` : 'GSTIN: 04AABCU9603R1ZM'

    this.drawText({
      text: companyAddress,
      x: this.margin + 15,
      y: headerY + headerBoxHeight - 38,
      size: 8,
      color: rgb(0.85, 0.92, 0.85),
    })

    const contactLine = `${companyPhone}  |  ${companyEmail}`
    this.drawText({
      text: contactLine,
      x: this.margin + 15,
      y: headerY + headerBoxHeight - 50,
      size: 8,
      color: rgb(0.85, 0.92, 0.85),
    })

    this.drawText({
      text: gstNumber,
      x: this.margin + 15,
      y: headerY + headerBoxHeight - 62,
      size: 8,
      font: 'bold',
      color: GREEN_ACCENT,
    })

    this.currentY = headerY - 12
  }

  // ─── Draw Quotation Title ────────────────────────────────────────────────

  private drawQuotationTitle(quotation: {
    quotationNumber: string
    createdAt: Date
    validUntil: Date | null
  }) {
    const contentWidth = this.pageWidth - this.margin * 2

    // QUOTATION heading
    this.drawText({
      text: 'QUOTATION',
      x: this.margin,
      y: this.currentY,
      size: 22,
      font: 'bold',
      color: TABLE_HEADER_BG,
      align: 'center',
      maxWidth: contentWidth,
    })
    this.currentY -= 28

    // Quotation details in a bordered box
    const detailBoxHeight = 28
    const detailY = this.currentY - detailBoxHeight

    // Draw border
    this.drawRect(this.margin, detailY, contentWidth, detailBoxHeight, LIGHT_GRAY)
    this.drawLine(this.margin, detailY, this.margin + contentWidth, detailY, MEDIUM_GRAY, 0.5)
    this.drawLine(this.margin, detailY + detailBoxHeight, this.margin + contentWidth, detailY + detailBoxHeight, MEDIUM_GRAY, 0.5)

    // Vertical divider
    const midX = this.margin + contentWidth / 2
    this.drawLine(midX, detailY, midX, detailY + detailBoxHeight, MEDIUM_GRAY, 0.5)

    // Left side: Quotation No
    this.drawText({
      text: 'Quotation No:',
      x: this.margin + 10,
      y: detailY + 17,
      size: 9,
      color: MEDIUM_GRAY,
    })
    this.drawText({
      text: quotation.quotationNumber,
      x: this.margin + 95,
      y: detailY + 17,
      size: 10,
      font: 'bold',
    })

    this.drawText({
      text: 'Date:',
      x: this.margin + 10,
      y: detailY + 5,
      size: 9,
      color: MEDIUM_GRAY,
    })
    this.drawText({
      text: new Date(quotation.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      x: this.margin + 95,
      y: detailY + 5,
      size: 9,
      font: 'bold',
    })

    // Right side: Valid Until
    this.drawText({
      text: 'Valid Until:',
      x: midX + 10,
      y: detailY + 17,
      size: 9,
      color: MEDIUM_GRAY,
    })
    this.drawText({
      text: quotation.validUntil
        ? new Date(quotation.validUntil).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '30 Days',
      x: midX + 80,
      y: detailY + 17,
      size: 9,
      font: 'bold',
    })

    this.drawText({
      text: 'Status:',
      x: midX + 10,
      y: detailY + 5,
      size: 9,
      color: MEDIUM_GRAY,
    })
    const status = (quotation as { status?: string }).status || 'Draft'
    this.drawText({
      text: status.charAt(0).toUpperCase() + status.slice(1),
      x: midX + 80,
      y: detailY + 5,
      size: 9,
      font: 'bold',
      color: status === 'accepted' ? DARK_GREEN : status === 'rejected' ? rgb(0.8, 0, 0) : BLACK,
    })

    this.currentY = detailY - 14
  }

  // ─── Draw Customer Details ───────────────────────────────────────────────

  private drawCustomerDetails(quotation: {
    customerName: string
    customerCompany?: string | null
    customerAddress?: string | null
    customerGst?: string | null
    customerPhone?: string | null
    customerEmail?: string | null
  }) {
    const contentWidth = this.pageWidth - this.margin * 2

    // "Bill To" label
    this.drawText({
      text: 'BILL TO',
      x: this.margin,
      y: this.currentY,
      size: 10,
      font: 'bold',
      color: TABLE_HEADER_BG,
    })

    // Small green line under "Bill To"
    this.drawLine(
      this.margin,
      this.currentY - 3,
      this.margin + 50,
      this.currentY - 3,
      GREEN_ACCENT,
      1.5
    )
    this.currentY -= 14

    // Customer details box
    const customerLines: string[] = []
    customerLines.push(quotation.customerName)
    if (quotation.customerCompany) customerLines.push(quotation.customerCompany)
    if (quotation.customerAddress) customerLines.push(quotation.customerAddress)
    if (quotation.customerGst) customerLines.push(`GSTIN: ${quotation.customerGst}`)

    const contactParts: string[] = []
    if (quotation.customerPhone) contactParts.push(`Ph: ${quotation.customerPhone}`)
    if (quotation.customerEmail) contactParts.push(`Email: ${quotation.customerEmail}`)
    if (contactParts.length > 0) customerLines.push(contactParts.join('  |  '))

    const lineHeight = 13
    const boxHeight = customerLines.length * lineHeight + 12
    const boxY = this.currentY - boxHeight

    // Light border
    this.drawRect(this.margin, boxY, contentWidth, boxHeight, rgb(1, 1, 1))
    this.drawLine(this.margin, boxY, this.margin + contentWidth, boxY, rgb(0.8, 0.8, 0.8), 0.5)
    this.drawLine(
      this.margin,
      boxY + boxHeight,
      this.margin + contentWidth,
      boxY + boxHeight,
      rgb(0.8, 0.8, 0.8),
      0.5
    )
    this.drawLine(this.margin, boxY, this.margin, boxY + boxHeight, rgb(0.8, 0.8, 0.8), 0.5)
    this.drawLine(
      this.margin + contentWidth,
      boxY,
      this.margin + contentWidth,
      boxY + boxHeight,
      rgb(0.8, 0.8, 0.8),
      0.5
    )

    // Green accent on left
    this.drawRect(this.margin, boxY, 3, boxHeight, GREEN_ACCENT)

    let yPos = this.currentY - 4
    for (let i = 0; i < customerLines.length; i++) {
      const isName = i === 0
      this.drawText({
        text: customerLines[i],
        x: this.margin + 10,
        y: yPos,
        size: isName ? 10 : 8.5,
        font: isName ? 'bold' : 'regular',
      })
      yPos -= lineHeight
    }

    this.currentY = boxY - 14
  }

  // ─── Draw Line Items Table ───────────────────────────────────────────────

  private drawLineItemsTable(items: Array<Record<string, unknown>>) {
    const contentWidth = this.pageWidth - this.margin * 2

    const columns: ColumnDef[] = [
      { header: 'S.No', width: 30, align: 'center' },
      { header: 'Description', width: 145, align: 'left' },
      { header: 'HSN/SAC', width: 55, align: 'center' },
      { header: 'Qty', width: 35, align: 'center' },
      { header: 'Unit', width: 35, align: 'center' },
      { header: 'Rate', width: 60, align: 'right' },
      { header: 'Disc%', width: 40, align: 'center' },
      { header: 'GST%', width: 40, align: 'center' },
      { header: 'Amount', width: 75, align: 'right' },
    ]

    // Section title
    this.drawText({
      text: 'ITEM DETAILS',
      x: this.margin,
      y: this.currentY,
      size: 10,
      font: 'bold',
      color: TABLE_HEADER_BG,
    })
    this.drawLine(
      this.margin,
      this.currentY - 3,
      this.margin + 75,
      this.currentY - 3,
      GREEN_ACCENT,
      1.5
    )
    this.currentY -= 6

    // Table header
    const headerHeight = 22
    this.checkPageBreak(headerHeight + 30)
    const headerY = this.currentY - headerHeight

    // Header background
    this.drawRect(this.margin, headerY, contentWidth, headerHeight, TABLE_HEADER_BG)

    // Green accent at top of table
    this.drawRect(this.margin, headerY + headerHeight - 2, contentWidth, 2, GREEN_ACCENT)

    // Header text
    let colX = this.margin
    for (const col of columns) {
      this.drawText({
        text: col.header,
        x: colX + 3,
        y: headerY + 7,
        size: 8,
        font: 'bold',
        color: WHITE,
        align: col.align,
        maxWidth: col.width - 6,
      })
      colX += col.width
    }

    this.currentY = headerY

    // Table rows
    const rowHeight = 20
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      this.checkPageBreak(rowHeight + 10)

      const rowY = this.currentY - rowHeight

      // Alternating row color
      if (i % 2 === 0) {
        this.drawRect(this.margin, rowY, contentWidth, rowHeight, TABLE_ALT_ROW)
      }

      // Row border
      this.drawLine(this.margin, rowY, this.margin + contentWidth, rowY, rgb(0.85, 0.85, 0.85), 0.3)

      const desc = String(item.desc || '')
      const hsn = String(item.hsn || '-')
      const qty = Number(item.qty || 0)
      const unit = String(item.unit || 'Nos')
      const rate = Number(item.rate || 0)
      const discount = Number(item.discount || 0)
      const gstPercent = Number(item.gstPercent || 0)
      const amount = Number(item.amount || 0)

      colX = this.margin
      const rowData: Array<{ text: string; col: ColumnDef }> = [
        { text: String(i + 1), col: columns[0] },
        { text: desc.length > 40 ? desc.substring(0, 37) + '...' : desc, col: columns[1] },
        { text: hsn, col: columns[2] },
        { text: String(qty), col: columns[3] },
        { text: unit, col: columns[4] },
        { text: rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), col: columns[5] },
        { text: discount > 0 ? `${discount}%` : '-', col: columns[6] },
        { text: gstPercent > 0 ? `${gstPercent}%` : '-', col: columns[7] },
        { text: amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), col: columns[8] },
      ]

      for (const cell of rowData) {
        this.drawText({
          text: cell.text,
          x: colX + 3,
          y: rowY + 6,
          size: 8,
          align: cell.col.align,
          maxWidth: cell.col.width - 6,
        })
        colX += cell.col.width
      }

      this.currentY = rowY
    }

    // Bottom table border
    this.drawLine(
      this.margin,
      this.currentY,
      this.margin + contentWidth,
      this.currentY,
      TABLE_HEADER_BG,
      1
    )
    this.currentY -= 10
  }

  // ─── Draw Summary ────────────────────────────────────────────────────────

  private drawSummary(quotation: {
    subtotal: number
    discountAmount: number
    cgstAmount: number
    sgstAmount: number
    igstAmount: number
    totalGst: number
    amount: number
  }) {
    const contentWidth = this.pageWidth - this.margin * 2
    const labelWidth = 300
    const valueWidth = contentWidth - labelWidth

    this.checkPageBreak(140)

    // Section title
    this.drawText({
      text: 'SUMMARY',
      x: this.margin,
      y: this.currentY,
      size: 10,
      font: 'bold',
      color: TABLE_HEADER_BG,
    })
    this.drawLine(
      this.margin,
      this.currentY - 3,
      this.margin + 65,
      this.currentY - 3,
      GREEN_ACCENT,
      1.5
    )
    this.currentY -= 10

    const rows: Array<{ label: string; value: string; bold?: boolean; color?: ReturnType<typeof rgb> }> = []

    rows.push({ label: 'Subtotal', value: quotation.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) })
    if (quotation.discountAmount > 0) {
      rows.push({ label: 'Discount', value: `- ${quotation.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` })
    }
    if (quotation.cgstAmount > 0) {
      rows.push({ label: 'CGST', value: quotation.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) })
    }
    if (quotation.sgstAmount > 0) {
      rows.push({ label: 'SGST', value: quotation.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) })
    }
    if (quotation.igstAmount > 0) {
      rows.push({ label: 'IGST', value: quotation.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) })
    }

    const lineHeight = 15
    for (const row of rows) {
      this.drawText({
        text: row.label,
        x: this.margin + labelWidth,
        y: this.currentY,
        size: 9,
        align: 'right',
        maxWidth: labelWidth,
        color: row.color,
      })
      this.drawText({
        text: row.value,
        x: this.margin + labelWidth + 10,
        y: this.currentY,
        size: 9,
        font: row.bold ? 'bold' : 'regular',
        align: 'right',
        maxWidth: valueWidth - 10,
      })
      this.currentY -= lineHeight
    }

    // Grand Total with background
    const grandTotalHeight = 24
    const grandTotalY = this.currentY - grandTotalHeight

    this.drawRect(this.margin + labelWidth - 10, grandTotalY, valueWidth + 20, grandTotalHeight, TABLE_HEADER_BG)
    this.drawRect(this.margin + labelWidth - 10, grandTotalY + grandTotalHeight - 2, valueWidth + 20, 2, GREEN_ACCENT)

    this.drawText({
      text: 'GRAND TOTAL',
      x: this.margin + labelWidth,
      y: grandTotalY + 7,
      size: 10,
      font: 'bold',
      color: WHITE,
      align: 'right',
      maxWidth: labelWidth - 10,
    })
    this.drawText({
      text: quotation.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      x: this.margin + labelWidth + 10,
      y: grandTotalY + 7,
      size: 11,
      font: 'bold',
      color: WHITE,
      align: 'right',
      maxWidth: valueWidth - 10,
    })

    this.currentY = grandTotalY - 10

    // Amount in words
    this.checkPageBreak(20)
    const amountWords = amountToWords(quotation.amount)
    this.drawText({
      text: 'Amount in Words:',
      x: this.margin,
      y: this.currentY,
      size: 8,
      color: MEDIUM_GRAY,
    })
    this.currentY -= 13
    this.drawText({
      text: amountWords,
      x: this.margin,
      y: this.currentY,
      size: 9,
      font: 'bold',
      color: TABLE_HEADER_BG,
    })

    // Underline for amount in words
    const wordsWidth = this.textWidth(amountWords, 9, 'bold')
    this.drawLine(
      this.margin,
      this.currentY - 3,
      this.margin + Math.min(wordsWidth, contentWidth),
      this.currentY - 3,
      GREEN_ACCENT,
      1
    )
    this.currentY -= 18
  }

  // ─── Draw Terms & Conditions ─────────────────────────────────────────────

  private drawTerms(terms: string[]) {
    if (!terms || terms.length === 0) return

    this.checkPageBreak(60)

    const contentWidth = this.pageWidth - this.margin * 2

    this.drawText({
      text: 'TERMS & CONDITIONS',
      x: this.margin,
      y: this.currentY,
      size: 10,
      font: 'bold',
      color: TABLE_HEADER_BG,
    })
    this.drawLine(
      this.margin,
      this.currentY - 3,
      this.margin + 120,
      this.currentY - 3,
      GREEN_ACCENT,
      1.5
    )
    this.currentY -= 14

    for (let i = 0; i < terms.length; i++) {
      this.checkPageBreak(15)
      const termText = `${i + 1}. ${terms[i]}`
      this.drawText({
        text: termText,
        x: this.margin + 5,
        y: this.currentY,
        size: 8,
      })
      this.currentY -= 13
    }

    this.currentY -= 6
  }

  // ─── Draw Delivery/Installation/Warranty ──────────────────────────────────

  private drawAdditionalInfo(quotation: {
    deliveryPeriod?: string | null
    installation?: string | null
    warranty?: string | null
  }) {
    if (!quotation.deliveryPeriod && !quotation.installation && !quotation.warranty) return

    this.checkPageBreak(70)

    const contentWidth = this.pageWidth - this.margin * 2
    const colWidth = contentWidth / 3

    this.drawText({
      text: 'ADDITIONAL INFORMATION',
      x: this.margin,
      y: this.currentY,
      size: 10,
      font: 'bold',
      color: TABLE_HEADER_BG,
    })
    this.drawLine(
      this.margin,
      this.currentY - 3,
      this.margin + 150,
      this.currentY - 3,
      GREEN_ACCENT,
      1.5
    )
    this.currentY -= 12

    // Info box
    const boxHeight = 35
    const boxY = this.currentY - boxHeight

    this.drawRect(this.margin, boxY, contentWidth, boxHeight, LIGHT_GRAY)
    this.drawLine(this.margin, boxY, this.margin + contentWidth, boxY, rgb(0.8, 0.8, 0.8), 0.5)
    this.drawLine(this.margin, boxY + boxHeight, this.margin + contentWidth, boxY + boxHeight, rgb(0.8, 0.8, 0.8), 0.5)

    // Vertical dividers
    if (quotation.deliveryPeriod && quotation.installation) {
      this.drawLine(this.margin + colWidth, boxY, this.margin + colWidth, boxY + boxHeight, rgb(0.8, 0.8, 0.8), 0.5)
    }
    if (quotation.installation && quotation.warranty) {
      this.drawLine(this.margin + colWidth * 2, boxY, this.margin + colWidth * 2, boxY + boxHeight, rgb(0.8, 0.8, 0.8), 0.5)
    }

    // Delivery Period
    if (quotation.deliveryPeriod) {
      this.drawText({
        text: 'Delivery Period',
        x: this.margin + 8,
        y: boxY + boxHeight - 13,
        size: 7,
        color: MEDIUM_GRAY,
      })
      this.drawText({
        text: quotation.deliveryPeriod,
        x: this.margin + 8,
        y: boxY + 8,
        size: 9,
        font: 'bold',
      })
    }

    // Installation
    if (quotation.installation) {
      this.drawText({
        text: 'Installation',
        x: this.margin + colWidth + 8,
        y: boxY + boxHeight - 13,
        size: 7,
        color: MEDIUM_GRAY,
      })
      this.drawText({
        text: quotation.installation,
        x: this.margin + colWidth + 8,
        y: boxY + 8,
        size: 9,
        font: 'bold',
      })
    }

    // Warranty
    if (quotation.warranty) {
      this.drawText({
        text: 'Warranty',
        x: this.margin + colWidth * 2 + 8,
        y: boxY + boxHeight - 13,
        size: 7,
        color: MEDIUM_GRAY,
      })
      this.drawText({
        text: quotation.warranty,
        x: this.margin + colWidth * 2 + 8,
        y: boxY + 8,
        size: 9,
        font: 'bold',
      })
    }

    this.currentY = boxY - 14
  }

  // ─── Draw Bank Details ───────────────────────────────────────────────────

  private drawBankDetails(bankDetails: Record<string, string> | null) {
    if (!bankDetails) return

    this.checkPageBreak(80)

    const contentWidth = this.pageWidth - this.margin * 2

    this.drawText({
      text: 'BANK DETAILS',
      x: this.margin,
      y: this.currentY,
      size: 10,
      font: 'bold',
      color: TABLE_HEADER_BG,
    })
    this.drawLine(
      this.margin,
      this.currentY - 3,
      this.margin + 85,
      this.currentY - 3,
      GREEN_ACCENT,
      1.5
    )
    this.currentY -= 10

    const bankFields: Array<{ label: string; value: string }> = []
    if (bankDetails.bankName) bankFields.push({ label: 'Bank Name', value: bankDetails.bankName })
    if (bankDetails.accountName) bankFields.push({ label: 'Account Name', value: bankDetails.accountName })
    if (bankDetails.accountNo) bankFields.push({ label: 'Account No', value: bankDetails.accountNo })
    if (bankDetails.ifsc) bankFields.push({ label: 'IFSC Code', value: bankDetails.ifsc })
    if (bankDetails.branch) bankFields.push({ label: 'Branch', value: bankDetails.branch })

    // Two-column layout for bank details
    const halfWidth = contentWidth / 2
    const startY = this.currentY

    for (let i = 0; i < bankFields.length; i++) {
      const isLeft = i % 2 === 0
      const col = isLeft ? 0 : 1
      const xPos = this.margin + col * halfWidth
      const yOffset = Math.floor(i / 2) * 14

      this.drawText({
        text: bankFields[i].label + ':',
        x: xPos + 5,
        y: startY - yOffset,
        size: 8,
        color: MEDIUM_GRAY,
      })
      this.drawText({
        text: bankFields[i].value,
        x: xPos + 85,
        y: startY - yOffset,
        size: 8.5,
        font: 'bold',
      })
    }

    const rowsUsed = Math.ceil(bankFields.length / 2)
    this.currentY = startY - rowsUsed * 14 - 10
  }

  // ─── Draw Authorized Signatory ───────────────────────────────────────────

  private drawAuthorizedSignatory() {
    this.checkPageBreak(60)

    const contentWidth = this.pageWidth - this.margin * 2

    // Separator line
    this.drawLine(
      this.margin,
      this.currentY,
      this.margin + contentWidth,
      this.currentY,
      rgb(0.85, 0.85, 0.85),
      0.5
    )
    this.currentY -= 20

    // "For Urban Kitchen Manufacturing & Solutions"
    this.drawText({
      text: 'For URBAN KITCHEN MANUFACTURING & SOLUTIONS',
      x: this.margin,
      y: this.currentY,
      size: 9,
      font: 'bold',
      color: TABLE_HEADER_BG,
    })
    this.currentY -= 35

    // Signature line
    const signLineStart = this.margin + contentWidth - 180
    const signLineEnd = this.margin + contentWidth - 10
    this.drawLine(signLineStart, this.currentY, signLineEnd, this.currentY, BLACK, 0.5)
    this.currentY -= 14

    this.drawText({
      text: 'Authorized Signatory',
      x: signLineStart,
      y: this.currentY,
      size: 8.5,
      font: 'bold',
      align: 'center',
      maxWidth: signLineEnd - signLineStart,
    })

    // Bottom green accent bar
    this.currentY = 15
    this.drawRect(0, 0, this.pageWidth, 8, GREEN_ACCENT)
  }

  // ─── Draw Notes ──────────────────────────────────────────────────────────

  private drawNotes(notes: string | null) {
    if (!notes) return

    this.checkPageBreak(30)

    this.drawText({
      text: 'NOTES',
      x: this.margin,
      y: this.currentY,
      size: 10,
      font: 'bold',
      color: TABLE_HEADER_BG,
    })
    this.drawLine(
      this.margin,
      this.currentY - 3,
      this.margin + 45,
      this.currentY - 3,
      GREEN_ACCENT,
      1.5
    )
    this.currentY -= 13

    this.drawText({
      text: notes,
      x: this.margin + 5,
      y: this.currentY,
      size: 8,
    })
    this.currentY -= 15
  }

  // ─── Build the PDF ───────────────────────────────────────────────────────

  async build(
    quotation: {
      quotationNumber: string
      createdAt: Date
      validUntil: Date | null
      status: string
      customerName: string
      customerCompany?: string | null
      customerAddress?: string | null
      customerGst?: string | null
      customerPhone?: string | null
      customerEmail?: string | null
      items?: string | null
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
      deliveryPeriod?: string | null
      installation?: string | null
      warranty?: string | null
    },
    settings: Record<string, string>
  ): Promise<Uint8Array> {
    this.newPage()

    // Parse JSON fields
    let parsedItems: Array<Record<string, unknown>> = []
    try {
      parsedItems = quotation.items ? JSON.parse(quotation.items) : []
    } catch {
      parsedItems = []
    }

    let parsedTerms: string[] = []
    try {
      parsedTerms = quotation.terms ? JSON.parse(quotation.terms) : []
    } catch {
      parsedTerms = []
    }

    let parsedBankDetails: Record<string, string> | null = null
    try {
      parsedBankDetails = quotation.bankDetails ? JSON.parse(quotation.bankDetails) : null
    } catch {
      parsedBankDetails = null
    }

    // Build PDF sections
    this.drawCompanyHeader(settings)
    this.drawQuotationTitle(quotation)
    this.drawCustomerDetails(quotation)

    if (parsedItems.length > 0) {
      this.drawLineItemsTable(parsedItems)
    }

    this.drawSummary(quotation)
    this.drawNotes(quotation.notes || null)
    this.drawTerms(parsedTerms)
    this.drawAdditionalInfo(quotation)
    this.drawBankDetails(parsedBankDetails)
    this.drawAuthorizedSignatory()

    // Set PDF metadata
    this.pdfDoc.setTitle(`Quotation - ${quotation.quotationNumber}`)
    this.pdfDoc.setSubject('Commercial Kitchen Quotation')
    this.pdfDoc.setProducer('Urban Kitchen Manufacturing & Solutions')
    this.pdfDoc.setCreator('UKMS Quotation System')

    return this.pdfDoc.save()
  }
}

// ─── API Route Handler ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { status: false, message: 'Quotation ID is required' },
        { status: 400 }
      )
    }

    // Fetch quotation from database
    const quotation = await db.quotation.findUnique({
      where: { id },
      include: {
        lead: { select: { id: true, name: true, company: true, email: true, phone: true } },
      },
    })

    if (!quotation) {
      return NextResponse.json(
        { status: false, message: 'Quotation not found' },
        { status: 404 }
      )
    }

    // Fetch company settings
    const settingsRows = await db.setting.findMany()
    const settings: Record<string, string> = {}
    for (const s of settingsRows) {
      settings[s.key] = s.value
    }

    // Generate PDF
    const builder = await QuotationPDFBuilder.create()
    const pdfBytes = await builder.build(quotation, settings)

    // Return PDF response
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Quotation-${quotation.quotationNumber}.pdf"`,
        'Content-Length': String(pdfBytes.length),
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
