// Email configuration - update these with your SMTP credentials
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@urbankitchens.com'
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'info@urbankitchens.com'

// Lazy-load nodemailer only when needed to avoid memory overhead
async function createTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    return null // Email not configured
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

interface AmcQuoteEmailData {
  name: string
  email: string
  phone: string
  company?: string
  plan: string
  equipmentList?: string
  kitchenSize?: string
  city?: string
  message?: string
}

export async function sendAmcQuoteEmail(data: AmcQuoteEmailData): Promise<{ sent: boolean; error?: string }> {
  const transporter = await createTransporter()

  if (!transporter) {
    console.warn('[Email] SMTP not configured. Quote saved to database only. Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable email sending.')
    return { sent: false, error: 'SMTP not configured' }
  }

  const planPrices: Record<string, string> = {
    Basic: '₹15,000/year',
    Standard: '₹35,000/year',
    Premium: '₹65,000/year',
    Custom: 'Custom pricing',
  }

  const equipmentHtml = data.equipmentList
    ? JSON.parse(data.equipmentList)
        .map((item: string) => `<li style="padding: 4px 0; color: #d1d5db;">${item}</li>`)
        .join('')
    : '<li style="padding: 4px 0; color: #9ca3af;">Not specified</li>'

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0b0b0b 0%, #1a1a1a 100%); padding: 24px 32px; border-bottom: 2px solid #59ff00;">
        <h1 style="margin: 0; color: #59ff00; font-size: 22px; font-weight: 700;">
          Urban Kitchen — New AMC Quote Request
        </h1>
        <p style="margin: 8px 0 0; color: #9ca3af; font-size: 13px;">
          Received ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 28px 32px;">
        <!-- Customer Info -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px; width: 140px;">Customer Name</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #59ff00; font-size: 14px;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Phone</td>
            <td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #59ff00; font-size: 14px;">${data.phone}</a></td>
          </tr>
          ${data.company ? `<tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Company</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${data.company}</td>
          </tr>` : ''}
          ${data.city ? `<tr>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">City</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${data.city}</td>
          </tr>` : ''}
        </table>

        <!-- Plan Details -->
        <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px; color: #59ff00; font-size: 16px;">Plan: ${data.plan} (${planPrices[data.plan] || 'N/A'})</h3>
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">Kitchen Size: ${data.kitchenSize || 'Not specified'}</p>
        </div>

        <!-- Equipment List -->
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 14px;">Equipment to Cover:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${equipmentHtml}
          </ul>
        </div>

        <!-- Message -->
        ${data.message ? `
        <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px 20px;">
          <h3 style="margin: 0 0 8px; color: #ffffff; font-size: 14px;">Additional Message:</h3>
          <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">${data.message}</p>
        </div>` : ''}
      </div>

      <!-- Footer -->
      <div style="background: #0b0b0b; padding: 16px 32px; border-top: 1px solid #1a1a1a; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          Urban Kitchen Manufacturing & Solutions — Plot No. 45, Sector 12, Industrial Area, New Delhi - 110020
        </p>
        <p style="margin: 4px 0 0; color: #6b7280; font-size: 11px;">
          This is an automated quote request from the Urban Kitchen website.
        </p>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Urban Kitchen Website" <${EMAIL_FROM}>`,
      to: BUSINESS_EMAIL,
      replyTo: data.email,
      subject: `New AMC Quote Request — ${data.plan} Plan from ${data.name}`,
      html: htmlBody,
    })

    return { sent: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email] Failed to send AMC quote email:', message)
    return { sent: false, error: message }
  }
}

// Send confirmation email to customer
export async function sendAmcQuoteConfirmation(data: AmcQuoteEmailData): Promise<{ sent: boolean; error?: string }> {
  const transporter = await createTransporter()

  if (!transporter) {
    return { sent: false, error: 'SMTP not configured' }
  }

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0b0b0b 0%, #1a1a1a 100%); padding: 24px 32px; border-bottom: 2px solid #59ff00;">
        <h1 style="margin: 0; color: #59ff00; font-size: 22px; font-weight: 700;">
          Urban Kitchen — AMC Quote Request Received
        </h1>
      </div>
      <div style="padding: 28px 32px;">
        <p style="color: #d1d5db; font-size: 15px; line-height: 1.6;">
          Dear <strong style="color: #fff;">${data.name}</strong>,
        </p>
        <p style="color: #d1d5db; font-size: 15px; line-height: 1.6;">
          Thank you for your interest in our <strong style="color: #59ff00;">${data.plan} AMC Plan</strong>. 
          We have received your quote request and our team will get back to you within 24 hours with a detailed proposal.
        </p>
        <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">Your Request Reference</p>
          <p style="margin: 4px 0 0; color: #59ff00; font-size: 18px; font-weight: 700;">#AMC-${Date.now().toString(36).toUpperCase()}</p>
        </div>
        <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
          If you need immediate assistance, call us at <a href="tel:+917080488840" style="color: #59ff00;">+91-7080488840</a> 
          or email <a href="mailto:info@urbankitchens.com" style="color: #59ff00;">info@urbankitchens.com</a>.
        </p>
      </div>
      <div style="background: #0b0b0b; padding: 16px 32px; border-top: 1px solid #1a1a1a; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          Urban Kitchen Manufacturing & Solutions — New Delhi, India
        </p>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Urban Kitchen" <${EMAIL_FROM}>`,
      to: data.email,
      subject: `Your AMC Quote Request — ${data.plan} Plan | Urban Kitchen`,
      html: htmlBody,
    })

    return { sent: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email] Failed to send confirmation email:', message)
    return { sent: false, error: message }
  }
}
