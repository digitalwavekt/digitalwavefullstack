import { useEffect, useMemo, useState } from 'react'
import {
  GraduationCap, Briefcase, CheckCircle2, Loader2, RefreshCw,
  Search, XCircle, Clock, Zap, User, Mail, Phone, Calendar,
  ChevronDown, ChevronUp, FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../../lib/api'

const ALL_STATUSES = [
  '', 'payment_pending', 'requirements_received', 'internship_active',
  'ai_queued', 'ai_generating', 'admin_review', 'changes_required',
  'delivery_unlocked', 'delivered', 'cancelled',
]

const STATUS_LABELS = {
  payment_pending: 'Payment Pending',
  requirements_received: 'Requirements Received',
  internship_active: 'Internship Active',
  ai_queued: 'AI Queued',
  ai_generating: 'AI Generating',
  admin_review: 'Admin Review',
  changes_required: 'Changes Required',
  approved: 'Approved',
  delivery_unlocked: 'Ready for Download',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_COLORS = {
  payment_pending: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  requirements_received: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  internship_active: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  ai_queued: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  ai_generating: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  admin_review: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  changes_required: 'bg-red-500/10 text-red-300 border-red-500/20',
  approved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  delivery_unlocked: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  delivered: 'bg-green-500/10 text-green-300 border-green-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const TYPE_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'project', label: 'Project Only (7-day)' },
  { id: 'internship', label: 'Internship + Project' },
]

export default function AIProjectOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [filters, setFilters] = useState({ search: '', status: '', type: 'all' })

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/ai-project-delivery/admin/orders')
      setOrders(res.data || [])
    } catch (error) {
      toast.error(error.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch = !filters.search ||
        [order.orderNumber, order.title, order.studentEmail, order.studentName]
          .filter(Boolean).some(v => String(v).toLowerCase().includes(filters.search.toLowerCase()))
      const matchStatus = !filters.status || order.status === filters.status
      const matchType = filters.type === 'all' || order.orderType === filters.type
      return matchSearch && matchStatus && matchType
    })
  }, [orders, filters])

  const updateStatus = async (orderId, newStatus, notes = '') => {
    setActionLoading(`${orderId}-${newStatus}`)
    try {
      await apiFetch(`/api/ai-project-delivery/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, adminNotes: notes }),
      })
      toast.success(`Status → ${STATUS_LABELS[newStatus] || newStatus}`)
      await loadOrders()
    } catch (error) {
      toast.error(error.message || 'Update failed')
    } finally {
      setActionLoading('')
    }
  }

  const getDeadlineInfo = (order) => {
    if (order.orderType === 'project' || order.orderType === 'project_only') {
      const created = new Date(order.createdAt)
      const deadline = order.deadline ? new Date(order.deadline) : new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000)
      const now = new Date()
      const daysLeft = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)))
      const overdue = now > deadline
      return { label: '7-Day Project', daysLeft, overdue, date: deadline.toLocaleDateString('en-IN') }
    }
    return null
  }

  // Stats
  const stats = {
    total: orders.length,
    projectOnly: orders.filter(o => o.orderType === 'project').length,
    internship: orders.filter(o => o.orderType === 'internship').length,
    pending: orders.filter(o => ['payment_pending', 'requirements_received', 'admin_review'].includes(o.status)).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-400" /> Student Orders
          </h1>
          <p className="text-gray-400 text-sm mt-1">All project & internship enrollments in one place.</p>
        </div>
        <button onClick={loadOrders} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-sm disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: FileText, color: 'from-blue-500 to-purple-500' },
          { label: 'Project Only', value: stats.projectOnly, icon: Briefcase, color: 'from-orange-500 to-amber-500' },
          { label: 'Internship', value: stats.internship, icon: GraduationCap, color: 'from-green-500 to-emerald-500' },
          { label: 'Needs Action', value: stats.pending, icon: Clock, color: 'from-red-500 to-pink-500' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass rounded-2xl p-4 border border-white/5">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_TABS.map((tab) => (
          <button key={tab.id} onClick={() => setFilters(f => ({ ...f, type: tab.id }))}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filters.type === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            placeholder="Search order, name, email..." value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))} />
        </div>
        <select className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
          value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-[#0d0d1a]">{s ? STATUS_LABELS[s] || s : 'All Status'}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass rounded-2xl p-8 border border-white/10 text-center text-gray-400">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const expanded = expandedId === order.id
            const deadlineInfo = getDeadlineInfo(order)
            const isProject = order.orderType === 'project'
            return (
              <div key={order.id} className="glass rounded-2xl border border-white/5 overflow-hidden">
                {/* Header Row */}
                <div className="p-5 cursor-pointer" onClick={() => setExpandedId(expanded ? null : order.id)}>
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 font-mono">{order.orderNumber}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                          isProject ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {isProject ? '📦 Project Only' : '🎓 Internship'}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold truncate">{order.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{order.studentName}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{order.studentEmail}</span>
                        {order.studentPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.studentPhone}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {deadlineInfo && (
                        <div className={`text-xs font-medium px-3 py-1.5 rounded-lg ${deadlineInfo.overdue ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                          {deadlineInfo.overdue ? '⚠ Overdue' : `${deadlineInfo.daysLeft}d left`}
                        </div>
                      )}
                      <span className="text-white font-bold">₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                      {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-white/5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 pt-4">
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-sm text-white font-medium">{order.category || order.techStack || '-'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-xs text-gray-500">College</p>
                        <p className="text-sm text-white font-medium">{order.college || '-'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-xs text-gray-500">Branch / Year</p>
                        <p className="text-sm text-white font-medium">{order.branch || '-'} / {order.year || '-'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm text-white font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>

                    {order.requirements?.custom_notes && (
                      <div className="p-3 rounded-xl bg-white/5 mb-4">
                        <p className="text-xs text-gray-500 mb-1">Requirements</p>
                        <p className="text-sm text-gray-300">{order.requirements.custom_notes}</p>
                      </div>
                    )}

                    {/* Status Actions */}
                    <div className="flex flex-wrap gap-2">
                      {['requirements_received', 'ai_queued', 'admin_review', 'delivery_unlocked', 'delivered'].map((status) => {
                        const isActive = order.status === status
                        const isLoading = actionLoading === `${order.id}-${status}`
                        return (
                          <button key={status} disabled={isActive || !!actionLoading}
                            onClick={() => updateStatus(order.id, status)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${
                              isActive ? STATUS_COLORS[status] : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                            }`}>
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                            {STATUS_LABELS[status]}
                          </button>
                        )
                      })}
                      <button disabled={order.status === 'cancelled' || !!actionLoading}
                        onClick={() => updateStatus(order.id, 'cancelled', 'Cancelled by admin')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40">
                        <XCircle className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
