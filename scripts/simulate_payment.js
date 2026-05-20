#!/usr/bin/env node
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required in backend/.env for this script to run')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

import { finalizePaidStudentOrder } from '../backend/src/utils/aiStudentAccess.js'

const txnId = process.argv[2]
if (!txnId) {
  console.error('Usage: node scripts/simulate_payment.js <TXN_ID>')
  process.exit(1)
}

;(async () => {
  try {
    const { data: tx, error: txErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('txn_id', txnId)
      .maybeSingle()

    if (txErr) throw txErr
    if (!tx) {
      console.error('Transaction not found:', txnId)
      process.exit(1)
    }

    // Update transaction to completed
    const { data: updated, error: updErr } = await supabase
      .from('transactions')
      .update({ status: 'completed', gateway_payment_id: 'SIMULATED', gateway_status: 'success', updated_at: new Date().toISOString() })
      .eq('txn_id', txnId)
      .select()
      .single()

    if (updErr) throw updErr

    console.log('Transaction marked completed:', updated.txn_id)

    const result = await finalizePaidStudentOrder(supabase, updated)
    console.log('finalizePaidStudentOrder result:', result)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
})()
