import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'

const router = express.Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  })
}

const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
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

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required',
      })
    }

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

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'user',
    })

    const refreshToken = signRefreshToken({
      id: user.id,
      email: user.email,
      type: 'user',
    })

    res.json({
      success: true,
      accessToken,
      refreshToken,
      token: accessToken,
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

// Admin Login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input format',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      })
    }

    const supabase = getSupabase(req)

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', normalizedEmail)
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

    const accessToken = signAccessToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    })

    const refreshToken = signRefreshToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    })

    res.json({
      success: true,
      accessToken,
      refreshToken,
      token: accessToken,
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

// Refresh Token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      })
    }

    let decoded

    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

    const supabase = getSupabase(req)

    if (decoded.type === 'admin') {
      const { data: admin } = await supabase
        .from('admins')
        .select('id,email,role,status')
        .eq('id', decoded.id)
        .maybeSingle()

      if (!admin || admin.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Admin not found or inactive',
        })
      }

      const accessToken = signAccessToken({
        id: admin.id,
        email: admin.email,
        role: admin.role,
        type: 'admin',
      })

      return res.json({
        success: true,
        accessToken,
        token: accessToken,
      })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id,email,name')
      .eq('id', decoded.id)
      .maybeSingle()

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found',
      })
    }

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'user',
    })

    res.json({
      success: true,
      accessToken,
      token: accessToken,
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
    })
  }
})

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const supabase = getSupabase(req)

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (!admin) {
      return res.json({
        success: true,
        message: 'If this email exists, reset instructions will be sent.',
      })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const { error } = await supabase
      .from('admins')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetExpiry,
        updated_at: new Date().toISOString(),
      })
      .eq('id', admin.id)

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create reset token',
      })
    }

    console.log('Password reset token:', resetToken)

    res.json({
      success: true,
      message: 'If this email exists, reset instructions will be sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
    })
  }
})

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      })
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      })
    }

    const supabase = getSupabase(req)

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('reset_token', token)
      .maybeSingle()

    if (!admin || !admin.reset_token_expiry) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      })
    }

    if (new Date(admin.reset_token_expiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    const { error } = await supabase
      .from('admins')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expiry: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', admin.id)

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reset password',
      })
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
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

    const normalizedEmail = email.trim().toLowerCase()
    const supabase = getSupabase(req)

    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', normalizedEmail)
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
        email: normalizedEmail,
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

    if (updates.email) {
      updates.email = updates.email.trim().toLowerCase()
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