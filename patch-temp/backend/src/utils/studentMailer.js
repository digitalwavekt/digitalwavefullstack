import nodemailer from 'nodemailer'

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export const sendStudentLoginEmail = async ({ to, name, temporaryPassword, orderNumber, orderType }) => {
  const transporter = createTransporter()
  if (!transporter) {
    console.warn('SMTP is not configured. Student login email skipped for:', to)
    return false
  }

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '')
  const loginUrl = `${frontendUrl}/student/project-login`
  const label = orderType === 'internship' ? 'Internship + Project' : 'Project'

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME || 'Digital Wave IT Solutions'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: `Your Digital Wave ${label} Dashboard Login`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>Welcome to Digital Wave IT Solutions</h2>
        <p>Hi ${escapeHtml(name || 'Student')},</p>
        <p>Your payment is confirmed and your dashboard account has been created.</p>
        <p><strong>Order:</strong> ${escapeHtml(orderNumber || '')}</p>
        <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p><strong>Email:</strong> ${escapeHtml(to)}</p>
        <p><strong>Temporary Password:</strong> ${escapeHtml(temporaryPassword)}</p>
        <p>Please login and change your password after first access.</p>
        <hr />
        <p style="font-size:12px;color:#555">This dashboard is only for your purchased project/internship assets, updates and support.</p>
      </div>
    `,
  })

  return true
}
