import express from 'express'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'
import { successResponse, errorResponse } from '../utils/response.js'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db

  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database is not configured')
  }

  return db.connection
}

const formatProject = (project) => ({
  id: project.id,
  studentName: project.student_name,
  email: project.email,
  phone: project.phone,
  college: project.college,
  branch: project.branch,
  year: project.year,
  project: project.project,
  stack: project.stack,
  requirements: project.requirements,
  amount: project.amount,
  status: project.status,
  createdAt: project.created_at,
  updatedAt: project.updated_at,
})

// PUBLIC: submit college project request
router.post('/submit', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const {
      studentName,
      name,
      email,
      phone,
      college,
      branch,
      year,
      project,
      projectTitle,
      stack,
      requirements,
      amount,
    } = req.body

    const { data, error } = await supabase
      .from('college_projects')
      .insert({
        student_name: studentName || name || '',
        email: email || '',
        phone: phone || '',
        college: college || '',
        branch: branch || '',
        year: year || '',
        project: project || projectTitle || '',
        stack: stack || '',
        requirements: requirements || '',
        amount: Number(amount || 0),
        status: 'payment_pending',
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: 'Project request submitted successfully',
      data: formatProject(data),
    })
  } catch (error) {
    console.error('Submit college project error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit project request',
    })
  }
})

// ADMIN: get all projects
router.get(
  '/',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)

      const { data, error } = await supabase
        .from('college_projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      res.json({
        success: true,
        data: (data || []).map(formatProject),
      })
    } catch (error) {
      console.error('Fetch college projects error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
      })
    }
  }
)

// ADMIN: get single project
router.get(
  '/:id',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)
      const { id } = req.params

      const { data, error } = await supabase
        .from('college_projects')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        })
      }

      res.json({
        success: true,
        data: formatProject(data),
      })
    } catch (error) {
      console.error('Fetch college project error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch project',
      })
    }
  }
)

// ADMIN: update project status
router.put(
  '/:id/status',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)
      const { id } = req.params
      const { status } = req.body

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required',
        })
      }

      const { data, error } = await supabase
        .from('college_projects')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      res.json({
        success: true,
        message: 'Project status updated',
        data: formatProject(data),
      })
    } catch (error) {
      console.error('Update college project status error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update status',
      })
    }
  }
)

export default router