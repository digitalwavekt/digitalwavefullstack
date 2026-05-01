import express from 'express'

const router = express.Router()

// Mock data stores
let courses = [
  { id: 'mern', name: 'MERN Stack Development', description: 'Master MongoDB, Express, React, and Node.js', duration: [1, 2, 3, 6], pricePerMonth: 2999, students: 456, status: 'active' },
  { id: 'ai-ml', name: 'AI & Machine Learning', description: 'Learn Python, TensorFlow, and build intelligent systems', duration: [1, 2, 3, 6], pricePerMonth: 3499, students: 234, status: 'active' },
  { id: 'python', name: 'Python Development', description: 'Comprehensive Python programming with Django and Flask', duration: [1, 2, 3, 6], pricePerMonth: 2499, students: 389, status: 'active' },
  { id: 'web-dev', name: 'Web Development', description: 'Modern frontend and full-stack web apps', duration: [1, 2, 3, 6], pricePerMonth: 2799, students: 567, status: 'active' },
  { id: 'app-dev', name: 'Mobile App Development', description: 'Build cross-platform mobile apps', duration: [1, 2, 3, 6], pricePerMonth: 3299, students: 198, status: 'active' },
  { id: 'data-science', name: 'Data Science', description: 'Data analysis and visualization', duration: [1, 2, 3, 6], pricePerMonth: 2999, students: 312, status: 'active' },
]

let settings = {
  general: {
    companyName: 'Digital Wave IT Solutions Pvt Ltd',
    tagline: 'Transforming Ideas into Digital Reality',
    description: 'Leading IT solutions provider',
  },
  contact: {
    email: 'info@digitalwaveit.com',
    supportEmail: 'support@digitalwaveit.com',
    phone: '+91 98765 43210',
    address: '123 Tech Park, Sector 62, Noida, UP 201301',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.1234567890123!2d77.3616!3d28.6139',
  },
  social: {
    facebook: 'https://facebook.com/digitalwaveit',
    twitter: 'https://twitter.com/digitalwaveit',
    instagram: 'https://instagram.com/digitalwaveit',
    linkedin: 'https://linkedin.com/company/digitalwaveit',
  },
  payment: {
    payuMode: 'test',
    currency: 'INR',
  }
}

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalStudents: 2456,
      activeCourses: courses.filter(c => c.status === 'active').length,
      totalProjects: 342,
      monthlyRevenue: 420000,
      recentStudents: [
        { name: 'Rahul Sharma', course: 'MERN Stack', date: '2024-01-15', status: 'active' },
        { name: 'Priya Patel', course: 'AI & ML', date: '2024-01-14', status: 'active' },
        { name: 'Amit Kumar', course: 'Python', date: '2024-01-13', status: 'pending' },
        { name: 'Sneha Gupta', course: 'Data Science', date: '2024-01-12', status: 'completed' },
        { name: 'Vikram Singh', course: 'Web Dev', date: '2024-01-11', status: 'active' },
      ],
      pendingProjects: [
        { student: 'Rohan Mehta', project: 'E-Commerce Platform', stack: 'MERN', amount: '₹4,999', status: 'payment_pending' },
        { student: 'Anjali Desai', project: 'Sentiment Analysis', stack: 'AI/ML', amount: '₹5,999', status: 'in_progress' },
        { student: 'Karan Joshi', project: 'Library Management', stack: 'Python', amount: '₹4,499', status: 'review' },
      ]
    }

    res.json({ success: true, data: stats })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' })
  }
})

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    res.json({ success: true, data: courses })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses' })
  }
})

// Create course
router.post('/courses', async (req, res) => {
  try {
    const newCourse = { ...req.body, id: Date.now().toString(), students: 0 }
    courses.push(newCourse)
    res.json({ success: true, message: 'Course created', data: newCourse })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create course' })
  }
})

// Update course
router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params
    const index = courses.findIndex(c => c.id === id)
    if (index === -1) return res.status(404).json({ success: false, message: 'Course not found' })

    courses[index] = { ...courses[index], ...req.body }
    res.json({ success: true, message: 'Course updated', data: courses[index] })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

// Delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params
    courses = courses.filter(c => c.id !== id)
    res.json({ success: true, message: 'Course deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' })
  }
})

// Get settings
router.get('/settings', async (req, res) => {
  try {
    res.json({ success: true, data: settings })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' })
  }
})

// Update settings
router.put('/settings', async (req, res) => {
  try {
    settings = { ...settings, ...req.body }
    res.json({ success: true, message: 'Settings updated', data: settings })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

export default router
