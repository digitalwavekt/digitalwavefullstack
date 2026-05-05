import express from 'express'
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit'
import crypto from 'crypto'

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

// Issue certificate
router.post('/issue/:studentId', async (req, res) => {
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

    const certId = `DW-${new Date().getFullYear()}-${String(student.id).padStart(3, '0')}`
    const verificationToken = crypto.randomBytes(24).toString('hex')

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        certificate_id: certId,
        student_id: student.id,
        student_name: student.name,
        course_name: student.course_name,
        duration: student.duration,
        verification_token: verificationToken,
        verification_url: `${process.env.FRONTEND_URL}/certificate/verify/${verificationToken}`,
      })
      .select()
      .single()

    if (error) throw error

    await supabase
      .from('students')
      .update({
        certificate_available: true,
        certificate_id: certId,
      })
      .eq('id', student.id)

    res.json({ success: true, data })
  } catch (error) {
    console.error('Issue certificate error:', error)
    res.status(500).json({ success: false, message: 'Failed to issue certificate' })
  }
})

// Student certificate JSON
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

// Public verify certificate
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
      return res.status(404).json({
        success: false,
        message: 'Invalid certificate',
      })
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
    res.status(500).json({
      success: false,
      message: 'Verification failed',
    })
  }
})

// Download PDF certificate
router.get('/download', studentAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('email', req.user.email)
      .maybeSingle()

    if (!student || !student.certificate_available) {
      return res.status(403).json({
        success: false,
        message: 'Certificate not available',
      })
    }

    const { data: cert } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', student.id)
      .maybeSingle()

    const certId =
      cert?.certificate_id ||
      student.certificate_id ||
      `DW-${new Date().getFullYear()}-${String(student.id).padStart(3, '0')}`

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certId}.pdf`)

    doc.pipe(res)

    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a')

    doc
      .lineWidth(8)
      .strokeColor('#ff7a00')
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .stroke()

    doc
      .lineWidth(2)
      .strokeColor('#22c55e')
      .rect(35, 35, doc.page.width - 70, doc.page.height - 70)
      .stroke()

    doc
      .fillColor('#ffffff')
      .fontSize(36)
      .text('CERTIFICATE OF COMPLETION', 0, 80, { align: 'center' })

    doc
      .fontSize(18)
      .fillColor('#cbd5f5')
      .text('This is to certify that', 0, 150, { align: 'center' })

    doc
      .fontSize(30)
      .fillColor('#ff7a00')
      .text(student.name, 0, 200, { align: 'center' })

    doc
      .fontSize(18)
      .fillColor('#ffffff')
      .text('has successfully completed', 0, 260, { align: 'center' })

    doc
      .fontSize(22)
      .fillColor('#22c55e')
      .text(student.course_name, 0, 300, { align: 'center' })

    doc
      .fontSize(16)
      .fillColor('#cbd5f5')
      .text(`Duration: ${student.duration} Months`, 0, 350, { align: 'center' })

    doc.text(`Date: ${new Date().toLocaleDateString()}`, 0, 390, { align: 'center' })

    doc
      .fontSize(12)
      .fillColor('#94a3b8')
      .text(`Certificate ID: ${certId}`, 0, 430, { align: 'center' })

    if (cert?.verification_url) {
      doc
        .fontSize(10)
        .fillColor('#94a3b8')
        .text(`Verify: ${cert.verification_url}`, 0, 455, { align: 'center' })
    }

    doc
      .fontSize(16)
      .fillColor('#ffffff')
      .text('Digital Wave IT Solutions', 0, 500, { align: 'center' })

    doc.end()
  } catch (error) {
    console.error('Download certificate error:', error)
    res.status(500).json({ success: false, message: 'Failed to download certificate' })
  }
})

// Admin all certificates
router.get('/all', async (req, res) => {
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
})

export default router