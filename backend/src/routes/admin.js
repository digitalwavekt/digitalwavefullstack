import express from 'express'

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
  students: course.students,
  status: course.status,
  createdAt: course.created_at,
  updatedAt: course.updated_at,
})

// Dashboard stats
router.get('/stats', async (req, res) => {
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
      .from('college_projects')
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
      .select('name,course_name,start_date,status')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: pendingProjects } = await supabase
      .from('college_projects')
      .select('student_name,project,stack,amount,status')
      .in('status', ['payment_pending', 'in_progress', 'review'])
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
          course: s.course_name,
          date: s.start_date,
          status: s.status,
        })),
        pendingProjects: (pendingProjects || []).map((p) => ({
          student: p.student_name,
          project: p.project,
          stack: p.stack,
          amount: `₹${p.amount || 0}`,
          status: p.status,
        })),
      },
    })
  } catch (error) {
    console.error('Fetch admin stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
    })
  }
})

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: (data || []).map(formatCourse),
    })
  } catch (error) {
    console.error('Fetch courses error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
    })
  }
})

// Create course
router.post('/courses', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const id =
      req.body.id ||
      req.body.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      Date.now().toString()

    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: 'Course name is required',
      })
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        id,
        name: req.body.name,
        description: req.body.description || '',
        duration: req.body.duration || [1, 2, 3, 6],
        price_per_month: Number(
          req.body.pricePerMonth || req.body.price_per_month || 0
        ),
        students: Number(req.body.students || 0),
        status: req.body.status || 'active',
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: 'Course created',
      data: formatCourse(data),
    })
  } catch (error) {
    console.error('Create course error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
    })
  }
})

// Update course
router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase(req)

    const updates = {
      updated_at: new Date().toISOString(),
    }

    if (req.body.name !== undefined) updates.name = req.body.name
    if (req.body.description !== undefined) updates.description = req.body.description
    if (req.body.duration !== undefined) updates.duration = req.body.duration
    if (req.body.pricePerMonth !== undefined) {
      updates.price_per_month = Number(req.body.pricePerMonth)
    }
    if (req.body.price_per_month !== undefined) {
      updates.price_per_month = Number(req.body.price_per_month)
    }
    if (req.body.students !== undefined) updates.students = Number(req.body.students)
    if (req.body.status !== undefined) updates.status = req.body.status

    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: 'Course updated',
      data: formatCourse(data),
    })
  } catch (error) {
    console.error('Update course error:', error)
    res.status(500).json({
      success: false,
      message: 'Update failed',
    })
  }
})

// Delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase(req)

    const { error } = await supabase.from('courses').delete().eq('id', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Course deleted',
    })
  } catch (error) {
    console.error('Delete course error:', error)
    res.status(500).json({
      success: false,
      message: 'Delete failed',
    })
  }
})

// Settings are now handled by /api/settings
router.get('/settings', async (req, res) => {
  res.redirect(307, '/api/settings')
})

router.put('/settings', async (req, res) => {
  res.redirect(307, '/api/settings')
})

export default router