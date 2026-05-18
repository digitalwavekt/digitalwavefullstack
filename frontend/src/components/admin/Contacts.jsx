import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  Tag,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../../lib/api'

const STATUS_CONFIG = {
  new: {
    label: 'New',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    dot: 'bg-yellow-400',
    icon: MessageSquare,
  },
  resolved: {
    label: 'Resolved',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    dot: 'bg-green-400',
    icon: CheckCircle2,
  },
  spam: {
    label: 'Spam',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    dot: 'bg-red-400',
    icon: XCircle,
  },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  )
}

function ContactDetailModal({ contact, onClose, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(contact.status || 'new')

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      await apiFetch(`/api/contact/${contact.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      })
      setCurrentStatus(newStatus)
      onStatusUpdate(contact.id, newStatus)
      toast.success('Status updated successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d1a] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {contact.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="text-white font-semibold">{contact.name}</h3>
              <p className="text-gray-400 text-xs">{formatDate(contact.created_at)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-500">Email</span>
              </div>
              <a
                href={`mailto:${contact.email}`}
                className="text-sm text-blue-400 hover:underline break-all"
              >
                {contact.email}
              </a>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-500">Phone</span>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="text-sm text-white"
              >
                {contact.phone || 'Not provided'}
              </a>
            </div>
          </div>

          {/* Subject */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-500">Subject</span>
            </div>
            <p className="text-white font-medium">{contact.subject}</p>
          </div>

          {/* Message */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-500">Message</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {contact.message}
            </p>
          </div>

          {/* Status Update */}
          <div>
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Update Status
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon
                return (
                  <button
                    key={key}
                    disabled={updating || currentStatus === key}
                    onClick={() => handleStatusChange(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      currentStatus === key
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} opacity-100`
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                    } disabled:opacity-50`}
                  >
                    {updating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex justify-between items-center">
          <StatusBadge status={currentStatus} />
          <a
            href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject || '')}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium hover:bg-blue-500/20 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Reply via Email
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedContact, setSelectedContact] = useState(null)

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/contact')
      setContacts(data.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load contact messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleStatusUpdate = (id, newStatus) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const filtered = contacts.filter((c) => {
    const matchSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  // Stats
  const stats = {
    total: contacts.length,
    new: contacts.filter((c) => c.status === 'new' || !c.status).length,
    in_progress: contacts.filter((c) => c.status === 'in_progress').length,
    resolved: contacts.filter((c) => c.status === 'resolved').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage all incoming contact form submissions
          </p>
        </div>
        <button
          onClick={fetchContacts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'from-blue-500 to-purple-500', icon: Mail },
          { label: 'New', value: stats.new, color: 'from-blue-400 to-cyan-400', icon: Clock },
          { label: 'In Progress', value: stats.in_progress, color: 'from-yellow-400 to-orange-400', icon: MessageSquare },
          { label: 'Resolved', value: stats.resolved, color: 'from-green-400 to-emerald-400', icon: CheckCircle2 },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          >
            <option value="all" className="bg-[#0d0d1a]">All Status</option>
            <option value="new" className="bg-[#0d0d1a]">New</option>
            <option value="in_progress" className="bg-[#0d0d1a]">In Progress</option>
            <option value="resolved" className="bg-[#0d0d1a]">Resolved</option>
            <option value="spam" className="bg-[#0d0d1a]">Spam</option>
          </select>
        </div>
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No contact messages found</p>
          <p className="text-gray-600 text-sm mt-1">
            {search || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Contact form submissions will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {contact.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-white font-semibold text-sm">{contact.name}</p>
                      <StatusBadge status={contact.status || 'new'} />
                    </div>

                    <p className="text-blue-400 text-xs mb-1">{contact.email}</p>

                    <p className="text-white text-sm font-medium mb-1 truncate">
                      {contact.subject}
                    </p>

                    <p className="text-gray-500 text-xs line-clamp-1">
                      {contact.message}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <p className="text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(contact.created_at)}
                  </p>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </a>
                  )}
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedContact && (
          <ContactDetailModal
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
