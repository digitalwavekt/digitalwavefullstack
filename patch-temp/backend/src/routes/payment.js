import express from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'
import { finalizePaidStudentOrder } from '../utils/aiStudentAccess.js'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db
  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase not configured')
  }
  return db.connection
}

const sha512 = (str) => crypto.createHash('sha512').update(str).digest('hex')

const getAuthUser = (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return null
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
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

const createInternshipEnrollment = async (supabase, transaction) => {
  if (!transaction || transaction.type !== 'internship') return

  const metadata = transaction.metadata || {}

  const enrollmentPayload = {
    user_email: transaction.user_email,
    user_name: metadata.name || null,
    program_id: metadata.courseId || transaction.reference_id,
    duration_months: metadata.duration ? Number(metadata.duration) : null,
    payment_txn_id: transaction.txn_id,
    amount: transaction.amount,
    status: 'active',
    metadata,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('enrollments')
    .upsert(enrollmentPayload, {
      onConflict: 'payment_txn_id',
    })

  if (error) throw error
}

// INITIATE PAYU PAYMENT
router.post('/initiate', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const authUser = getAuthUser(req)

    const {
      amount,
      email,
      name,
      phone,
      type,
      referenceId,
      productInfo,
      courseId,
      duration,
      orderType,
    } = req.body

    const finalEmail = (email || authUser?.email || '').trim().toLowerCase()
    const finalNameFromUser = name || authUser?.name || 'Digital Wave Student'

    if (!amount || !finalEmail || !type || !referenceId) {
      return res.status(400).json({
        success: false,
        message: 'amount, email, type and referenceId are required',
      })
    }

    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      })
    }

    const { key, salt, baseUrl, successUrl, failureUrl } = getPayuConfig()

    const txnId = `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    const finalAmount = numericAmount.toFixed(2)
    const finalProductInfo = productInfo || type
    const finalName =
      String(finalNameFromUser).trim().slice(0, 60) || 'Digital Wave Student'
    const finalPhone =
      String(phone || '9999999999').replace(/\D/g, '').slice(-10) ||
      '9999999999'

    const hashString =
      `${key}|${txnId}|${finalAmount}|${finalProductInfo}|${finalName}|${finalEmail}` +
      `|||||||||||${salt}`

    const hash = sha512(hashString)

    const { error } = await supabase.from('transactions').insert({
      txn_id: txnId,
      user_email: finalEmail,
      amount: Number(finalAmount),
      type,
      reference_id: referenceId,
      status: 'pending',
      gateway: 'payu',
      metadata: {
        courseId,
        duration,
        name: finalName,
        phone: finalPhone,
        productInfo: finalProductInfo,
        orderType,
      },
    })

    if (error) throw error

    return res.json({
      success: true,
      message: 'Payment initiated',
      data: {
        txnId,
        action: baseUrl,
        payload: {
          key,
          txnid: txnId,
          amount: finalAmount,
          productinfo: finalProductInfo,
          firstname: finalName,
          email: finalEmail,
          phone: finalPhone,
          surl: successUrl,
          furl: failureUrl,
          hash,
          service_provider: 'payu_paisa',
        },
      },
    })
  } catch (error) {
    console.error('Payment initiate error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment initiation failed',
    })
  }
})

// PAYU SUCCESS CALLBACK
router.post('/success', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { key, salt } = getPayuConfig()

    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      mihpayid,
      hash,
    } = req.body

    if (!txnid) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/failure?reason=missing_txnid`
      )
    }

    const reverseHashString =
      `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`

    const calculatedHash = sha512(reverseHashString)

    const isHashValid = calculatedHash === hash
    const finalStatus = status === 'success' && isHashValid ? 'completed' : 'failed'

    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: finalStatus,
        gateway_payment_id: mihpayid || null,
        gateway_response: req.body,
        gateway_status: status || null,
        updated_at: new Date().toISOString(),
      })
      .eq('txn_id', txnid)
      .select()
      .single()

    if (error) throw error

    if (data?.type === 'college-project' && finalStatus === 'completed') {
      await supabase
        .from('college_projects')
        .update({ status: 'paid' })
        .eq('id', data.reference_id)
    }

    if (data?.type === 'internship' && finalStatus === 'completed') {
      await createInternshipEnrollment(supabase, data)
    }

    if (['ai_project_delivery', 'ai_project', 'ai_internship_project'].includes(data?.type) && finalStatus === 'completed') {
      await finalizePaidStudentOrder(supabase, data)
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/success?txnId=${txnid}&status=${finalStatus}`
    )
  } catch (error) {
    console.error('Payment success error:', error)
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failure?reason=server_error`
    )
  }
})

// PAYU FAILURE CALLBACK
router.post('/failure', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { txnid, mihpayid, status } = req.body

    if (txnid) {
      await supabase
        .from('transactions')
        .update({
          status: 'failed',
          gateway_payment_id: mihpayid || null,
          gateway_response: req.body,
          gateway_status: status || 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('txn_id', txnid)
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failure?txnId=${txnid || ''}`
    )
  } catch (error) {
    console.error('Payment failure error:', error)
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failure?reason=server_error`
    )
  }
})

// MANUAL VERIFY BY ADMIN
router.post('/verify', adminAuth, requirePermission('manage_payments'), async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { txnId, status } = req.body

    const { data, error } = await supabase
      .from('transactions')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('txn_id', txnId)
      .select()
      .single()

    if (error) throw error

    if (data.type === 'college-project' && status === 'completed') {
      await supabase
        .from('college_projects')
        .update({ status: 'paid' })
        .eq('id', data.reference_id)
    }

    if (data.type === 'internship' && status === 'completed') {
      await createInternshipEnrollment(supabase, data)
    }

    res.json({
      success: true,
      message: 'Payment verified',
      data,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
    })
  }
})

// ADMIN TRANSACTIONS
router.get('/all', adminAuth, requirePermission('manage_payments'), async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
    })
  }
})

export default router