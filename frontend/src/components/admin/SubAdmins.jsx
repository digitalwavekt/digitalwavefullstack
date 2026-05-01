import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Shield, CheckSquare, XSquare, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const availablePermissions = [
  { id: 'manage_students', label: 'Manage Students', description: 'View, edit, and manage student records' },
  { id: 'manage_courses', label: 'Manage Courses', description: 'Create and edit courses and pricing' },
  { id: 'manage_certificates', label: 'Manage Certificates', description: 'Issue and revoke certificates' },
  { id: 'manage_projects', label: 'Manage Projects', description: 'Handle college project requests' },
  { id: 'manage_payments', label: 'View Payments', description: 'View payment records and reports' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'Update website and app settings' },
]

const initialSubAdmins = [
  { id: 1, name: 'Rajesh Kumar', email: 'rajesh@digitalwaveit.com', role: 'subadmin', permissions: ['manage_students', 'manage_courses'], status: 'active', createdAt: '2024-01-01' },
  { id: 2, name: 'Pooja Sharma', email: 'pooja@digitalwaveit.com', role: 'subadmin', permissions: ['manage_projects', 'manage_certificates'], status: 'active', createdAt: '2024-01-05' },
]

export default function SubAdmins() {
  const [subAdmins, setSubAdmins] = useState(initialSubAdmins)
  const [showModal, setShowModal] = useState(false)
  const [editingSubAdmin, setEditingSubAdmin] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: [],
  })

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingSubAdmin) {
      setSubAdmins(subAdmins.map(sa => sa.id === editingSubAdmin.id ? { ...sa, ...formData, password: undefined } : sa))
      toast.success('Sub-admin updated successfully')
    } else {
      const newSubAdmin = {
        id: Date.now(),
        ...formData,
        role: 'subadmin',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      }
      setSubAdmins([...subAdmins, newSubAdmin])
      toast.success('Sub-admin created successfully')
    }
    setShowModal(false)
    setEditingSubAdmin(null)
    setFormData({ name: '', email: '', password: '', permissions: [] })
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this sub-admin?')) {
      setSubAdmins(subAdmins.filter(sa => sa.id !== id))
      toast.success('Sub-admin removed')
    }
  }

  const handleToggleStatus = (id) => {
    setSubAdmins(subAdmins.map(sa => 
      sa.id === id ? { ...sa, status: sa.status === 'active' ? 'inactive' : 'active' } : sa
    ))
    toast.success('Status updated')
  }

  const openEdit = (subAdmin) => {
    setEditingSubAdmin(subAdmin)
    setFormData({
      name: subAdmin.name,
      email: subAdmin.email,
      password: '',
      permissions: subAdmin.permissions,
    })
    setShowModal(true)
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
            setEditingSubAdmin(null)
            setFormData({ name: '', email: '', password: '', permissions: [] })
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
              {subAdmins.map((subAdmin) => (
                <tr key={subAdmin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {subAdmin.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{subAdmin.name}</p>
                        <p className="text-gray-400 text-xs">Created {subAdmin.createdAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 text-sm">{subAdmin.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {subAdmin.permissions.map((perm, i) => (
                        <span key={i} className="px-2 py-1 rounded-md text-xs bg-white/5 text-gray-300 border border-white/10">
                          {availablePermissions.find(p => p.id === perm)?.label || perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(subAdmin.id)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                        subAdmin.status === 'active' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'
                      }`}
                    >
                      {subAdmin.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEdit(subAdmin)}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(subAdmin.id)}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  placeholder="email@digitalwaveit.com"
                />
              </div>
              {!editingSubAdmin && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Password</label>
                  <input
                    type="password"
                    required={!editingSubAdmin}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    placeholder="Set a password"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-3">Permissions</label>
                <div className="space-y-2">
                  {availablePermissions.map((perm) => (
                    <label 
                      key={perm.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.permissions.includes(perm.id)
                          ? 'border-blue-500/30 bg-blue-500/5'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${
                        formData.permissions.includes(perm.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-500'
                      }`}>
                        {formData.permissions.includes(perm.id) && (
                          <CheckSquare className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                      />
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
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingSubAdmin ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
