import { useEffect, useMemo, useState } from 'react'
import { Brain, CheckCircle2, Loader2, RefreshCw, Search, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../../lib/api'

const statuses = [
  '',
  'payment_pending',
  'paid',
  'admin_review',
  'changes_required',
  'delivery_unlocked',
  'delivered',
]

export default function AIProjectOrders() {
  const [orders, setOrders] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    program: '',
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [ordersRes, templatesRes] = await Promise.all([
        apiFetch('/api/ai-project-delivery/admin/orders'),
        apiFetch('/api/project-templates'),
      ])
      setOrders(ordersRes.data || [])
      setTemplates(templatesRes.data || [])
    } catch (error) {
      toast.error(error.message || 'Failed to load AI project orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = !filters.search ||
        [order.orderNumber, order.title, order.studentEmail, order.studentName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(filters.search.toLowerCase()))

      const matchesStatus = !filters.status || order.status === filters.status
      const matchesProgram = !filters.program || order.internshipProgramType === filters.program

      return matchesSearch && matchesStatus && matchesProgram
    })
  }, [orders, filters])

  const runAction = async (orderId, action, payload = {}) => {
    setActionLoading(`${orderId}-${action}`)
    try {
      const res = await apiFetch(`/api/ai-project-delivery/admin/orders/${orderId}/${action}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      toast.success(res.message || 'Action completed')
      await loadInitialData()
    } catch (error) {
      toast.error(error.message || 'Action failed')
    } finally {
      setActionLoading('')
    }
  }

  const badgeClass = (status) => {
    if (status === 'delivery_unlocked' || status === 'delivered') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
    if (status === 'admin_review') return 'bg-blue-500/10 text-blue-300 border-blue-500/20'
    if (status === 'changes_required') return 'bg-red-500/10 text-red-300 border-red-500/20'
    return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-7 h-7 text-blue-400" />
            AI Project Orders
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Program-based AI delivery workflow with admin approval.
          </p>
        </div>

        <button onClick={loadInitialData} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="glass rounded-2xl p-4 border border-white/10 mb-6 grid md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            className="input-field pl-9"
            placeholder="Search order, title, email"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <select
          className="input-field"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status ? status.replaceAll('_', ' ') : 'All Status'}
            </option>
          ))}
        </select>

        <select
          className="input-field"
          value={filters.program}
          onChange={(e) => setFilters((prev) => ({ ...prev, program: e.target.value }))}
        >
          <option value="">All Programs</option>
          {templates.map((template) => (
            <option key={template.id} value={template.slug}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass rounded-2xl p-8 border border-white/10 text-center text-gray-400">
          No AI project orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="glass rounded-2xl p-5 border border-white/10">
              <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs text-blue-300">{order.orderNumber}</span>
                    <span className={`text-xs px-3 py-1 rounded-full border ${badgeClass(order.status)}`}>
                      {order.status?.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-white">{order.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {order.studentName || 'Student'} • {order.studentEmail} • {order.studentPhone}
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    Program: <span className="text-white">{order.category || order.internshipProgramType}</span>
                  </p>

                  {order.requirements?.custom_notes && (
                    <p className="text-sm text-gray-400 mt-3 line-clamp-2">
                      {order.requirements.custom_notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runAction(order.id, 'generate')}
                    disabled={actionLoading === `${order.id}-generate`}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {actionLoading === `${order.id}-generate` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    Generate
                  </button>

                  <button
                    onClick={() => runAction(order.id, 'approve', { notes: 'Approved from admin dashboard' })}
                    disabled={actionLoading === `${order.id}-approve`}
                    className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-2"
                  >
                    {actionLoading === `${order.id}-approve` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve
                  </button>

                  <button
                    onClick={() => runAction(order.id, 'reject', { notes: 'Changes required' })}
                    disabled={actionLoading === `${order.id}-reject`}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 flex items-center gap-2"
                  >
                    {actionLoading === `${order.id}-reject` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
