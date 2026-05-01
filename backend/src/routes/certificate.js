import express from 'express'
import PDFDocument from 'pdfkit'

const router = express.Router()

// Mock certificate store
let certificates = [
  { id: 1, studentId: 3, studentName: 'Sneha Gupta', course: 'Data Science', issueDate: '2024-02-01', certificateId: 'DW-2024-003', status: 'issued', template: 'modern' },
]

let certificateDesign = {
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  fontFamily: 'Inter',
  logoUrl: '',
  signatureUrl: '',
  template: 'modern',
}

// Generate certificate PDF
router.get('/generate/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    const cert = certificates.find(c => c.studentId === parseInt(studentId))

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' })
    }

    // Create PDF
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${cert.certificateId}.pdf`)

    doc.pipe(res)

    // Background
    doc.rect(0, 0, 842, 595).fill('#ffffff')

    // Border
    doc.rect(20, 20, 802, 555).lineWidth(3).stroke(certificateDesign.primaryColor)
    doc.rect(30, 30, 782, 535).lineWidth(1).stroke(certificateDesign.secondaryColor)

    // Header
    doc.fontSize(40).fillColor(certificateDesign.primaryColor).text('Certificate of Completion', 0, 80, { align: 'center' })

    doc.fontSize(16).fillColor('#666').text('This is to certify that', 0, 160, { align: 'center' })

    // Student Name
    doc.fontSize(32).fillColor('#333').text(cert.studentName, 0, 200, { align: 'center' })

    // Course
    doc.fontSize(16).fillColor('#666').text('has successfully completed', 0, 260, { align: 'center' })
    doc.fontSize(28).fillColor(certificateDesign.secondaryColor).text(cert.course, 0, 290, { align: 'center' })

    // Details
    doc.fontSize(14).fillColor('#666').text('Duration: 3 Months', 0, 360, { align: 'center' })
    doc.fontSize(14).fillColor('#666').text(`Issue Date: ${cert.issueDate}`, 0, 385, { align: 'center' })
    doc.fontSize(12).fillColor('#999').text(`Certificate ID: ${cert.certificateId}`, 0, 420, { align: 'center' })

    // Footer
    doc.fontSize(12).fillColor('#666').text('Digital Wave IT Solutions Pvt Ltd', 0, 500, { align: 'center' })

    doc.end()
  } catch (error) {
    console.error('Certificate generation error:', error)
    res.status(500).json({ success: false, message: 'Failed to generate certificate' })
  }
})

// Get certificate design
router.get('/design', async (req, res) => {
  try {
    res.json({ success: true, data: certificateDesign })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch design' })
  }
})

// Update certificate design
router.put('/design', async (req, res) => {
  try {
    certificateDesign = { ...certificateDesign, ...req.body }
    res.json({ success: true, message: 'Design updated', data: certificateDesign })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

// Issue certificate
router.post('/issue', async (req, res) => {
  try {
    const { studentId, studentName, course } = req.body

    const newCertificate = {
      id: Date.now(),
      studentId,
      studentName,
      course,
      issueDate: new Date().toISOString().split('T')[0],
      certificateId: `DW-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, '0')}`,
      status: 'issued',
      template: certificateDesign.template
    }

    certificates.push(newCertificate)

    res.json({
      success: true,
      message: 'Certificate issued',
      data: newCertificate
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to issue certificate' })
  }
})

// Get all certificates
router.get('/', async (req, res) => {
  try {
    res.json({ success: true, data: certificates })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch certificates' })
  }
})

export default router
