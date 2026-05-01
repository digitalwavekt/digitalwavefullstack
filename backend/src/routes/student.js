import express from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Mock student data store
let students = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul@email.com',
    googleId: 'google_123',
    courseId: 'mern',
    courseName: 'MERN Stack Development',
    duration: 3,
    startDate: '2024-01-01',
    endDate: '2024-04-01',
    status: 'active',
    progress: 65,
    classesAttended: 12,
    totalClasses: 18,
    assignmentsCompleted: 8,
    daysLeft: 45,
    certificateAvailable: false,
    googleMeetEmail: 'rahul@digitalwaveit.com',
    googleMeetPassword: 'RAHU01011999',
    upcomingClasses: [
      { title: 'React Hooks Deep Dive', date: '2024-02-15', time: '10:00 AM', meetLink: 'https://meet.google.com/abc-defg-hij' },
      { title: 'Node.js Authentication', date: '2024-02-17', time: '2:00 PM', meetLink: 'https://meet.google.com/klm-nopq-rst' },
    ]
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'priya@email.com',
    googleId: 'google_456',
    courseId: 'ai-ml',
    courseName: 'AI & Machine Learning',
    duration: 6,
    startDate: '2023-10-01',
    endDate: '2024-04-01',
    status: 'active',
    progress: 88,
    classesAttended: 28,
    totalClasses: 32,
    assignmentsCompleted: 15,
    daysLeft: 12,
    certificateAvailable: false,
    googleMeetEmail: 'priya@digitalwaveit.com',
    googleMeetPassword: 'PRIY15051998',
    upcomingClasses: [
      { title: 'Neural Networks', date: '2024-02-16', time: '11:00 AM', meetLink: 'https://meet.google.com/uvw-wxyz-abc' },
    ]
  },
  {
    id: 3,
    name: 'Sneha Gupta',
    email: 'sneha@email.com',
    googleId: 'google_789',
    courseId: 'data-science',
    courseName: 'Data Science',
    duration: 3,
    startDate: '2023-11-01',
    endDate: '2024-02-01',
    status: 'completed',
    progress: 100,
    classesAttended: 18,
    totalClasses: 18,
    assignmentsCompleted: 12,
    daysLeft: 0,
    certificateAvailable: true,
    googleMeetEmail: 'sneha@digitalwaveit.com',
    googleMeetPassword: 'SNEH20081999',
    upcomingClasses: [],
    certificateId: 'DW-2024-003'
  }
]

// Middleware
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

// Register student after payment
router.post('/register', async (req, res) => {
  try {
    const { name, email, googleId, courseId, courseName, duration, amount } = req.body

    // Generate Google Meet credentials
    // Password format: First 4 letters of name (CAPS) + DOB (DDMMYYYY)
    const first4Name = name.replace(/\s/g, '').substring(0, 4).toUpperCase()
    const dobFormatted = '01011999' // This would come from the form
    const meetPassword = `${first4Name}${dobFormatted}`

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + parseInt(duration))

    const newStudent = {
      id: Date.now(),
      name,
      email,
      googleId,
      courseId,
      courseName,
      duration: parseInt(duration),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
      progress: 0,
      classesAttended: 0,
      totalClasses: parseInt(duration) * 6, // 6 classes per month
      assignmentsCompleted: 0,
      daysLeft: parseInt(duration) * 30,
      certificateAvailable: false,
      googleMeetEmail: email,
      googleMeetPassword: meetPassword,
      upcomingClasses: []
    }

    students.push(newStudent)

    res.json({
      success: true,
      message: 'Student registered successfully',
      data: {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        meetEmail: newStudent.googleMeetEmail,
        meetPassword: newStudent.googleMeetPassword,
        startDate: newStudent.startDate,
        endDate: newStudent.endDate
      }
    })
  } catch (error) {
    console.error('Student registration error:', error)
    res.status(500).json({ success: false, message: 'Registration failed' })
  }
})

// Get student dashboard
router.get('/dashboard', studentAuth, async (req, res) => {
  try {
    const student = students.find(s => s.email === req.user.email)

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    // Check if certificate should be available
    const today = new Date()
    const endDate = new Date(student.endDate)

    if (today >= endDate && student.progress >= 80) {
      student.certificateAvailable = true
    }

    res.json({
      success: true,
      data: {
        name: student.name,
        email: student.email,
        courseName: student.courseName,
        duration: student.duration,
        startDate: student.startDate,
        endDate: student.endDate,
        status: student.status,
        progress: student.progress,
        classesAttended: student.classesAttended,
        totalClasses: student.totalClasses,
        assignmentsCompleted: student.assignmentsCompleted,
        daysLeft: student.daysLeft,
        certificateAvailable: student.certificateAvailable,
        certificateId: student.certificateId,
        googleMeetEmail: student.googleMeetEmail,
        googleMeetPassword: student.googleMeetPassword,
        upcomingClasses: student.upcomingClasses
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load dashboard' })
  }
})

// Download certificate
router.get('/certificate/download', studentAuth, async (req, res) => {
  try {
    const student = students.find(s => s.email === req.user.email)

    if (!student || !student.certificateAvailable) {
      return res.status(403).json({ success: false, message: 'Certificate not available' })
    }

    // In production, generate PDF here
    // For now, return certificate data
    res.json({
      success: true,
      data: {
        certificateId: student.certificateId || `DW-${new Date().getFullYear()}-${String(student.id).padStart(3, '0')}`,
        studentName: student.name,
        courseName: student.courseName,
        issueDate: new Date().toISOString().split('T')[0],
        duration: student.duration
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate certificate' })
  }
})

// Get all students (admin)
router.get('/all', async (req, res) => {
  try {
    res.json({ success: true, data: students })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students' })
  }
})

export default router
