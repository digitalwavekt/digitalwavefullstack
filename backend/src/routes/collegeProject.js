import express from 'express'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db

  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database not configured')
  }

  return db.connection
}

const formatProject = (p) => ({
  id: p.id,
  studentName: p.student_name,
  email: p.email,
  phone: p.phone,
  college: p.college,
  branch: p.branch,
  year: p.year,
  rollNumber: p.roll_number,
  project: p.project,
  stack: p.stack,
  amount: p.amount,
  status: p.status,
  requirements: p.requirements,
  structure: p.structure,
  structureSentAt: p.structure_sent_at,
  submittedAt: p.submitted_at,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
})

router.post('/submit', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const {
      name,
      email,
      phone,
      college,
      branch,
      year,
      rollNumber,
      projectTitle,
      requirements,
      stackId,
      projectName,
      amount,
    } = req.body

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      })
    }

    const { data, error } = await supabase
      .from('college_projects')
      .insert({
        student_name: name,
        email,
        phone,
        college,
        branch,
        year,
        roll_number: rollNumber,
        project: projectName || projectTitle,
        stack: stackId,
        amount: Number(amount || 0),
        status: 'payment_pending',
        requirements: requirements || 'No specific requirements',
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: 'Project request submitted',
      data: {
        projectId: data.id,
        project: formatProject(data),
        paymentUrl: `/api/payment/initiate?amount=${data.amount}&type=college-project&projectId=${data.id}`,
      },
    })
  } catch (error) {
    console.error('Project submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Submission failed',
    })
  }
})

router.get('/', async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data, error } = await supabase
      .from('college_projects')
      .select('*')
      .eq('id', req.params.id)
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
    })
  }
})

router.put('/:id/status', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { status } = req.body

    const { data, error } = await supabase
      .from('college_projects')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: 'Status updated',
      data: formatProject(data),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Update failed',
    })
  }
})

router.post('/:id/structure', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { structure } = req.body

    const { data, error } = await supabase
      .from('college_projects')
      .update({
        structure,
        structure_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: 'Project structure sent to student',
      data: formatProject(data),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send structure',
    })
  }
})

export default router