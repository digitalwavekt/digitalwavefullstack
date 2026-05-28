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

// ============================================
// PROJECTS MANAGEMENT (Admin)
// ============================================
const formatProject = (project) => ({
  id: project.id,
  title: project.title,
  slug: project.slug,
  description: project.description,
  category: project.category,
  status: project.status,
  imageUrl: project.image_url,
  projectUrl: project.project_url,
  isActive: project.is_active,
  displayOrder: project.display_order,
  createdAt: project.created_at,
  updatedAt: project.updated_at,
})

router.get('/projects', adminAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { data, error } = await supabase
      .from('company_projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ success: true, data: (data || []).map(formatProject) })
  } catch (error) {
    console.error('Fetch admin projects error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch projects' })
  }
})

router.post('/projects', adminAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)
    if (!req.body.title) {
      return res.status(400).json({ success: false, message: 'Project title is required' })
    }

    const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || Date.now().toString()

    const { data, error } = await supabase
      .from('company_projects')
      .insert({
        title: req.body.title,
        slug,
        description: req.body.description || '',
        category: req.body.category || 'Uncategorized',
        status: req.body.status || 'Planning',
        image_url: req.body.imageUrl || '',
        project_url: req.body.projectUrl || '',
        is_active: req.body.isActive !== undefined ? req.body.isActive : true,
        display_order: Number(req.body.displayOrder || 0)
      })
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, message: 'Project created', data: formatProject(data) })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({ success: false, message: 'Failed to create project' })
  }
})

router.put('/projects/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase(req)
    const updates = { updated_at: new Date().toISOString() }

    if (req.body.title !== undefined) updates.title = req.body.title
    if (req.body.slug !== undefined) updates.slug = req.body.slug
    if (req.body.description !== undefined) updates.description = req.body.description
    if (req.body.category !== undefined) updates.category = req.body.category
    if (req.body.status !== undefined) updates.status = req.body.status
    if (req.body.imageUrl !== undefined) updates.image_url = req.body.imageUrl
    if (req.body.projectUrl !== undefined) updates.project_url = req.body.projectUrl
    if (req.body.isActive !== undefined) updates.is_active = req.body.isActive
    if (req.body.displayOrder !== undefined) updates.display_order = Number(req.body.displayOrder)

    const { data, error } = await supabase
      .from('company_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, message: 'Project updated', data: formatProject(data) })
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({ success: false, message: 'Update failed' })
  }
})

router.delete('/projects/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase(req)
    
    // Soft delete
    const { error } = await supabase
      .from('company_projects')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    res.json({ success: true, message: 'Project deleted (deactivated)' })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({ success: false, message: 'Delete failed' })
  }
})

// Settings redirect
router.get('/settings', async (req, res) => { res.redirect(307, '/api/settings') })
router.put('/settings', async (req, res) => { res.redirect(307, '/api/settings') })

export default router