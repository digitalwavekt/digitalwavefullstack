import express from 'express'
import jwt from 'jsonwebtoken'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db
  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database is not configured')
  }
  return db.connection
}

const studentAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

const generateOrderNumber = () => {
  const date = new Date()
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `DW-AI-${ymd}-${random}`
}

const formatOrder = (order) => ({
  id: order.id,
  orderNumber: order.order_number,
  userId: order.user_id,
  studentName: order.student_name,
  studentEmail: order.student_email,
  studentPhone: order.student_phone,
  college: order.college,
  branch: order.branch,
  year: order.year,
  title: order.title,
  category: order.category,
  internshipProgramType: order.internship_program_type,
  projectDomain: order.project_domain,
  deliveryTemplateId: order.delivery_template_id,
  techStack: order.tech_stack,
  deadline: order.deadline,
  priority: order.priority,
  status: order.status,
  estimatedDelivery: order.estimated_delivery,
  paymentStatus: order.payment_status,
  totalAmount: order.total_amount,
  currency: order.currency,
  createdAt: order.created_at,
  updatedAt: order.updated_at,
  requirements: order.project_requirements?.[0] || order.requirements || null,
  aiProject: order.ai_projects?.[0] || order.aiProject || null,
})

const friendlyProgress = (status) => {
  const map = {
    payment_pending: 'Payment Pending',
    paid: 'Order Placed',
    requirements_received: 'Requirements Received',
    ai_queued: 'AI Planning Queued',
    ai_generating: 'Project Under AI Generation',
    ai_failed: 'AI Generation Failed',
    admin_review: 'Quality Review',
    changes_required: 'Changes Required',
    approved: 'Approved',
    delivery_unlocked: 'Ready for Download',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  }
  return map[status] || status
}

// PUBLIC: create AI project order after form submit/payment intent.
// For production payment webhook can update payment_status to paid later.
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
      title,
      projectTitle,
      internshipProgramType,
      projectDomain,
      deliveryTemplateId,
      techStack,
      stack,
      deadline,
      features = [],
      requirements,
      documentationRequired = true,
      pptRequired = true,
      deploymentRequired = true,
      customNotes = '',
      referenceLinks = [],
      amount = 0,
      paymentStatus = 'pending',
    } = req.body

    if (!email || !(title || projectTitle) || !(internshipProgramType || deliveryTemplateId)) {
      return res.status(400).json({
        success: false,
        message: 'Student email, project title and internship program are required',
      })
    }

    let template = null
    if (deliveryTemplateId) {
      const { data } = await supabase
        .from('internship_program_templates')
        .select('*')
        .eq('id', deliveryTemplateId)
        .maybeSingle()
      template = data
    } else if (internshipProgramType) {
      const { data } = await supabase
        .from('internship_program_templates')
        .select('*')
        .eq('slug', internshipProgramType)
        .maybeSingle()
      template = data
    }

    const orderStatus = paymentStatus === 'paid' ? 'paid' : 'payment_pending'

    const { data: order, error: orderError } = await supabase
      .from('project_orders')
      .insert({
        order_number: generateOrderNumber(),
        student_name: studentName || name || '',
        student_email: email,
        student_phone: phone || '',
        college: college || '',
        branch: branch || '',
        year: year || '',
        title: title || projectTitle,
        category: template?.name || internshipProgramType || '',
        internship_program_type: template?.slug || internshipProgramType || '',
        project_domain: projectDomain || '',
        delivery_template_id: template?.id || deliveryTemplateId || null,
        tech_stack: techStack || stack || template?.slug || '',
        deadline: deadline || null,
        priority: 'normal',
        status: orderStatus,
        payment_status: paymentStatus,
        total_amount: Number(amount || 0),
        currency: 'INR',
      })
      .select()
      .single()

    if (orderError) throw orderError

    const normalizedFeatures = Array.isArray(features)
      ? features
      : String(features || requirements || '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)

    const { error: reqError } = await supabase
      .from('project_requirements')
      .insert({
        order_id: order.id,
        feature_list: normalizedFeatures,
        documentation_required: Boolean(documentationRequired),
        ppt_required: Boolean(pptRequired),
        deployment_required: Boolean(deploymentRequired),
        custom_notes: customNotes || requirements || '',
        reference_links: Array.isArray(referenceLinks) ? referenceLinks : [],
        attachments: [],
      })

    if (reqError) throw reqError

    const { error: aiError } = await supabase
      .from('ai_projects')
      .insert({
        order_id: order.id,
        generation_status: 'not_started',
        current_stage: 'waiting_for_admin',
      })

    if (aiError) throw aiError

    await supabase.from('audit_logs').insert({
      actor_type: 'student',
      action: 'AI_PROJECT_ORDER_CREATED',
      resource_type: 'project_order',
      resource_id: order.id,
      metadata: {
        email,
        internshipProgramType: template?.slug || internshipProgramType,
      },
      ip: req.ip,
    })

    res.json({
      success: true,
      message: 'AI project order created successfully',
      data: formatOrder(order),
    })
  } catch (error) {
    console.error('Create AI project order error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create AI project order',
    })
  }
})

// STUDENT: my AI project orders
router.get('/student/my-projects', studentAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const email = req.user.email

    const { data, error } = await supabase
      .from('project_orders')
      .select(`
        *,
        project_requirements (*),
        ai_projects (*)
      `)
      .eq('student_email', email)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: (data || []).map((order) => ({
        ...formatOrder(order),
        progressLabel: friendlyProgress(order.status),
      })),
    })
  } catch (error) {
    console.error('Fetch student AI projects error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI projects',
    })
  }
})

// ADMIN: all AI project orders
router.get(
  '/admin/orders',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)
      const { status, program, search } = req.query

      let query = supabase
        .from('project_orders')
        .select(`
          *,
          project_requirements (*),
          ai_projects (*)
        `)
        .order('created_at', { ascending: false })

      if (status) query = query.eq('status', status)
      if (program) query = query.eq('internship_program_type', program)

      const { data, error } = await query
      if (error) throw error

      let orders = data || []
      if (search) {
        const s = String(search).toLowerCase()
        orders = orders.filter((order) =>
          [order.order_number, order.title, order.student_email, order.student_name]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(s))
        )
      }

      res.json({
        success: true,
        data: orders.map(formatOrder),
      })
    } catch (error) {
      console.error('Admin fetch AI orders error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch AI project orders',
      })
    }
  }
)

// ADMIN: single AI project order
router.get(
  '/admin/orders/:id',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)
      const { id } = req.params

      const { data, error } = await supabase
        .from('project_orders')
        .select(`
          *,
          project_requirements (*),
          ai_projects (*)
        `)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        return res.status(404).json({ success: false, message: 'Order not found' })
      }

      res.json({
        success: true,
        data: formatOrder(data),
      })
    } catch (error) {
      console.error('Admin fetch AI order error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch AI project order',
      })
    }
  }
)

// ADMIN: dummy AI generation trigger
router.post(
  '/admin/orders/:id/generate',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)
      const { id } = req.params
      const mode = process.env.AI_GENERATION_MODE || 'dummy'

      const { data: order, error: orderError } = await supabase
        .from('project_orders')
        .select('*, project_requirements (*), ai_projects (*)')
        .eq('id', id)
        .maybeSingle()

      if (orderError) throw orderError
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

      const aiProject = order.ai_projects?.[0]
      if (!aiProject) {
        return res.status(400).json({
          success: false,
          message: 'AI project record not found',
        })
      }

      await supabase
        .from('project_orders')
        .update({
          status: mode === 'dummy' ? 'admin_review' : 'ai_queued',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      await supabase
        .from('ai_projects')
        .update({
          generation_status: mode === 'dummy' ? 'completed' : 'queued',
          architecture_status: mode === 'dummy' ? 'completed' : 'pending',
          frontend_status: mode === 'dummy' ? 'completed' : 'pending',
          backend_status: mode === 'dummy' ? 'completed' : 'pending',
          docs_status: mode === 'dummy' ? 'completed' : 'pending',
          ppt_status: mode === 'dummy' ? 'completed' : 'pending',
          qa_status: mode === 'dummy' ? 'completed' : 'pending',
          packaging_status: mode === 'dummy' ? 'completed' : 'pending',
          current_stage: mode === 'dummy' ? 'admin_review' : 'queued',
          updated_at: new Date().toISOString(),
        })
        .eq('id', aiProject.id)

      await supabase.from('ai_jobs').insert({
        project_id: aiProject.id,
        job_type: mode === 'dummy' ? 'dummy_full_generation' : 'full_generation_queued',
        provider: mode === 'dummy' ? 'dummy' : 'openai',
        model: process.env.OPENAI_MODEL || null,
        status: mode === 'dummy' ? 'completed' : 'queued',
        attempts: 1,
        started_at: new Date().toISOString(),
        completed_at: mode === 'dummy' ? new Date().toISOString() : null,
        token_usage: {},
      })

      if (mode === 'dummy') {
        const dummyContent = {
          title: order.title,
          program: order.internship_program_type,
          message: 'Dummy generation completed. Replace with OpenAI worker in next phase.',
          generatedSections: [
            'architecture',
            'source_code_placeholder',
            'readme',
            'viva_questions',
            'project_report',
            'ppt_content',
            'deployment_guide',
          ],
        }

        await supabase.from('generated_artifacts').insert({
          project_id: aiProject.id,
          artifact_type: 'dummy_delivery_manifest',
          file_name: `${order.order_number}-delivery-manifest.json`,
          storage_path: `dummy://${order.order_number}`,
          version: 1,
          checksum: Buffer.from(JSON.stringify(dummyContent)).toString('base64').slice(0, 64),
          is_final: false,
        })
      }

      await supabase.from('audit_logs').insert({
        actor_id: req.admin.id,
        actor_type: 'admin',
        action: 'AI_GENERATION_TRIGGERED',
        resource_type: 'project_order',
        resource_id: id,
        metadata: { mode },
        ip: req.ip,
      })

      res.json({
        success: true,
        message: mode === 'dummy'
          ? 'Dummy AI generation completed. Order moved to admin review.'
          : 'AI generation queued successfully.',
      })
    } catch (error) {
      console.error('Trigger AI generation error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to trigger AI generation',
      })
    }
  }
)

// ADMIN: approve delivery
router.post(
  '/admin/orders/:id/approve',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)
      const { id } = req.params
      const { notes = '' } = req.body

      const { data: order, error: orderError } = await supabase
        .from('project_orders')
        .select('*, ai_projects (*)')
        .eq('id', id)
        .maybeSingle()

      if (orderError) throw orderError
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

      const aiProject = order.ai_projects?.[0]
      if (!aiProject) return res.status(400).json({ success: false, message: 'AI project not found' })

      await supabase
        .from('project_orders')
        .update({
          status: 'delivery_unlocked',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      await supabase.from('admin_reviews').insert({
        project_id: aiProject.id,
        reviewer_id: req.admin.id,
        review_status: 'approved',
        notes,
        approved_at: new Date().toISOString(),
      })

      await supabase.from('delivery_unlocks').insert({
        project_id: aiProject.id,
        unlocked_by: req.admin.id,
        student_notified: false,
      })

      await supabase
        .from('generated_artifacts')
        .update({ is_final: true })
        .eq('project_id', aiProject.id)

      await supabase.from('audit_logs').insert({
        actor_id: req.admin.id,
        actor_type: 'admin',
        action: 'DELIVERY_APPROVED_UNLOCKED',
        resource_type: 'project_order',
        resource_id: id,
        metadata: { notes },
        ip: req.ip,
      })

      res.json({
        success: true,
        message: 'Delivery approved and unlocked successfully',
      })
    } catch (error) {
      console.error('Approve delivery error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to approve delivery',
      })
    }
  }
)

// ADMIN: reject / changes required
router.post(
  '/admin/orders/:id/reject',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)
      const { id } = req.params
      const { notes = 'Changes required' } = req.body

      const { data: order, error: orderError } = await supabase
        .from('project_orders')
        .select('*, ai_projects (*)')
        .eq('id', id)
        .maybeSingle()

      if (orderError) throw orderError
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

      const aiProject = order.ai_projects?.[0]
      if (!aiProject) return res.status(400).json({ success: false, message: 'AI project not found' })

      await supabase
        .from('project_orders')
        .update({
          status: 'changes_required',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      await supabase.from('admin_reviews').insert({
        project_id: aiProject.id,
        reviewer_id: req.admin.id,
        review_status: 'changes_required',
        notes,
      })

      await supabase.from('audit_logs').insert({
        actor_id: req.admin.id,
        actor_type: 'admin',
        action: 'DELIVERY_CHANGES_REQUIRED',
        resource_type: 'project_order',
        resource_id: id,
        metadata: { notes },
        ip: req.ip,
      })

      res.json({
        success: true,
        message: 'Order marked as changes required',
      })
    } catch (error) {
      console.error('Reject delivery error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to reject delivery',
      })
    }
  }
)

export default router
