import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Clock, DollarSign, Users, CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerMonth: '',
    duration: [1, 2, 3, 6],
    status: 'active',
  })

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/admin/courses`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch courses')
      }

      setCourses(data.data || [])
    } catch (error) {
      toast.error(error.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const resetForm = () => {
    setEditingCourse(null)
    setFormData({
      name: '',
      description: '',
      pricePerMonth: '',
      duration: [1, 2, 3, 6],
      status: 'active',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      const url = editingCourse
        ? `${API_URL}/api/admin/courses/${editingCourse.id}`
        : `${API_URL}/api/admin/courses`

      const res = await fetch(url, {
        method: editingCourse ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerMonth: Number(formData.pricePerMonth),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Save failed')
      }

      toast.success(editingCourse ? 'Course updated successfully' : 'Course created successfully')
      setShowModal(false)
      resetForm()
      fetchCourses()
    } catch (error) {
      toast.error(error.message || 'Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const res = await fetch(`${API_URL}/api/admin/courses/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Delete failed')
      }

      toast.success('Course deleted')
      fetchCourses()
    } catch (error) {
      toast.error(error.message || 'Failed to delete course')
    }
  }

  const openEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name || '',
      description: course.description || '',
      pricePerMonth: course.pricePerMonth || '',
      duration: course.duration || [1, 2, 3, 6],
      status: course.status || 'active',
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading courses...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-gray-400 text-sm">Manage internship courses and pricing</p>
        </div>

        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="glass rounded-2xl p-8 border border-white/10 text-center text-gray-400">
          No courses found. Add your first course.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{course.name}</h3>
                  <p className="text-gray-400 text-xs mt-1">{course.description}</p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(course)}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">₹{Number(course.pricePerMonth || 0).toLocaleString()}/month</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">{(course.duration || []).join(', ')} months</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">{course.students || 0} enrolled</span>
                </div>
              </div>

              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${course.status === 'active'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                }`}>
                <CheckCircle2 className="w-3 h-3" />
                {course.status}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-lg border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-6">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                placeholder="Course name"
              />

              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
                placeholder="Course description"
              />

              <input
                type="number"
                required
                value={formData.pricePerMonth}
                onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                placeholder="Price per month"
              />

              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              >
                <option value="active" className="bg-dark-800">Active</option>
                <option value="inactive" className="bg-dark-800">Inactive</option>
              </select>

              <div className="flex gap-3">
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
                  {saving ? 'Saving...' : editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}