import express from 'express'
import { authMiddleware } from './auth.js'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db

  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database is not configured')
  }

  return db.connection
}

const normalizeReview = (review) => ({
  id: review.id,
  name: review.name,
  email: review.email,
  role: review.role || 'Digital Wave Client',
  rating: review.rating,
  comment: review.comment,
  status: review.status,
  createdAt: review.created_at,
})

router.get('/', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { data, error } = await supabase
      .from('user_reviews')
      .select('id,name,email,role,rating,comment,status,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    res.json({
      success: true,
      data: (data || []).map(normalizeReview),
    })
  } catch (error) {
    console.error('Fetch reviews error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const rating = Number(req.body.rating)
    const comment = String(req.body.comment || '').trim()
    const role = String(req.body.role || 'Digital Wave Client').trim()

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' })
    }

    if (comment.length < 10 || comment.length > 600) {
      return res.status(400).json({ success: false, message: 'Comment must be 10 to 600 characters' })
    }

    const supabase = getSupabase(req)
    const { data, error } = await supabase
      .from('user_reviews')
      .insert({
        user_id: req.user.id,
        name: req.user.name || req.user.email?.split('@')?.[0] || 'Digital Wave User',
        email: req.user.email,
        role,
        rating,
        comment,
        status: 'pending',
      })
      .select('id,name,email,role,rating,comment,status,created_at')
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      message: 'Review submitted for admin approval',
      data: normalizeReview(data),
    })
  } catch (error) {
    console.error('Create review error:', error)
    res.status(500).json({ success: false, message: 'Failed to submit review' })
  }
})

router.get('/admin', adminAuth, requirePermission('manage_settings'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { data, error } = await supabase
      .from('user_reviews')
      .select('id,name,email,role,rating,comment,status,created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    res.json({ success: true, data: (data || []).map(normalizeReview) })
  } catch (error) {
    console.error('Fetch admin reviews error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' })
  }
})

router.put('/admin/:id', adminAuth, requirePermission('manage_settings'), async (req, res) => {
  try {
    const status = ['pending', 'approved', 'rejected'].includes(req.body.status)
      ? req.body.status
      : null

    if (!status) {
      return res.status(400).json({ success: false, message: 'Invalid review status' })
    }

    const supabase = getSupabase(req)
    const { data, error } = await supabase
      .from('user_reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('id,name,email,role,rating,comment,status,created_at')
      .single()

    if (error) throw error

    res.json({ success: true, data: normalizeReview(data) })
  } catch (error) {
    console.error('Update review error:', error)
    res.status(500).json({ success: false, message: 'Failed to update review' })
  }
})

export default router
