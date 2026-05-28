import express from 'express'
import crypto from 'crypto'
import { randomUUID } from 'crypto'
import aiProjectDeliveryRoutes from './aiProjectDelivery.js'
import { finalizePaidStudentOrder } from '../utils/aiStudentAccess.js'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db
  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database is not configured')
  }
  return db.connection
}

const sha512 = (str) => crypto.createHash('sha512').update(str).digest('hex')

const generateOrderNumber = () => {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `DW-AI-${ymd}-${random}`
}

const getPayuConfig = () => {
  const key = process.env.PAYU_KEY || process.env.PAYU_MERCHANT_KEY
  const salt = process.env.PAYU_SALT
  const baseUrl = process.env.PAYU_BASE_URL || 'https://test.payu.in/_payment'
  const successUrl = process.env.PAYU_SUCCESS_URL
  const failureUrl = process.env.PAYU_FAILURE_URL

  if (!key || !salt || !successUrl || !failureUrl) {
    throw new Error('PayU env variables are missing')
  }

  return { key, salt, baseUrl, successUrl, failureUrl }
}

const proxyToAiDelivery = (targetUrl) => (req, res, next) => {
  const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : ''
  req.url = `${targetUrl}${query}`
  aiProjectDeliveryRoutes(req, res, next)
}

router.post('/student-orders/create-payment-order', async (req, res) => {
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
      selectedProgram,
      stack,
      techStack,
      projectRequirements,
      requirements,
      deadline,
      amount,
      deliveryTemplateId,
      internshipProgramType,
      projectDomain,
    } = req.body

    const finalEmail = String(email || '').trim().toLowerCase()
    const finalName = String(studentName || name || 'Digital Wave Student').trim()
    const finalTitle = String(title || projectTitle || selectedProgram || 'Student Project').trim()
    const normalizedOrderType = orderType === 'internship' ? 'internship' : 'project'
    const numericAmount = Number(amount || 0)

    if (!finalEmail || !finalTitle || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'email, title/projectTitle and valid amount are required',
      })
    }

    let template = null
    if (deliveryTemplateId || internshipProgramType || selectedProgram) {
      const queryValue = deliveryTemplateId || internshipProgramType || selectedProgram
      const templateQuery = supabase.from('internship_program_templates').select('*')
      const { data, error } = deliveryTemplateId
        ? await templateQuery.eq('id', queryValue).maybeSingle()
        : await templateQuery.eq('slug', queryValue).maybeSingle()
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
        student_name: finalName,
        student_email: finalEmail,
        student_phone: phone || '',
        college: college || '',
        branch: branch || '',
        year: year || '',
        title: finalTitle,
        category: template?.name || selectedProgram || internshipProgramType || stack || '',
        internship_program_type: template?.slug || internshipProgramType || selectedProgram || '',
        project_domain: projectDomain || '',
        delivery_template_id: template?.id || deliveryTemplateId || null,
        tech_stack: techStack || stack || template?.name || selectedProgram || '',
        deadline: deadline || null,
        priority: 'normal',
        status: 'payment_pending',
        payment_status: 'pending',
        total_amount: numericAmount,
        currency: 'INR',
      })
      .select()
      .single()
    if (orderError) throw orderError

    const featureList = Array.isArray(projectRequirements)
      ? projectRequirements
      : String(projectRequirements || requirements || '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)

    await supabase.from('project_requirements').insert({
      order_id: order.id,
      feature_list: featureList,
      documentation_required: true,
      ppt_required: true,
      deployment_required: true,
      custom_notes: String(projectRequirements || requirements || ''),
      reference_links: [],
      attachments: [],
    })

    await supabase.from('ai_projects').insert({
      order_id: order.id,
      generation_status: 'not_started',
      current_stage: 'payment_pending',
    })

    const { key, salt, baseUrl, successUrl, failureUrl } = getPayuConfig()
    const txnId = `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    const finalAmount = numericAmount.toFixed(2)
    const productInfo = normalizedOrderType === 'internship'
      ? `Digital Wave Internship + Project - ${order.category || finalTitle}`
      : `Digital Wave Project - ${order.category || finalTitle}`
    const finalPhone = String(phone || '9999999999').replace(/\D/g, '').slice(-10) || '9999999999'
    const paymentName = finalName.slice(0, 60) || 'Digital Wave Student'
    const hash = sha512(`${key}|${txnId}|${finalAmount}|${productInfo}|${paymentName}|${finalEmail}` + `|||||||||||${salt}`)

    await supabase.from('transactions').insert({
      txn_id: txnId,
      user_email: finalEmail,
      amount: Number(finalAmount),
      type: normalizedOrderType === 'internship' ? 'ai_internship_project' : 'ai_project_delivery',
      reference_id: order.id,
      status: 'pending',
      gateway: 'payu',
      metadata: {
        name: paymentName,
        phone: finalPhone,
        productInfo,
        orderType: normalizedOrderType,
      },
    })

    res.status(201).json({
      success: true,
      message: 'Payment order created',
      data: {
        order,
        payment: {
          txnId,
          action: baseUrl,
          payload: {
            key,
            txnid: txnId,
            amount: finalAmount,
            productinfo: productInfo,
            firstname: paymentName,
            email: finalEmail,
            phone: finalPhone,
            surl: successUrl,
            furl: failureUrl,
            hash,
          },
        },
      },
    })
  } catch (error) {
    console.error('Student create payment order error:', error)
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Failed to create payment order' : error.message,
    })
  }
})

router.post('/student-orders/payment-success', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const txnId = String(req.body.txnId || req.body.txnid || '').trim()
    if (!txnId) return res.status(400).json({ success: false, message: 'txnId is required' })

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('txn_id', txnId)
      .select()
      .single()
    if (error) throw error

    const result = await finalizePaidStudentOrder(supabase, transaction)
    res.json({ success: true, message: 'Payment success recorded', data: result })
  } catch (error) {
    console.error('Student payment success alias error:', error)
    res.status(500).json({ success: false, message: 'Failed to activate student order' })
  }
})

router.post('/student-auth/login', proxyToAiDelivery('/student/login'))
router.post('/student-auth/change-password', proxyToAiDelivery('/student/change-password'))

router.get('/student-dashboard/me', proxyToAiDelivery('/student/dashboard'))
router.get('/student-dashboard/orders', proxyToAiDelivery('/student/dashboard'))
router.get('/student-dashboard/assets', proxyToAiDelivery('/student/dashboard'))
router.get('/student-dashboard/updates', proxyToAiDelivery('/student/dashboard'))

router.post('/student-chatbot/ask', proxyToAiDelivery('/student/chatbot/ask'))

router.get('/admin/student-orders', proxyToAiDelivery('/admin/orders'))
router.patch('/admin/student-orders/:id/status', (req, res, next) =>
  proxyToAiDelivery(`/admin/orders/${req.params.id}/status`)(req, res, next)
)
router.post('/admin/student-orders/:id/assets', (req, res, next) =>
  proxyToAiDelivery(`/admin/orders/${req.params.id}/delivery-assets`)(req, res, next)
)
router.post('/admin/internship-updates', adminAuth, requirePermission('manage_projects'), proxyToAiDelivery('/admin/internship-updates'))

export default router
