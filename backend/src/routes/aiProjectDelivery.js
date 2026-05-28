import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { randomUUID } from 'crypto'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'
import { generateFullProjectBlueprint, generateStudentChatbotResponse } from '../utils/aiGenerator.js'
import { generateTemporaryPassword } from '../utils/aiStudentAccess.js'
import { sendStudentLoginEmail } from '../utils/studentMailer.js'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db
  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database is not configured')
  }
  return db.connection
}

const generateOrderNumber = () => {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `DW-AI-${ymd}-${random}`
}

const friendlyProgress = (status) => {
  const map = {
    payment_pending: 'Payment Pending',
    requirements_received: 'Requirements Received',
    internship_active: 'Internship Active',
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

const safeArray = (value) => (Array.isArray(value) ? value : [])
const getFirstOrNull = (value) => (Array.isArray(value) ? value[0] || null : value || null)
const isValidUrl = (value) => {
  try {
    if (!value) return false
    new URL(String(value))
    return true
  } catch {
    return false
  }
}

const formatOrder = (order) => {
  const aiProject = getFirstOrNull(order.ai_projects)
  const deliveryAssets = getFirstOrNull(order.project_delivery_assets)
  const messages = safeArray(order.project_messages)

  return {
    id: order.id,
    orderNumber: order.order_number,
    accountId: order.account_id,
    orderType: order.order_type || 'project',
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
    paymentStatus: order.payment_status,
    paymentTxnId: order.payment_txn_id,
    totalAmount: order.total_amount,
    currency: order.currency,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    adminNotes: order.admin_notes || null,
    requirements: order.project_requirements?.[0] || null,
    aiProject: aiProject
      ? {
          id: aiProject.id,
          generationStatus: aiProject.generation_status,
          currentStage: aiProject.current_stage,
          failureReason: aiProject.failure_reason,
          aiOutput: aiProject.ai_output || null,
          adminReviewNotes: aiProject.admin_review_notes || null,
          isApproved: aiProject.is_approved || false,
          approvedAt: aiProject.approved_at,
          deliveredAt: aiProject.delivered_at,
        }
      : null,
    deliveryAssets: deliveryAssets
      ? {
          githubRepoUrl: deliveryAssets.github_repo_url,
          zipFileUrl: deliveryAssets.zip_file_url,
          documentationUrl: deliveryAssets.documentation_url,
          pptUrl: deliveryAssets.ppt_url,
          installationVideoUrl: deliveryAssets.installation_video_url,
          deploymentGuideUrl: deliveryAssets.deployment_guide_url,
          liveDemoUrl: deliveryAssets.live_demo_url,
          demoCredentials: deliveryAssets.demo_credentials,
          adminNotes: deliveryAssets.admin_notes,
          isApproved: deliveryAssets.is_approved,
          approvedAt: deliveryAssets.approved_at,
          deliveredAt: deliveryAssets.delivered_at,
        }
      : null,
    messages: messages.map((message) => ({
      id: message.id,
      senderType: message.sender_type,
      senderName: message.sender_name,
      message: message.message,
      isInternal: message.is_internal,
      createdAt: message.created_at,
    })),
  }
}

const studentAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.type !== 'student') {
      return res.status(403).json({ success: false, message: 'Student token required' })
    }

    const supabase = getSupabase(req)
    const { data: account, error } = await supabase
      .from('student_accounts')
      .select('id,email,name,phone,status,must_change_password')
      .eq('id', decoded.id)
      .maybeSingle()

    if (error || !account || account.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Student account not active' })
    }

    req.student = account
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'AI Project Delivery module working' })
})

// PUBLIC: create unpaid draft order. Frontend must initiate payment after this.
const createDraftHandler = async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const {
      orderType = 'project',
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
    } = req.body

    const finalEmail = String(email || '').trim().toLowerCase()
    const finalTitle = title || projectTitle
    const normalizedOrderType = orderType === 'internship' ? 'internship' : 'project'

    if (!finalEmail || !finalTitle || !(internshipProgramType || deliveryTemplateId)) {
      return res.status(400).json({
        success: false,
        message: 'Student email, project title and selected program are required',
      })
    }

    let template = null
    if (deliveryTemplateId) {
      const { data, error } = await supabase
        .from('internship_program_templates')
        .select('*')
        .eq('id', deliveryTemplateId)
        .maybeSingle()
      if (error) throw error
      template = data
    } else if (internshipProgramType) {
      const { data, error } = await supabase
        .from('internship_program_templates')
        .select('*')
        .eq('slug', internshipProgramType)
        .maybeSingle()
      if (error) throw error
      template = data
    }

    const { data: order, error: orderError } = await supabase
      .from('project_orders')
      .insert({
        user_id: randomUUID(),
        account_id: null,
        order_type: normalizedOrderType,
        order_number: generateOrderNumber(),
        student_name: studentName || name || '',
        student_email: finalEmail,
        student_phone: phone || '',
        college: college || '',
        branch: branch || '',
        year: year || '',
        title: finalTitle,
        category: template?.name || internshipProgramType || '',
        internship_program_type: template?.slug || internshipProgramType || '',
        project_domain: projectDomain || '',
        delivery_template_id: template?.id || deliveryTemplateId || null,
        tech_stack: techStack || stack || template?.slug || '',
        deadline: deadline || null,
        priority: 'normal',
        status: 'payment_pending',
        payment_status: 'pending',
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

    const { error: reqError } = await supabase.from('project_requirements').insert({
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

    const { error: aiError } = await supabase.from('ai_projects').insert({
      order_id: order.id,
      generation_status: 'not_started',
      current_stage: 'payment_pending',
    })
    if (aiError) throw aiError

    await supabase.from('audit_logs').insert({
      actor_type: 'student',
      action: 'AI_PROJECT_PAYMENT_DRAFT_CREATED',
      resource_type: 'project_order',
      resource_id: order.id,
      metadata: { email: finalEmail, orderType: normalizedOrderType },
      ip: req.ip,
    })

    res.status(201).json({
      success: true,
      message: 'Draft created. Continue to payment.',
      data: formatOrder(order),
    })
  } catch (error) {
    console.error('Create AI draft error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Failed to create draft order' : error.message,
    })
  }
}

router.post('/create-draft', createDraftHandler)

// Backward compatibility: old frontend /submit now creates payment-pending draft only.
router.post('/submit', createDraftHandler)

router.post('/student/login', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const { data: account, error } = await supabase
      .from('student_accounts')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error || !account || account.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Invalid student login' })
    }

    const valid = await bcrypt.compare(password, account.password_hash)
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid student login' })
    }

    const token = jwt.sign(
      { id: account.id, email: account.email, type: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    await supabase
      .from('student_accounts')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', account.id)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        student: {
          id: account.id,
          name: account.name,
          email: account.email,
          mustChangePassword: account.must_change_password,
        },
      },
    })
  } catch (error) {
    console.error('Student login error:', error)
    res.status(500).json({ success: false, message: 'Student login failed' })
  }
})

router.post('/student/change-password', studentAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword || String(newPassword).length < 8) {
      return res.status(400).json({ success: false, message: 'Old password and 8+ character new password are required' })
    }

    const { data: account, error } = await supabase
      .from('student_accounts')
      .select('*')
      .eq('id', req.student.id)
      .maybeSingle()
    if (error || !account) throw new Error('Account not found')

    const valid = await bcrypt.compare(oldPassword, account.password_hash)
    if (!valid) return res.status(401).json({ success: false, message: 'Old password is incorrect' })

    const hash = await bcrypt.hash(String(newPassword), 10)
    await supabase
      .from('student_accounts')
      .update({ password_hash: hash, must_change_password: false, updated_at: new Date().toISOString() })
      .eq('id', req.student.id)

    res.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    console.error('Student password change error:', error)
    res.status(500).json({ success: false, message: 'Password change failed' })
  }
})

router.get('/student/dashboard', studentAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { data: orders, error } = await supabase
      .from('project_orders')
      .select('*, project_requirements (*), ai_projects (*)')
      .eq('account_id', req.student.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const orderIds = (orders || []).map((o) => o.id).filter(Boolean)
    let updates = []
    let assets = []
    let messages = []

    if (orderIds.length) {
      const [{ data: updatesData }, { data: assetsData }, { data: messagesData }] = await Promise.all([
        supabase.from('internship_updates').select('*').in('order_id', orderIds).order('created_at', { ascending: false }),
        supabase.from('project_delivery_assets').select('*').in('order_id', orderIds),
        supabase.from('project_messages').select('*').in('order_id', orderIds).eq('is_internal', false),
      ])
      updates = updatesData || []
      assets = assetsData || []
      messages = messagesData || []
    }

    const assetMap = assets.reduce((acc, item) => {
      acc[item.order_id] = item
      return acc
    }, {})
    const messageMap = messages.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = []
      acc[item.order_id].push(item)
      return acc
    }, {})

    res.json({
      success: true,
      data: {
        student: req.student,
        orders: (orders || []).map((order) => {
          const formatted = formatOrder({
            ...order,
            project_delivery_assets: assetMap[order.id] ? [assetMap[order.id]] : [],
            project_messages: messageMap[order.id] || [],
          })
          return {
            ...formatted,
            progressLabel: friendlyProgress(order.status),
          }
        }),
        internshipUpdates: updates,
      },
    })
  } catch (error) {
    console.error('Student dashboard error:', error)
    res.status(500).json({ success: false, message: 'Failed to load dashboard' })
  }
})

router.post('/student/chatbot/ask', studentAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { orderId, message } = req.body
    const cleanMessage = String(message || '').trim()
    if (!orderId || !cleanMessage) {
      return res.status(400).json({ success: false, message: 'Order id and message are required' })
    }

    const { data: order, error } = await supabase
      .from('project_orders')
      .select('*, project_requirements (*), ai_projects (*)')
      .eq('id', orderId)
      .eq('account_id', req.student.id)
      .maybeSingle()
    if (error) throw error
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    const [{ data: assets }, { data: updates }] = await Promise.all([
      supabase.from('project_delivery_assets').select('*').eq('order_id', orderId).maybeSingle(),
      supabase.from('internship_updates').select('*').eq('order_id', orderId).order('created_at', { ascending: false }).limit(10),
    ])

    const blocked = /(politics|movie|cricket|weather|stock|crypto|hack|other student|admin password|password of|secret|private key)/i.test(cleanMessage)
    const aiReply = blocked
      ? { answer: `Hi ${req.student.name || 'Student'}, I can only help you with your purchased ${order.order_type === 'internship' ? 'internship and assigned project' : 'project'} details.` }
      : await generateStudentChatbotResponse(order, cleanMessage, { assets: assets || {}, updates: updates || [] })
    const answer = aiReply.answer || `Hi ${req.student.name || 'Student'}, your ${order.title} is currently at: ${friendlyProgress(order.status)}.`

    let sessionId = null
    const { data: session } = await supabase
      .from('chatbot_sessions')
      .insert({
        user_id: req.student.id,
        student_email: req.student.email,
        project_id: order.ai_projects?.[0]?.id || null,
        session_title: order.title,
      })
      .select()
      .single()
    sessionId = session?.id || null

    if (sessionId) {
      await supabase.from('chatbot_messages').insert([
        { session_id: sessionId, role: 'user', message: cleanMessage },
        { session_id: sessionId, role: 'assistant', message: answer },
      ])
    }

    res.json({ success: true, data: { answer } })
  } catch (error) {
    console.error('Student chatbot error:', error)
    res.status(500).json({ success: false, message: 'Chatbot failed' })
  }
})

router.get('/student/order-lookup', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const email = String(req.query.email || '').trim().toLowerCase()
    const orderId = String(req.query.orderId || '').trim()

    if (!email || !orderId) {
      return res.status(400).json({ success: false, message: 'Student email and order id are required' })
    }

    const { data, error } = await supabase
      .from('project_orders')
      .select('*, project_requirements (*), ai_projects (*)')
      .eq('id', orderId)
      .ilike('student_email', email)
      .maybeSingle()

    if (error) throw error
    res.json({
      success: true,
      data: data ? [{ ...formatOrder(data), progressLabel: friendlyProgress(data.status) }] : [],
    })
  } catch (error) {
    console.error('Lookup AI project order error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch AI project order' })
  }
})

// PUBLIC: resend temporary login password/email after purchase (requires txnId + email)
router.post('/student/resend-login', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { txnId, email } = req.body
    if (!txnId || !email) return res.status(400).json({ success: false, message: 'txnId and email are required' })

    const { data: tx, error: txErr } = await supabase.from('transactions').select('*').eq('txn_id', String(txnId).trim()).maybeSingle()
    if (txErr) throw txErr
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' })

    if ((String(tx.user_email || '').toLowerCase()) !== String(email).toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Email does not match transaction' })
    }

    const orderId = tx.reference_id
    const { data: order } = await supabase.from('project_orders').select('id,order_number,student_email,student_name').eq('id', orderId).maybeSingle()
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    // create or update student account with a new temporary password
    const temporaryPassword = generateTemporaryPassword()
    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(temporaryPassword, 10)

    const { data: account, error: accErr } = await supabase
      .from('student_accounts')
      .upsert({
        email: order.student_email.toLowerCase(),
        name: order.student_name || null,
        password_hash: passwordHash,
        must_change_password: true,
        status: 'active',
        last_password_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' })
      .select()
      .single()
    if (accErr) throw accErr

    const emailSent = await sendStudentLoginEmail({ to: order.student_email, name: order.student_name, temporaryPassword, orderNumber: order.order_number, orderType: tx.metadata?.orderType })

    await supabase.from('audit_logs').insert({
      actor_type: 'system', action: 'STUDENT_LOGIN_RESEND', resource_type: 'project_order', resource_id: order.id, metadata: { txnId: txnId, accountId: account?.id || null, emailSent }
    })

    res.json({ success: true, message: 'Temporary password resent' })
  } catch (error) {
    console.error('Resend login error:', error)
    res.status(500).json({ success: false, message: 'Failed to resend login' })
  }
})

router.get('/admin/orders', adminAuth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { status, program, search } = req.query
    let query = supabase
      .from('project_orders')
      .select('*, project_requirements (*), ai_projects (*)')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (program) query = query.eq('internship_program_type', program)

    const { data, error } = await query
    if (error) throw error

    let orders = data || []
    const orderIds = orders.map((order) => order.id).filter(Boolean)
    let assets = []
    let messages = []
    if (orderIds.length) {
      const [{ data: assetsData }, { data: messagesData }] = await Promise.all([
        supabase.from('project_delivery_assets').select('*').in('order_id', orderIds),
        supabase.from('project_messages').select('*').in('order_id', orderIds),
      ])
      assets = assetsData || []
      messages = messagesData || []
    }

    const assetMap = assets.reduce((acc, item) => {
      acc[item.order_id] = item
      return acc
    }, {})
    const messageMap = messages.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = []
      acc[item.order_id].push(item)
      return acc
    }, {})

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
      data: orders.map((order) => {
        return formatOrder({
          ...order,
          project_delivery_assets: assetMap[order.id] ? [assetMap[order.id]] : [],
          project_messages: messageMap[order.id] || [],
        })
      }),
    })
  } catch (error) {
    console.error('Admin fetch AI orders error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch AI project orders' })
  }
})

router.patch('/admin/orders/:id/status', adminAuth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { id } = req.params
    const allowed = ['requirements_received', 'internship_active', 'ai_queued', 'ai_generating', 'admin_review', 'changes_required', 'delivery_unlocked', 'delivered', 'cancelled']
    const { status, adminNotes } = req.body
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' })

    const { data, error } = await supabase
      .from('project_orders')
      .update({ status, admin_notes: adminNotes || null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    res.json({ success: true, message: 'Status updated', data: formatOrder(data) })
  } catch (error) {
    console.error('Admin update order status error:', error)
    res.status(500).json({ success: false, message: 'Status update failed' })
  }
})

router.get('/admin/orders/:id', adminAuth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { id } = req.params
    const { data: order, error } = await supabase
      .from('project_orders')
      .select('*, project_requirements (*), ai_projects (*), project_delivery_assets (*), project_messages (*)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    res.json({ success: true, data: formatOrder(order) })
  } catch (error) {
    console.error('Admin fetch order detail error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch order details' })
  }
})

router.post('/admin/orders/:id/generate-ai', adminAuth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { id } = req.params
    const { data: order, error } = await supabase
      .from('project_orders')
      .select('*, project_requirements (*)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    const aiOutput = await generateFullProjectBlueprint(order, order.project_requirements?.[0] || {})
    const { data: updatedAI, error: aiError } = await supabase
      .from('ai_projects')
      .update({
        ai_output: aiOutput,
        generation_status: 'generated',
        current_stage: 'admin_review',
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', id)
      .select()
      .single()
    if (aiError) throw aiError

    await supabase.from('project_orders').update({ status: 'admin_review', updated_at: new Date().toISOString() }).eq('id', id)

    res.json({ success: true, message: 'AI content generated', data: updatedAI })
  } catch (error) {
    console.error('Admin generate AI error:', error)
    res.status(500).json({ success: false, message: 'AI generation failed', error: error.message })
  }
})

router.put('/admin/orders/:id/ai-output', adminAuth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { id } = req.params
    const { aiOutput } = req.body
    if (!aiOutput || typeof aiOutput !== 'object') {
      return res.status(400).json({ success: false, message: 'aiOutput object is required' })
    }

    const { data, error } = await supabase
      .from('ai_projects')
      .update({
        ai_output: aiOutput,
        generation_status: 'generated',
        current_stage: 'admin_review',
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', id)
      .select()
      .single()
    if (error) throw error

    res.json({ success: true, message: 'AI content saved', data })
  } catch (error) {
    console.error('Admin save AI output error:', error)
    res.status(500).json({ success: false, message: 'Failed to save AI output' })
  }
})

router.post('/admin/orders/:id/delivery-assets', adminAuth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { id } = req.params
    const payload = {
      order_id: id,
      github_repo_url: String(req.body.githubRepoUrl || '').trim() || null,
      zip_file_url: String(req.body.zipFileUrl || '').trim() || null,
      documentation_url: String(req.body.documentationUrl || '').trim() || null,
      ppt_url: String(req.body.pptUrl || '').trim() || null,
      installation_video_url: String(req.body.installationVideoUrl || '').trim() || null,
      deployment_guide_url: String(req.body.deploymentGuideUrl || '').trim() || null,
      live_demo_url: String(req.body.liveDemoUrl || '').trim() || null,
      demo_credentials: String(req.body.demoCredentials || '').trim() || null,
      admin_notes: String(req.body.adminNotes || '').trim() || null,
      updated_at: new Date().toISOString(),
    }

    const invalidUrl = [payload.github_repo_url, payload.zip_file_url, payload.documentation_url, payload.ppt_url, payload.installation_video_url, payload.deployment_guide_url, payload.live_demo_url].find(
      (value) => value && !isValidUrl(value)
    )
    if (invalidUrl) {
      return res.status(400).json({ success: false, message: 'One or more delivery asset links are invalid URLs' })
    }

    const { data, error } = await supabase
      .from('project_delivery_assets')
      .upsert({ ...payload, created_at: new Date().toISOString() }, { onConflict: 'order_id' })
      .select()
      .single()
    if (error) throw error

    res.json({ success: true, message: 'Delivery assets saved', data })
  } catch (error) {
    console.error('Admin save delivery assets error:', error)
    res.status(500).json({ success: false, message: 'Failed to save delivery assets' })
  }
})

router.post('/admin/orders/:id/messages', adminAuth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { id } = req.params
    const { senderType = 'admin', senderName = 'Admin', message, isInternal = true } = req.body

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message text is required' })
    }

    const { data: order } = await supabase.from('project_orders').select('id, ai_projects (id)').eq('id', id).maybeSingle()
    const projectId = order?.ai_projects?.[0]?.id || null

    const { data, error } = await supabase
      .from('project_messages')
      .insert({ order_id: id, project_id: projectId, sender_type: senderType, sender_name: senderName, message, is_internal: Boolean(isInternal) })
      .select()
      .single()
    if (error) throw error

    res.status(201).json({ success: true, message: 'Message added', data })
  } catch (error) {
    console.error('Admin create message error:', error)
    res.status(500).json({ success: false, message: 'Failed to add message' })
  }
})

router.get('/admin/orders/:id/messages', adminAuth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { id } = req.params
    const { data, error } = await supabase.from('project_messages').select('*').eq('order_id', id).order('created_at', { ascending: true })
    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    console.error('Admin fetch messages error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch messages' })
  }
})

router.get('/student/orders/:id', studentAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { id } = req.params
    const { data: order, error } = await supabase
      .from('project_orders')
      .select('*, project_requirements (*), ai_projects (*)')
      .eq('id', id)
      .eq('account_id', req.student.id)
      .maybeSingle()
    if (error) throw error
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    const [{ data: assets }, { data: messages }] = await Promise.all([
      supabase.from('project_delivery_assets').select('*').eq('order_id', id).maybeSingle(),
      supabase.from('project_messages').select('*').eq('order_id', id).eq('is_internal', false),
    ])

    res.json({
      success: true,
      data: formatOrder({
        ...order,
        project_delivery_assets: assets ? [assets] : [],
        project_messages: messages || [],
      }),
    })
  } catch (error) {
    console.error('Student fetch order detail error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch order details' })
  }
})

router.post('/admin/internship-updates', adminAuth, requirePermission('manage_projects'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { orderId, title, message, visibility = 'student' } = req.body
    if (!orderId || !title || !message) {
      return res.status(400).json({ success: false, message: 'orderId, title and message are required' })
    }

    const { data, error } = await supabase
      .from('internship_updates')
      .insert({ order_id: orderId, title, message, visibility })
      .select()
      .single()
    if (error) throw error

    res.status(201).json({ success: true, message: 'Internship update added', data })
  } catch (error) {
    console.error('Create internship update error:', error)
    res.status(500).json({ success: false, message: 'Failed to add internship update' })
  }
})

router.post('/admin/orders/:id/approve', adminAuth, requirePermission('manage_projects'), async (req, res) => {
  req.body.status = 'delivery_unlocked'
  req.url = `/admin/orders/${req.params.id}/status`
  req.method = 'PATCH'
  router.handle(req, res)
})

export default router
