import express from 'express'
import nodemailer from 'nodemailer'

const router = express.Router()

let contacts = []

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject and message are required'
      })
    }

    const contact = {
      id: Date.now(),
      name,
      email,
      phone,
      subject,
      message,
      status: 'new',
      createdAt: new Date()
    }

    contacts.push(contact)

    try {
      const transporter = createTransporter()

      await transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Digital Wave IT Solutions'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        replyTo: email,
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
    }

    res.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Contact submission error:', error)
    res.status(500).json({ success: false, message: 'Failed to send message' })
  }
})

router.get('/', async (req, res) => {
  try {
    res.json({ success: true, data: contacts })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const contact = contacts.find(c => c.id === parseInt(id))
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' })
    }

    contact.status = status
    contact.updatedAt = new Date()

    res.json({ success: true, message: 'Status updated' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

export default router