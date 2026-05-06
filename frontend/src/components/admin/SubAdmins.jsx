import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, CheckSquare, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../hooks/useAuthStore'

const API_URL = import.meta.env.VITE_API_URL

const availablePermissions = [
  { id: 'manage_students', label: 'Manage Students', description: 'View, edit, and manage student records' },
  { id: 'manage_courses', label: 'Manage Courses', description: 'Create and edit courses and pricing' },
  { id: 'manage_certificates', label: 'Manage Certificates', description: 'Issue and revoke certificates' },
  { id: 'manage_projects', label: 'Manage Projects', description: 'Handle college project requests' },
  { id: 'manage_payments', label: 'View Payments', description: 'View payment records and reports' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'Update website and app settings' },
]

export default function SubAdmins() {
  const { token } = useAuthStore()
  const [subAdmins, setSubAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingSubAdmin, setEditingSubAdmin] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: [],
  })

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const fetchSubAdmins = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/api/auth/subadmins`, {
        headers: authHeaders,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch sub-admins')
      }

      setSubAdmins(data.data || [])
    } catch (error) {
      toast.error(error.message || 'Failed to load sub-admins')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubAdmins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetForm = () => {
    setEditingSubAdmin(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      permissions: [],
    })
  }

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      const url = editingSubAdmin
        ? `${API_URL}/api/auth/subadmin/${editingSubAdmin.id}`
        : `${API_URL}/api/auth/subadmin`

      const payload = {
        name: formData.name,
        email: formData.email,
        permissions: formData.permissions,
      }

      if (!editingSubAdmin || formData.password) {
        payload.password = formData.password
      }

      const res = await fetch(url, {
        method: editingSubAdmin ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Save failed')
      }

      toast.success(editingSubAdmin ? 'Sub-admin updated successfully' : 'Sub-admin created successfully')
      setShowModal(false)
      resetForm()
      fetchSubAdmins()
    } catch (error) {
      toast.error(error.message || 'Failed to save sub-admin')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this sub-admin?')) return

    try {
      const res = await fetch(`${API_URL}/api/auth/subadmin/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Delete failed')
      }

      toast.success('Sub-admin removed')
      fetchSubAdmins()
    } catch (error) {
      toast.error(error.message || 'Failed to delete sub-admin')
    }
  }

  const handleToggleStatus = async (subAdmin) => {
    try {
      const nextStatus = subAdmin.status === 'active' ? 'inactive' : 'active'

      const res = await fetch(`${API_URL}/api/auth/subadmin/${subAdmin.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: nextStatus }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Status update failed')
      }

      toast.success('Status updated')
      fetchSubAdmins()
    } catch (error) {
      toast.error(error.message || 'Failed to update status')
    }
  }

  const openEdit = (subAdmin) => {
    setEditingSubAdmin(subAdmin)
    setFormData({
      name: subAdmin.name || '',
      email: subAdmin.email || '',
      password: '',
      permissions: subAdmin.permissions || [],
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading sub-admins...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sub-Admins</h1>
          <p className="text-gray-400 text-sm">Manage team members and their access</p>
        </div>

        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Sub-Admin
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Email</th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Permissions</th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-right text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {subAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-400 py-10">
                    No sub-admins found
                  </td>
                </tr>
              ) : (
                subAdmins.map((subAdmin) => (
                  <tr key={subAdmin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {(subAdmin.name || 'S').charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{subAdmin.name}</p>
                          <p className="text-gray-400 text-xs">
                            Created {subAdmin.created_at?.split('T')[0] || '-'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">{subAdmin.email}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(subAdmin.permissions || []).map((perm) => (
                          <span key={perm} className="px-2 py-1 rounded-md text-xs bg-white/5 text-gray-300 border border-white/10">
                            {availablePermissions.find((p) => p.id === perm)?.label || perm}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(subAdmin)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${subAdmin.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'
                          }`}
                      >
                        {subAdmin.status || 'active'}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(subAdmin)}
                          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(subAdmin.id)}
                          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-white mb-6">
              {editingSubAdmin ? 'Edit Sub-Admin' : 'Add Sub-Admin'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                placeholder="Full name"
              />

              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                placeholder="email@digitalwaveit.com"
              />

              <input
                type="password"
                required={!editingSubAdmin}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                placeholder={editingSubAdmin ? 'Leave blank to keep password' : 'Set password'}
              />

              <div>
                <label className="block text-sm text-gray-400 mb-3">Permissions</label>

                <div className="space-y-2">
                  {availablePermissions.map((perm) => (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.permissions.includes(perm.id)
                          ? 'border-blue-500/30 bg-blue-500/5'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                      />

                      <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${formData.permissions.includes(perm.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-500'
                        }`}>
                        {formData.permissions.includes(perm.id) && (
                          <CheckSquare className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>

                      <div>
                        <p className="text-white text-sm font-medium">{perm.label}</p>
                        <p className="text-gray-400 text-xs">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">
                  {saving ? 'Saving...' : editingSubAdmin ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}