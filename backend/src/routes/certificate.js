import express from 'express'
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit'
import crypto from 'crypto'
import QRCode from 'qrcode'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'
import { successResponse, errorResponse } from '../utils/response.js'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db
  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase not configured')
  }
  return db.connection
}

const studentAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'No token' })
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

const bufferFromUrl = async (url) => {
  if (!url) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return Buffer.from(await response.arrayBuffer())
  } catch {
    return null
  }
}

const getCertificateDesign = async (supabase) => {
  const fallback = {
    primaryColor: '#ff7a00',
    secondaryColor: '#22c55e',
    backgroundColor: '#0f172a',
    logoUrl: '',
    signatureUrl: '',
    backgroundUrl: '',
    signerName: 'Yogesh Kumar Saini',
    signerTitle: 'Founder, Digital Wave IT Solutions',
  }

  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'certificate_design')
    .maybeSingle()

  return { ...fallback, ...(data?.value || {}) }
}

const createCertificatePdfBuffer = async ({ student, cert, design }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 })
      const chunks = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const width = doc.page.width
      const height = doc.page.height

      const logoBuffer = await bufferFromUrl(design.logoUrl)
      const signatureBuffer = await bufferFromUrl(design.signatureUrl)
      const bgBuffer = await bufferFromUrl(design.backgroundUrl)
      const qrBuffer = await QRCode.toBuffer(cert.verification_url, {
        type: 'png',
        width: 180,
        margin: 1,
      })

      if (bgBuffer) {
        doc.image(bgBuffer, 0, 0, { width, height })
        doc.rect(0, 0, width, height).fillOpacity(0.72).fill('#0f172a').fillOpacity(1)
      } else {
        doc.rect(0, 0, width, height).fill(design.backgroundColor || '#0f172a')
      }

      doc
        .lineWidth(8)
        .strokeColor(design.primaryColor)
        .rect(24, 24, width - 48, height - 48)
        .stroke()

      doc
        .lineWidth(2)
        .strokeColor(design.secondaryColor)
        .rect(42, 42, width - 84, height - 84)
        .stroke()

      if (logoBuffer) {
        doc.image(logoBuffer, width / 2 - 45, 55, { fit: [90, 55], align: 'center' })
      }

      doc
        .fillColor('#ffffff')
        .fontSize(34)
        .text('CERTIFICATE OF COMPLETION', 0, 120, { align: 'center' })

      doc
        .fontSize(16)
        .fillColor('#cbd5e1')
        .text('This is proudly presented to', 0, 175, { align: 'center' })

      doc
        .fontSize(34)
        .fillColor(design.primaryColor)
        .text(student.name, 0, 215, { align: 'center' })

      doc
        .fontSize(16)
        .fillColor('#ffffff')
        .text('for successfully completing', 0, 270, { align: 'center' })

      doc
        .fontSize(24)
        .fillColor(design.secondaryColor)
        .text(student.course_name, 0, 305, { align: 'center' })

      doc
        .fontSize(14)
        .fillColor('#cbd5e1')
        .text(`Duration: ${student.duration || cert.duration || '-'} Months`, 0, 350, { align: 'center' })

      doc
        .fontSize(12)
        .fillColor('#94a3b8')
        .text(`Certificate ID: ${cert.certificate_id}`, 70, 420)

      doc
        .fontSize(12)
        .fillColor('#94a3b8')
        .text(`Issue Date: ${cert.issue_date || new Date().toISOString().split('T')[0]}`, 70, 445)

      doc.image(qrBuffer, width - 170, height - 190, { width: 105 })
      doc
        .fontSize(8)
        .fillColor('#cbd5e1')
        .text('Scan to verify', width - 180, height - 78, { width: 125, align: 'center' })

      if (signatureBuffer) {
        doc.image(signatureBuffer, width / 2 - 70, 425, { fit: [140, 50], align: 'center' })
      }

      doc
        .moveTo(width / 2 - 80, 485)
        .lineTo(width / 2 + 80, 485)
        .strokeColor('#ffffff')
        .lineWidth(1)
        .stroke()

      doc
        .fontSize(12)
        .fillColor('#ffffff')
        .text(design.signerName || 'Authorized Signatory', 0, 495, { align: 'center' })

      doc
        .fontSize(10)
        .fillColor('#94a3b8')
        .text(design.signerTitle || 'Digital Wave IT Solutions', 0, 513, { align: 'center' })

      doc
        .fontSize(9)
        .fillColor('#94a3b8')
        .text(`Verify: ${cert.verification_url}`, 70, height - 55, {
          width: width - 260,
        })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

const uploadPdfToStorage = async ({ supabase, pdfBuffer, certId }) => {
  const filePath = `${new Date().getFullYear()}/certificate-${certId}.pdf`

  const upload = () => supabase.storage
    .from('certificates')
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  let { error } = await upload()

  if (error?.message?.toLowerCase().includes('bucket')) {
    await supabase.storage.createBucket('certificates', {
      public: true,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 10 * 1024 * 1024,
    })
    ;({ error } = await upload())
  }

  if (error) throw error

  const { data } = supabase.storage.from('certificates').getPublicUrl(filePath)
  return data.publicUrl
}

// Issue certificate + generate PDF + QR + upload
router.post(
  '/issue/:studentId',
  adminAuth,
  requirePermission('manage_certificates'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)
      const { studentId } = req.params

      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .maybeSingle()

      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' })
      }

      const existing = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', student.id)
        .maybeSingle()

      if (existing.data) {
        return res.json({ success: true, data: existing.data, message: 'Certificate already issued' })
      }

      const certId = `DW-${new Date().getFullYear()}-${String(student.id).padStart(3, '0')}`
      const verificationToken = crypto.randomBytes(24).toString('hex')
      const verificationUrl = `${process.env.FRONTEND_URL}/certificate/verify/${verificationToken}`

      const { data: cert, error } = await supabase
        .from('certificates')
        .insert({
          certificate_id: certId,
          student_id: student.id,
          student_name: student.name,
          course_name: student.course_name,
          duration: student.duration,
          verification_token: verificationToken,
          verification_url: verificationUrl,
          status: 'issued',
        })
        .select()
        .single()

      if (error) throw error

      const design = await getCertificateDesign(supabase)
      const pdfBuffer = await createCertificatePdfBuffer({
        student,
        cert,
        design,
      })

      const pdfUrl = await uploadPdfToStorage({
        supabase,
        pdfBuffer,
        certId,
      })

      const { data: updatedCert, error: updateError } = await supabase
        .from('certificates')
        .update({ pdf_url: pdfUrl })
        .eq('id', cert.id)
        .select()
        .single()

      if (updateError) throw updateError

      await supabase
        .from('students')
        .update({
          certificate_available: true,
          certificate_id: certId,
        })
        .eq('id', student.id)

      res.json({ success: true, data: updatedCert })
    } catch (error) {
      console.error('Issue certificate error:', error)
      res.status(500).json({ success: false, message: 'Failed to issue certificate' })
    }
  }
)

router.get('/my', studentAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('email', req.user.email)
      .maybeSingle()

    if (!student || !student.certificate_available) {
      return res.status(403).json({ success: false, message: 'Not available' })
    }

    const { data: cert } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', student.id)
      .maybeSingle()

    res.json({ success: true, data: cert })
  } catch (error) {
    console.error('Get my certificate error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch certificate' })
  }
})

router.get('/verify/:token', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { token } = req.params

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('verification_token', token)
      .maybeSingle()

    if (error) throw error

    if (!data || data.status === 'revoked' || data.revoked_at) {
      return res.status(404).json({ success: false, message: 'Invalid certificate' })
    }

    res.json({
      success: true,
      data: {
        student_name: data.student_name,
        course_name: data.course_name,
        issue_date: data.issue_date,
        certificate_id: data.certificate_id,
        pdf_url: data.pdf_url || null,
        verification_url: data.verification_url || null,
      },
    })
  } catch (error) {
    console.error('Verify certificate error:', error)
    res.status(500).json({ success: false, message: 'Verification failed' })
  }
})

// Student direct download, regenerates PDF if needed
router.get('/download', studentAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('email', req.user.email)
      .maybeSingle()

    if (!student || !student.certificate_available) {
      return res.status(403).json({ success: false, message: 'Certificate not available' })
    }

    const { data: cert } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', student.id)
      .maybeSingle()

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' })
    }

    const design = await getCertificateDesign(supabase)
    const pdfBuffer = await createCertificatePdfBuffer({ student, cert, design })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${cert.certificate_id}.pdf`)
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Download certificate error:', error)
    res.status(500).json({ success: false, message: 'Failed to download certificate' })
  }
})

router.get(
  '/all',
  adminAuth,
  requirePermission('manage_certificates'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)

      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      res.json({ success: true, data })
    } catch (error) {
      console.error('Fetch certificates error:', error)
      res.status(500).json({ success: false, message: 'Failed to fetch certificates' })
    }
  }
)

export default router
