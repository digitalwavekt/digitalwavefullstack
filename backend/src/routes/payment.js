import express from 'express'
import crypto from 'crypto'
import axios from 'axios'

const router = express.Router()

// In-memory store for transactions
let transactions = []

// Generate PayU hash
const generateHash = (params, salt) => {
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${salt}`
  return crypto.createHash('sha512').update(hashString).digest('hex')
}

// Verify PayU hash
const verifyHash = (params, salt) => {
  const hashString = `${salt}|${params.status}|||||||||||${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${params.key}`
  return crypto.createHash('sha512').update(hashString).digest('hex')
}

// Initiate Payment
router.post('/initiate', async (req, res) => {
  try {
    const { amount, courseId, duration, type, userId, email, name } = req.body

    const txnid = `DW${Date.now()}`
    const key = process.env.PAYU_MERCHANT_KEY
    const salt = process.env.PAYU_SALT
    const baseUrl = process.env.PAYU_BASE_URL || 'https://test.payu.in/_payment'

    const params = {
      key,
      txnid,
      amount: amount.toString(),
      productinfo: `${type === 'internship' ? 'Internship' : 'College Project'} - ${courseId}`,
      firstname: name || 'Student',
      email: email || 'student@email.com',
      phone: '9876543210',
      surl: `${process.env.FRONTEND_URL}/payment/success`,
      furl: `${process.env.FRONTEND_URL}/payment/failed`,
      curl: `${process.env.FRONTEND_URL}/payment/failed`,
    }

    const hash = generateHash(params, salt)

    // Store transaction
    transactions.push({
      id: txnid,
      userId,
      amount,
      courseId,
      duration,
      type,
      status: 'pending',
      createdAt: new Date()
    })

    // Build payment URL with params
    const paymentUrl = `${baseUrl}?${new URLSearchParams({ ...params, hash, service_provider: 'payu_paisa' }).toString()}`

    res.json({
      success: true,
      paymentUrl,
      txnid,
      params: { ...params, hash }
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    res.status(500).json({ success: false, message: 'Payment initiation failed' })
  }
})

// Payment Success Callback
router.post('/success', async (req, res) => {
  try {
    const { txnid, status, hash } = req.body

    const transaction = transactions.find(t => t.id === txnid)
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' })
    }

    // Verify hash
    const expectedHash = verifyHash({ ...req.body, key: process.env.PAYU_MERCHANT_KEY }, process.env.PAYU_SALT)

    if (hash !== expectedHash) {
      return res.status(400).json({ success: false, message: 'Invalid hash' })
    }

    transaction.status = status === 'success' ? 'completed' : 'failed'
    transaction.paymentDetails = req.body
    transaction.updatedAt = new Date()

    // Generate Google Meet credentials for internship students
    if (transaction.type === 'internship' && transaction.status === 'completed') {
      // This would be handled by the student registration logic
      console.log('Payment successful - triggering student onboarding')
    }

    res.json({ success: true, message: 'Payment processed', transaction })
  } catch (error) {
    console.error('Payment success error:', error)
    res.status(500).json({ success: false, message: 'Payment processing failed' })
  }
})

// Payment Failure Callback
router.post('/failed', async (req, res) => {
  try {
    const { txnid } = req.body

    const transaction = transactions.find(t => t.id === txnid)
    if (transaction) {
      transaction.status = 'failed'
      transaction.paymentDetails = req.body
      transaction.updatedAt = new Date()
    }

    res.json({ success: true, message: 'Payment failure recorded' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record payment failure' })
  }
})

// Get transaction status
router.get('/status/:txnid', async (req, res) => {
  try {
    const { txnid } = req.params
    const transaction = transactions.find(t => t.id === txnid)

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' })
    }

    res.json({ success: true, data: transaction })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch status' })
  }
})

// Get all transactions (admin)
router.get('/transactions', async (req, res) => {
  try {
    res.json({ success: true, data: transactions })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' })
  }
})

export default router
