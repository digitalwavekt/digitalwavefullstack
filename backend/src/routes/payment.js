import express from 'express'
import crypto from 'crypto'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db
  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase not configured')
  }
  return db.connection
}

const sha512 = (str) => crypto.createHash('sha512').update(str).digest('hex')

const getPayuConfig = () => {
  const key = process.env.PAYU_KEY
  const salt = process.env.PAYU_SALT
  const baseUrl = process.env.PAYU_BASE_URL || 'https://test.payu.in/_payment'
  const successUrl = process.env.PAYU_SUCCESS_URL
  const failureUrl = process.env.PAYU_FAILURE_URL

  if (!key || !salt || !successUrl || !failureUrl) {
    throw new Error('PayU env variables are missing')
  }

  return { key, salt, baseUrl, successUrl, failureUrl }
}

// INITIATE PAYU PAYMENT
router.post('/initiate', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { amount, email, name, phone, type, referenceId, productInfo } = req.body

    if (!amount || !email || !type || !referenceId) {
      return res.status(400).json({
        success: false,
        message: 'amount, email, type and referenceId are required',
      })
    }

    const { key, salt, baseUrl, successUrl, failureUrl } = getPayuConfig()

    const txnId = `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    const finalAmount = Number(amount).toFixed(2)
    const finalProductInfo = productInfo || type
    const finalName = name || 'Digital Wave Student'
    const finalPhone = phone || '9999999999'

    const hashString =
      `${key}|${txnId}|${finalAmount}|${finalProductInfo}|${finalName}|${email}` +
      `|||||||||||${salt}`

    const hash = sha512(hashString)

    const { error } = await supabase.from('transactions').insert({
      txn_id: txnId,
      user_email: email,
      amount: Number(finalAmount),
      type,
      reference_id: referenceId,
      status: 'pending',
    })

    if (error) throw error

    return res.json({
      success: true,
      message: 'Payment initiated',
      data: {
        action: baseUrl,
        payload: {
          key,
          txnid: txnId,
          amount: finalAmount,
          productinfo: finalProductInfo,
          firstname: finalName,
          email,
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
    const { salt } = getPayuConfig()

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
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?reason=missing_txnid`)
    }

    const reverseHashString =
      `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.PAYU_KEY}`

    const calculatedHash = sha512(reverseHashString)

    const isHashValid = calculatedHash === hash
    const finalStatus = status === 'success' && isHashValid ? 'completed' : 'failed'

    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: finalStatus,
        gateway_payment_id: mihpayid || null,
        gateway_response: req.body,
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

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/success?txnId=${txnid}&status=${finalStatus}`
    )
  } catch (error) {
    console.error('Payment success error:', error)
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?reason=server_error`)
  }
})

// PAYU FAILURE CALLBACK
router.post('/failure', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { txnid, mihpayid } = req.body

    if (txnid) {
      await supabase
        .from('transactions')
        .update({
          status: 'failed',
          gateway_payment_id: mihpayid || null,
          gateway_response: req.body,
          updated_at: new Date().toISOString(),
        })
        .eq('txn_id', txnid)
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/failure?txnId=${txnid || ''}`
    )
  } catch (error) {
    console.error('Payment failure error:', error)
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?reason=server_error`)
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

    res.json({
      success: true,
      message: 'Payment verified',
      data,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Payment verification failed' })
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
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' })
  }
})

export default router