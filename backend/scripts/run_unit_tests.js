import assert from 'assert'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const makeMockSupabase = (orderRecord = {}) => {
  const rows = {
    project_orders: [orderRecord],
    student_accounts: [],
    ai_projects: [],
  }

  const from = (table) => ({
    select: () => ({
      eq: (field, value) => ({ maybeSingle: async () => {
        const item = rows[table].find((r) => r[field] === value)
        return { data: item || null, error: null }
      } }),
    }),
    upsert: (payload, opts) => ({ select: () => ({ single: async () => ({ data: { id: 'acct-1', ...payload }, error: null }) }) }),
    update: (payload) => ({
      eq: (field, value) => ({
        select: () => ({ single: async () => ({ data: { ...payload }, error: null }) }),
      }),
      select: async () => ({ data: { ...payload }, error: null }),
    }),
    insert: async (payload) => ({ data: payload, error: null }),
    maybeSingle: async () => ({ data: rows[table][0] || null, error: null }),
    single: async () => ({ data: rows[table][0] || null, error: null }),
    eq: () => ({ select: async () => ({ data: rows[table], error: null }) }),
  })

  return { from }
}

const run = async () => {
  console.log('Running unit tests...')
  const { finalizePaidStudentOrder } = await import('../src/utils/aiStudentAccess.js')

  const order = {
    id: 'order-1',
    student_email: 'student@example.com',
    payment_status: 'pending',
    order_number: 'DW-AI-TEST-1',
    ai_projects: [],
  }

  const mockSupabase = makeMockSupabase(order)
  const transaction = { reference_id: order.id, txn_id: 'TXN123', metadata: { name: 'Student' } }

  try {
    const result = await finalizePaidStudentOrder(mockSupabase, transaction)
    assert(result, 'Result should be returned')
    assert(result.order, 'Order should be present')
    assert(result.account, 'Account should be created')
    console.log('✓ finalizePaidStudentOrder test passed')
    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err)
    process.exit(2)
  }
}

run()
