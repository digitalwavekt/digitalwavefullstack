import express from 'express'

const router = express.Router()

// Mock data store
let collegeProjects = [
  { id: 1, studentName: 'Rohan Mehta', email: 'rohan@email.com', phone: '+91 98765 43220', college: 'DTU Delhi', branch: 'CSE', year: '4', project: 'E-Commerce Platform', stack: 'MERN', amount: 4999, status: 'payment_pending', requirements: 'Need payment gateway integration and admin dashboard', submittedAt: '2024-01-15' },
  { id: 2, studentName: 'Anjali Desai', email: 'anjali@email.com', phone: '+91 98765 43221', college: 'IIT Bombay', branch: 'CSE', year: '4', project: 'Sentiment Analysis', stack: 'AI/ML', amount: 5999, status: 'in_progress', requirements: 'Twitter sentiment analysis with visualization', submittedAt: '2024-01-14' },
  { id: 3, studentName: 'Karan Joshi', email: 'karan@email.com', phone: '+91 98765 43222', college: 'NIT Trichy', branch: 'IT', year: '4', project: 'Library Management', stack: 'Python', amount: 4499, status: 'review', requirements: 'Django based with MySQL database', submittedAt: '2024-01-13' },
  { id: 4, studentName: 'Neha Reddy', email: 'neha@email.com', phone: '+91 98765 43223', college: 'BITS Pilani', branch: 'CSE', year: '3', project: 'Fitness Tracker App', stack: 'Mobile App', amount: 5499, status: 'completed', requirements: 'React Native with Firebase backend', submittedAt: '2024-01-12' },
]

// Submit college project request
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, college, branch, year, rollNumber, projectTitle, requirements, stackId, projectName, amount } = req.body

    const newProject = {
      id: Date.now(),
      studentName: name,
      email,
      phone,
      college,
      branch,
      year,
      rollNumber,
      project: projectName || projectTitle,
      stack: stackId,
      amount: parseInt(amount),
      status: 'payment_pending',
      requirements: requirements || 'No specific requirements',
      submittedAt: new Date().toISOString().split('T')[0]
    }

    collegeProjects.push(newProject)

    // Return payment initiation URL
    res.json({
      success: true,
      message: 'Project request submitted',
      data: {
        projectId: newProject.id,
        paymentUrl: `/api/payment/initiate?amount=${amount}&type=college-project&projectId=${newProject.id}`
      }
    })
  } catch (error) {
    console.error('Project submission error:', error)
    res.status(500).json({ success: false, message: 'Submission failed' })
  }
})

// Get all college projects
router.get('/', async (req, res) => {
  try {
    res.json({ success: true, data: collegeProjects })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects' })
  }
})

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = collegeProjects.find(p => p.id === parseInt(req.params.id))
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    res.json({ success: true, data: project })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch project' })
  }
})

// Update project status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const project = collegeProjects.find(p => p.id === parseInt(id))
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    project.status = status
    project.updatedAt = new Date()

    res.json({ success: true, message: 'Status updated', data: project })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

// Send project structure
router.post('/:id/structure', async (req, res) => {
  try {
    const { id } = req.params
    const { structure } = req.body

    const project = collegeProjects.find(p => p.id === parseInt(id))
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    project.structure = structure
    project.structureSentAt = new Date()

    res.json({ success: true, message: 'Project structure sent to student' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send structure' })
  }
})

export default router
