import express from 'express'
import nodemailer from 'nodemailer'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'

const router = express.Router()

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;')

const isEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const isEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())

const createTransporter = () => {
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

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject and message are required',
      })
    }

    if (!isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required',
      })
    }

    if (!isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required',
      })
    }

    const db = req.app.locals.db
    const supabase = db?.connection

    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        name,
        email,
        phone,
        subject,
        message,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Contact DB insert failed:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to save contact message',
      })
    }

    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = createTransporter()

        await transporter.sendMail({
          from: `"${process.env.FROM_NAME || 'Digital Wave IT Solutions'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
          to: process.env.SMTP_USER,
          replyTo: email,
          subject: `New Contact Form Submission: ${escapeHtml(subject)}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message)}</p>
          `,
        })
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: contact,
    })
  } catch (error) {
    console.error('Contact submission error:', error)
    res.status(500).json({ success: false, message: 'Failed to send message' })
  }
})

router.get('/', adminAuth, requirePermission('manage_contacts'), async (req, res) => {
  try {
    const db = req.app.locals.db
    const supabase = db?.connection

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' })
  }
})

router.put('/:id', adminAuth, requirePermission('manage_contacts'), async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const db = req.app.locals.db
    const supabase = db?.connection

    const { data, error } = await supabase
      .from('contacts')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    res.json({ success: true, message: 'Status updated', data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

export default router