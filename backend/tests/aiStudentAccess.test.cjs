async function makeMockSupabase(orderRecord = {}) {
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
    upsert: async (payload, opts) => ({ data: { id: 'acct-1', ...payload }, error: null }),
    update: async (payload) => ({ data: { ...payload }, error: null }),
    insert: async (payload) => ({ data: payload, error: null }),
    maybeSingle: async () => ({ data: rows[table][0] || null, error: null }),
    single: async () => ({ data: rows[table][0] || null, error: null }),
    eq: () => ({ select: async () => ({ data: rows[table], error: null }) }),
  })

  return { from }
}

test('finalizePaidStudentOrder updates order and creates account', async () => {
  const { finalizePaidStudentOrder } = await import('../src/utils/aiStudentAccess.js')

  const order = {
    id: 'order-1',
    student_email: 'student@example.com',
    payment_status: 'pending',
    order_number: 'DW-AI-TEST-1',
    ai_projects: [],
  }

  const mockSupabase = await makeMockSupabase(order)
  const transaction = { reference_id: order.id, txn_id: 'TXN123', metadata: { name: 'Student' } }

  const result = await finalizePaidStudentOrder(mockSupabase, transaction)
  expect(result).toBeDefined()
  expect(result.order).toBeDefined()
  expect(result.account).toBeDefined()
})
