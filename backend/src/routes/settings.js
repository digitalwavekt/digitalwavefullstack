import express from 'express'

const router = express.Router()

// Settings store
let appSettings = {
  general: {
    companyName: 'Digital Wave IT Solutions Pvt Ltd',
    tagline: 'Transforming Ideas into Digital Reality',
    description: 'Leading IT solutions provider offering website development, mobile apps, CRM solutions, college projects, and industry internship programs.',
    logo: '',
    favicon: '',
  },
  contact: {
    email: 'info@digitalwaveit.com',
    supportEmail: 'support@digitalwaveit.com',
    phone: '+91 98765 43210',
    alternatePhone: '+91 98765 43211',
    address: '123 Tech Park, Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    country: 'India',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.1234567890123!2d77.3616!3d28.6139',
  },
  social: {
    facebook: 'https://facebook.com/digitalwaveit',
    twitter: 'https://twitter.com/digitalwaveit',
    instagram: 'https://instagram.com/digitalwaveit',
    linkedin: 'https://linkedin.com/company/digitalwaveit',
    youtube: 'https://youtube.com/digitalwaveit',
    github: 'https://github.com/digitalwaveit',
  },
  payment: {
    payuMode: 'test',
    currency: 'INR',
  },
  team: [
    { name: 'Rahul Verma', role: 'Founder & CEO', image: 'RV' },
    { name: 'Priya Sharma', role: 'Tech Lead', image: 'PS' },
    { name: 'Amit Kumar', role: 'Project Manager', image: 'AK' },
    { name: 'Sneha Gupta', role: 'HR & Operations', image: 'SG' },
  ]
}

// Get all settings
router.get('/', async (req, res) => {
  try {
    res.json({ success: true, data: appSettings })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' })
  }
})

// Get specific section
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params
    if (!appSettings[section]) {
      return res.status(404).json({ success: false, message: 'Section not found' })
    }
    res.json({ success: true, data: appSettings[section] })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' })
  }
})

// Update settings
router.put('/', async (req, res) => {
  try {
    appSettings = { ...appSettings, ...req.body }
    res.json({ success: true, message: 'Settings updated', data: appSettings })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

// Update specific section
router.put('/:section', async (req, res) => {
  try {
    const { section } = req.params
    appSettings[section] = { ...appSettings[section], ...req.body }
    res.json({ success: true, message: 'Section updated', data: appSettings[section] })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

// Add team member
router.post('/team', async (req, res) => {
  try {
    const newMember = { ...req.body, id: Date.now() }
    appSettings.team.push(newMember)
    res.json({ success: true, message: 'Team member added', data: newMember })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add member' })
  }
})

// Remove team member
router.delete('/team/:id', async (req, res) => {
  try {
    const { id } = req.params
    appSettings.team = appSettings.team.filter(m => m.id !== parseInt(id))
    res.json({ success: true, message: 'Team member removed' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove member' })
  }
})

export default router
