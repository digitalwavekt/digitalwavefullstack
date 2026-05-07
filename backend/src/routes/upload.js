import express from 'express'
import path from 'path'
import crypto from 'crypto'
import { adminAuth } from '../middleware/adminAuth.js'
import { successResponse, errorResponse } from '../utils/response.js'

const router = express.Router()

const ALLOWED_BUCKETS = new Set(['uploads', 'certificates'])
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.pdf'])
const MAX_FILE_NAME_LENGTH = 120

const getSupabase = (req) => {
  const db = req.app.locals.db

  if (!db || !db.connection) {
    throw new Error('Supabase not configured')
  }

  return db.connection
}

const sanitizeSegment = (value = 'general') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-/]+|[-/]+$/g, '') || 'general'

const sanitizeFileName = (fileName = '') => {
  const ext = path.extname(fileName).toLowerCase()
  const base = path
    .basename(fileName, ext)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, MAX_FILE_NAME_LENGTH)

  return `${base || 'file'}${ext}`
}

router.post('/signed-url', adminAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { bucket = 'uploads', fileName, folder = 'general' } = req.body

    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({ success: false, message: 'fileName required' })
    }

    if (!ALLOWED_BUCKETS.has(bucket)) {
      return res.status(400).json({ success: false, message: 'Invalid upload bucket' })
    }

    const ext = path.extname(fileName).toLowerCase()

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return res.status(400).json({ success: false, message: 'File type not allowed' })
    }

    const safeFolder = sanitizeSegment(folder)
    const safeFileName = sanitizeFileName(fileName)
    const safePath = `${safeFolder}/${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}-${safeFileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(safePath)

    if (error) throw error

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(safePath)

    res.json({
      success: true,
      data: {
        path: safePath,
        signedUrl: data.signedUrl,
        publicUrl: publicUrl.data.publicUrl,
      },
    })
  } catch (error) {
    console.error('Signed URL error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to create upload URL',
    })
  }
})

export default router
