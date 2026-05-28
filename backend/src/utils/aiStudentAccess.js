import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendStudentLoginEmail } from './studentMailer.js'
import { generateFullProjectBlueprint } from './aiGenerator.js'

export const generateTemporaryPassword = () => {
  const raw = crypto.randomBytes(9).toString('base64url')
  return `DW-${raw}`
}

export const finalizePaidStudentOrder = async (supabase, transaction = {}) => {
  const referenceId = transaction.reference_id
  if (!referenceId) throw new Error('Missing AI project order reference id')

  const { data: order, error: orderError } = await supabase
    .from('project_orders')
    .select('*, project_requirements (*), ai_projects (*)')
    .eq('id', referenceId)
    .maybeSingle()

  if (orderError) throw orderError
  if (!order) throw new Error('AI project order not found')

  if (order.payment_status === 'paid') {
    return { order, alreadyFinalized: true }
  }

  const temporaryPassword = generateTemporaryPassword()
  const passwordHash = await bcrypt.hash(temporaryPassword, 10)
  const orderType = order.order_type || transaction.metadata?.orderType || 'project'

  const { data: account, error: accountError } = await supabase
    .from('student_accounts')
    .upsert(
      {
        email: order.student_email.toLowerCase(),
        name: order.student_name || transaction.metadata?.name || 'Student',
        phone: order.student_phone || transaction.metadata?.phone || null,
        password_hash: passwordHash,
        must_change_password: true,
        status: 'active',
        last_password_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select()
    .single()

  if (accountError) throw accountError

  const nextStatus = orderType === 'internship' ? 'internship_active' : 'requirements_received'

  const { data: updatedOrder, error: updateError } = await supabase
    .from('project_orders')
    .update({
      account_id: account.id,
      order_type: orderType,
      payment_status: 'paid',
      status: nextStatus,
      payment_txn_id: transaction.txn_id || null,
      payment_gateway_id: transaction.gateway_payment_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .select()
    .single()

  if (updateError) throw updateError

  if (order.ai_projects?.[0]?.id) {
    await supabase
      .from('ai_projects')
      .update({ current_stage: 'waiting_for_admin', updated_at: new Date().toISOString() })
      .eq('id', order.ai_projects[0].id)
  }

  // Ensure an ai_projects row exists for this order
  const { data: existingAI } = await supabase
    .from('ai_projects')
    .select('*')
    .eq('order_id', order.id)
    .maybeSingle()

  if (!existingAI) {
    await supabase.from('ai_projects').insert({
      order_id: order.id,
      generation_status: 'not_started',
      current_stage: 'waiting_for_admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // Optionally auto-generate AI content in background if enabled
  if (process.env.AUTO_GENERATE_AI === 'true') {
    ;(async () => {
      try {
        await supabase
          .from('ai_projects')
          .update({ generation_status: 'generating', current_stage: 'ai_generating', updated_at: new Date().toISOString() })
          .eq('order_id', order.id)

        const aiOutput = await generateFullProjectBlueprint(order, order.project_requirements?.[0] || {})

        await supabase
          .from('ai_projects')
          .update({ ai_output: aiOutput, generation_status: 'generated', current_stage: 'admin_review', updated_at: new Date().toISOString() })
          .eq('order_id', order.id)

        await supabase.from('project_orders').update({ status: 'admin_review', updated_at: new Date().toISOString() }).eq('id', order.id)
      } catch (err) {
        console.error('Auto AI generation failed for order', order.id, err)
        await supabase
          .from('ai_projects')
          .update({ generation_status: 'failed', failure_reason: err.message || String(err), updated_at: new Date().toISOString() })
          .eq('order_id', order.id)
      }
    })()
  }

  if (orderType === 'internship') {
    await supabase.from('internship_updates').insert({
      order_id: order.id,
      title: 'Welcome to your internship dashboard',
      message: 'Your internship dashboard is active. Class updates, assigned project progress and delivery assets will appear here.',
      visibility: 'student',
    })
  }

  const emailSent = await sendStudentLoginEmail({
    to: order.student_email,
    name: order.student_name,
    temporaryPassword,
    orderNumber: order.order_number,
    orderType,
  })

  await supabase.from('audit_logs').insert({
    actor_type: 'system',
    action: 'STUDENT_ACCOUNT_CREATED_AFTER_PAYMENT',
    resource_type: 'project_order',
    resource_id: order.id,
    metadata: {
      accountId: account.id,
      orderType,
      emailSent,
      txnId: transaction.txn_id || null,
    },
  })

  return { order: updatedOrder, account, temporaryPassword, emailSent, alreadyFinalized: false }
}
