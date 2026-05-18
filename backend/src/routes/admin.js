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

const formatCourse = (course) => ({
  id: course.id,
  name: course.name,
  description: course.description,
  duration: course.duration,
  pricePerMonth: course.price_per_month,
  projectPrice: course.project_price || 0,
  projectsList: course.projects_list || [],
  students: course.students,
  status: course.status,
  thumbnail: course.thumbnail,
  createdAt: course.created_at,
  updatedAt: course.updated_at,
})

// PUBLIC: Active courses for student enrollment page (no auth required)
router.get('/courses/public', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: (data || []).map(formatCourse),
    })
  } catch (error) {
    console.error('Fetch public courses error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch courses' })
  }
})

// Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    const { count: activeCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: totalProjects } = await supabase
      .from('project_orders')
      .select('*', { count: 'exact', head: true })

    const { data: payments } = await supabase
      .from('transactions')
      .select('amount,status')
      .eq('status', 'completed')

    const monthlyRevenue = (payments || []).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    )

    const { data: recentStudents } = await supabase
      .from('students')
      .select('name,email,course_name,start_date,status')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: pendingOrders } = await supabase
      .from('project_orders')
      .select('student_name,title,tech_stack,total_amount,status,order_type')
      .in('status', ['payment_pending', 'requirements_received', 'admin_review'])
      .order('created_at', { ascending: false })
      .limit(5)

    res.json({
      success: true,
      data: {
        totalStudents: totalStudents || 0,
        activeCourses: activeCourses || 0,
        totalProjects: totalProjects || 0,
        monthlyRevenue,
        recentStudents: (recentStudents || []).map((s) => ({
          name: s.name,
          email: s.email,
          course: s.course_name,
          date: s.start_date,
          status: s.status,
        })),
        pendingProjects: (pendingOrders || []).map((p) => ({
          student: p.student_name,
          project: p.title,
          stack: p.tech_stack,
          amount: `₹${Number(p.total_amount || 0).toLocaleString()}`,
          status: p.status,
          type: p.order_type,
        })),
      },
    })
  } catch (error) {
    console.error('Fetch admin stats error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch stats' })
  }
})

// Admin students list
router.get('/students', adminAuth, requirePermission('manage_students'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('Fetch admin students error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch students' })
  }
})

// Get all courses (admin)
router.get('/courses', adminAuth, requirePermission('manage_courses'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ success: true, data: (data || []).map(formatCourse) })
  } catch (error) {
    console.error('Fetch courses error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch courses' })
  }
})

// Create course
router.post('/courses', adminAuth, requirePermission('manage_courses'), async (req, res) => {
  try {
    const supabase = getSupabase(req)

    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Course name is required' })
    }

    const id =
      req.body.id ||
      req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      Date.now().toString()

    // projects_list: accept as array or newline-separated string
    let projectsList = req.body.projectsList || []
    if (typeof projectsList === 'string') {
      projectsList = projectsList.split('\n').map(s => s.trim()).filter(Boolean)
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        id,
        name: req.body.name,
        description: req.body.description || '',
        duration: req.body.duration || [1, 2, 3, 6],
        price_per_month: Number(req.body.pricePerMonth || 0),
        project_price: Number(req.body.projectPrice || 0),
        projects_list: projectsList,
        students: Number(req.body.students || 0),
        status: req.body.status || 'active',
        thumbnail: req.body.thumbnail || '',
      })
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, message: 'Course created', data: formatCourse(data) })
  } catch (error) {
    console.error('Create course error:', error)
    res.status(500).json({ success: false, message: 'Failed to create course' })
  }
})

// Update course
router.put('/courses/:id', adminAuth, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase(req)
    const updates = { updated_at: new Date().toISOString() }

    if (req.body.name !== undefined) updates.name = req.body.name
    if (req.body.description !== undefined) updates.description = req.body.description
    if (req.body.duration !== undefined) updates.duration = req.body.duration
    if (req.body.pricePerMonth !== undefined) updates.price_per_month = Number(req.body.pricePerMonth)
    if (req.body.projectPrice !== undefined) updates.project_price = Number(req.body.projectPrice)
    if (req.body.projectsList !== undefined) {
      let pl = req.body.projectsList
      if (typeof pl === 'string') pl = pl.split('\n').map(s => s.trim()).filter(Boolean)
      updates.projects_list = pl
    }
    if (req.body.students !== undefined) updates.students = Number(req.body.students)
    if (req.body.status !== undefined) updates.status = req.body.status
    if (req.body.thumbnail !== undefined) updates.thumbnail = req.body.thumbnail

    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, message: 'Course updated', data: formatCourse(data) })
  } catch (error) {
    console.error('Update course error:', error)
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

// Delete course
router.delete('/courses/:id', adminAuth, requirePermission('manage_courses'), async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase(req)
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true, message: 'Course deleted' })
  } catch (error) {
    console.error('Delete course error:', error)
    res.status(500).json({ success: false, message: 'Delete failed' })
  }
})

// Settings redirect
router.get('/settings', async (req, res) => { res.redirect(307, '/api/settings') })
router.put('/settings', async (req, res) => { res.redirect(307, '/api/settings') })

export default router