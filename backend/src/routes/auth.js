import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const router = express.Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// In-memory store (replace with DB in production)
let users = []
let admins = [
  { 
    id: 1, 
    name: 'Super Admin', 
    email: process.env.ADMIN_EMAIL || 'admin@digitalwaveit.com', 
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
    role: 'admin',
    permissions: ['all']
  }
]

// Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const admin = admins.find(a => a.id === decoded.id)

    if (!admin || (admin.role !== 'admin' && admin.role !== 'subadmin')) {
      return res.status(403).json({ success: false, message: 'Admin access required' })
    }

    req.user = { ...decoded, role: admin.role, permissions: admin.permissions || [] }
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

// Google Auth
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    let user = users.find(u => u.email === payload.email)

    if (!user) {
      user = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        googleId: payload.sub,
        createdAt: new Date()
      }
      users.push(user)
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    )

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ success: false, message: 'Google authentication failed' })
  }
})

// Admin Login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body

    const admin = admins.find(a => a.email === email)
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || []
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ success: false, message: 'Login failed' })
  }
})

// Create Sub-Admin (Admin only)
router.post('/subadmin', adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only super admin can create sub-admins' })
    }

    const existingAdmin = admins.find(a => a.email === email)
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newSubAdmin = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      role: 'subadmin',
      permissions: permissions || [],
      status: 'active',
      createdAt: new Date()
    }

    admins.push(newSubAdmin)

    res.json({
      success: true,
      message: 'Sub-admin created successfully',
      user: { id: newSubAdmin.id, name, email, role: 'subadmin' }
    })
  } catch (error) {
    console.error('Create sub-admin error:', error)
    res.status(500).json({ success: false, message: 'Failed to create sub-admin' })
  }
})

// Get all sub-admins
router.get('/subadmins', adminMiddleware, async (req, res) => {
  try {
    const subAdmins = admins
      .filter(a => a.role === 'subadmin')
      .map(({ password, ...rest }) => rest)

    res.json({ success: true, data: subAdmins })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sub-admins' })
  }
})

// Update sub-admin
router.put('/subadmin/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const index = admins.findIndex(a => a.id === parseInt(id))
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Sub-admin not found' })
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10)
    }

    admins[index] = { ...admins[index], ...updates }

    res.json({ success: true, message: 'Sub-admin updated' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

// Delete sub-admin
router.delete('/subadmin/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    admins = admins.filter(a => a.id !== parseInt(id))
    res.json({ success: true, message: 'Sub-admin removed' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' })
  }
})

export default router
export { authMiddleware, adminMiddleware }
