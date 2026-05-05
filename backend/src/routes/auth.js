import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const router = express.Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

const getSupabase = (req) => {
  const db = req.app.locals.db

  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database is not configured')
  }

  return db.connection
}

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }
}

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const supabase = getSupabase(req)

    const { data: admin, error } = await supabase
      .from('admins')
      .select('id,email,name,role,permissions,status')
      .eq('id', decoded.id)
      .maybeSingle()

    if (error || !admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      })
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is inactive',
      })
    }

    if (admin.role !== 'admin' && admin.role !== 'subadmin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      })
    }

    req.user = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions || [],
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }
}

// Google Auth
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured',
      })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const supabase = getSupabase(req)

    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', payload.email)
      .maybeSingle()

    let user = existingUser

    if (!user) {
      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert({
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
          google_id: payload.sub,
          provider: 'google',
        })
        .select()
        .single()

      if (createError) {
        return res.status(500).json({
          success: false,
          message: createError.message,
        })
      }

      user = createdUser
    }

    const jwtToken = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'user',
    })

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
    })
  }
})

// Admin Login from Supabase DB
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const supabase = getSupabase(req)

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is inactive',
      })
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    const token = signToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    })

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed',
    })
  }
})

// Create Sub-Admin
router.post('/subadmin', adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can create sub-admins',
      })
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      })
    }

    const supabase = getSupabase(req)

    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { data: newSubAdmin, error } = await supabase
      .from('admins')
      .insert({
        name,
        email,
        password_hash: passwordHash,
        role: 'subadmin',
        permissions: permissions || [],
        status: 'active',
      })
      .select('id,name,email,role,permissions,status,created_at')
      .single()

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    res.json({
      success: true,
      message: 'Sub-admin created successfully',
      user: newSubAdmin,
    })
  } catch (error) {
    console.error('Create sub-admin error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create sub-admin',
    })
  }
})

// Get all sub-admins
router.get('/subadmins', adminMiddleware, async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data, error } = await supabase
      .from('admins')
      .select('id,name,email,role,permissions,status,created_at,updated_at')
      .eq('role', 'subadmin')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sub-admins',
    })
  }
})

// Update sub-admin
router.put('/subadmin/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const updates = { ...req.body }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can update sub-admins',
      })
    }

    const supabase = getSupabase(req)

    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 10)
      delete updates.password
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('admins')
      .update(updates)
      .eq('id', id)
      .eq('role', 'subadmin')
      .select('id,name,email,role,permissions,status,created_at,updated_at')
      .single()

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    res.json({
      success: true,
      message: 'Sub-admin updated',
      data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Update failed',
    })
  }
})

// Delete sub-admin
router.delete('/subadmin/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can delete sub-admins',
      })
    }

    const supabase = getSupabase(req)

    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id)
      .eq('role', 'subadmin')

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    res.json({
      success: true,
      message: 'Sub-admin removed',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Delete failed',
    })
  }
})

export default router
export { authMiddleware, adminMiddleware }