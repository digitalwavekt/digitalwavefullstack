import express from 'express'
import { adminAuth } from '../middleware/adminAuth.js'

const router = express.Router()

const getSupabase = (req) => {
    const db = req.app.locals.db

    if (!db || !db.connection) {
        throw new Error('Supabase not configured')
    }

    return db.connection
}

// Generate signed upload URL
router.post('/signed-url', adminAuth, async (req, res) => {
    try {
        const supabase = getSupabase(req)

        const {
            bucket = 'uploads',
            fileName,
            folder = 'general',
        } = req.body

        if (!fileName) {
            return res.status(400).json({
                success: false,
                message: 'fileName required',
            })
        }

        const path = `${folder}/${Date.now()}-${fileName}`

        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUploadUrl(path)

        if (error) throw error

        const publicUrl = supabase.storage
            .from(bucket)
            .getPublicUrl(path)

        res.json({
            success: true,
            data: {
                path,
                token: data.token,
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