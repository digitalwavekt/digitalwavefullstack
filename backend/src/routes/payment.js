import express from 'express'
import crypto from 'crypto'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db
  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase not configured')
  }
  return db.connection
}

// 🔹 INITIATE PAYMENT
router.post('/initiate', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { amount, email, type, referenceId } = req.body

    const txnId = `TXN_${Date.now()}`

    const { error } = await supabase.from('transactions').insert({
      txn_id: txnId,
      user_email: email,
      amount: Number(amount),
      type,
      reference_id: referenceId,
      status: 'pending'
    })

    if (error) throw error

    // 👉 PayU integration yaha lagega later
    res.json({
      success: true,
      txnId,
      message: 'Payment initiated'
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Payment failed' })
  }
})


// 🔹 VERIFY PAYMENT (Simulated)
router.post('/verify', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { txnId, status } = req.body

    const { data, error } = await supabase
      .from('transactions')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('txn_id', txnId)
      .select()
      .single()

    if (error) throw error

    // 🔥 LINK WITH PROJECT
    if (data.type === 'college-project' && status === 'completed') {
      await supabase
        .from('college_projects')
        .update({ status: 'paid' })
        .eq('id', data.reference_id)
    }

    res.json({
      success: true,
      message: 'Payment verified',
      data
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})


// 🔹 GET ALL TRANSACTIONS (ADMIN)
router.get('/all', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data })

  } catch (error) {
    res.status(500).json({ success: false })
  }
})

export default router