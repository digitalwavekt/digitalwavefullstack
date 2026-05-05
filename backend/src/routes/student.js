import express from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db

  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database not configured')
  }

  return db.connection
}

// 🔐 Auth middleware
const studentAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'No token' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

// 🧾 Register student
router.post('/register', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { name, email, googleId, courseId, courseName, duration, amount } = req.body

    const first4Name = name.replace(/\s/g, '').substring(0, 4).toUpperCase()
    const meetPassword = `${first4Name}01011999`

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + parseInt(duration))

    const { data, error } = await supabase
      .from('students')
      .insert({
        name,
        email,
        google_id: googleId,
        course_id: courseId,
        course_name: courseName,
        duration: parseInt(duration),
        amount: parseInt(amount || 0),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        progress: 0,
        classes_attended: 0,
        total_classes: parseInt(duration) * 6,
        assignments_completed: 0,
        certificate_available: false,
        google_meet_email: email,
        google_meet_password: meetPassword,
        upcoming_classes: []
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: 'Student registered',
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        meetEmail: data.google_meet_email,
        meetPassword: data.google_meet_password,
        startDate: data.start_date,
        endDate: data.end_date
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, message: 'Registration failed' })
  }
})

// 📊 Dashboard
router.get('/dashboard', studentAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', req.user.email)
      .maybeSingle()

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    const today = new Date()
    const endDate = new Date(data.end_date)

    let certificateAvailable = data.certificate_available

    if (today >= endDate && data.progress >= 80) {
      certificateAvailable = true
    }

    res.json({
      success: true,
      data: {
        name: data.name,
        email: data.email,
        courseName: data.course_name,
        duration: data.duration,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        progress: data.progress,
        classesAttended: data.classes_attended,
        totalClasses: data.total_classes,
        assignmentsCompleted: data.assignments_completed,
        certificateAvailable,
        certificateId: data.certificate_id,
        googleMeetEmail: data.google_meet_email,
        googleMeetPassword: data.google_meet_password,
        upcomingClasses: data.upcoming_classes || []
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Dashboard error' })
  }
})

// 📄 Certificate
router.get('/certificate/download', studentAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('email', req.user.email)
      .maybeSingle()

    if (!data || !data.certificate_available) {
      return res.status(403).json({ success: false, message: 'Certificate not available' })
    }

    res.json({
      success: true,
      data: {
        certificateId:
          data.certificate_id ||
          `DW-${new Date().getFullYear()}-${String(data.id).padStart(3, '0')}`,
        studentName: data.name,
        courseName: data.course_name,
        issueDate: new Date().toISOString().split('T')[0],
        duration: data.duration
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Certificate error' })
  }
})

// 👨‍💼 Admin: All students
router.get('/all', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' })
  }
})

export default router