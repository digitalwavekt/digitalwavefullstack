import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Clock, DollarSign, Users, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const initialCourses = [
  { id: 'mern', name: 'MERN Stack Development', duration: [1, 2, 3, 6], pricePerMonth: 2999, students: 456, status: 'active', description: 'Master MongoDB, Express, React, and Node.js' },
  { id: 'ai-ml', name: 'AI & Machine Learning', duration: [1, 2, 3, 6], pricePerMonth: 3499, students: 234, status: 'active', description: 'Learn Python, TensorFlow, and build intelligent systems' },
  { id: 'python', name: 'Python Development', duration: [1, 2, 3, 6], pricePerMonth: 2499, students: 389, status: 'active', description: 'Comprehensive Python programming with Django and Flask' },
  { id: 'web-dev', name: 'Web Development', duration: [1, 2, 3, 6], pricePerMonth: 2799, students: 567, status: 'active', description: 'Modern frontend and full-stack web apps' },
  { id: 'app-dev', name: 'Mobile App Development', duration: [1, 2, 3, 6], pricePerMonth: 3299, students: 198, status: 'active', description: 'Build cross-platform mobile apps' },
  { id: 'data-science', name: 'Data Science', duration: [1, 2, 3, 6], pricePerMonth: 2999, students: 312, status: 'active', description: 'Data analysis and visualization' },
]

export default function Courses() {
  const [courses, setCourses] = useState(initialCourses)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerMonth: '',
    duration: [1, 2, 3, 6],
    status: 'active',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...formData } : c))
      toast.success('Course updated successfully')
    } else {
      const newCourse = { ...formData, id: Date.now().toString(), students: 0 }
      setCourses([...courses, newCourse])
      toast.success('Course created successfully')
    }
    setShowModal(false)
    setEditingCourse(null)
    setFormData({ name: '', description: '', pricePerMonth: '', duration: [1, 2, 3, 6], status: 'active' })
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(c => c.id !== id))
      toast.success('Course deleted')
    }
  }

  const openEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      description: course.description,
      pricePerMonth: course.pricePerMonth,
      duration: course.duration,
      status: course.status,
    })
    setShowModal(true)
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
            setEditingCourse(null)
            setFormData({ name: '', description: '', pricePerMonth: '', duration: [1, 2, 3, 6], status: 'active' })
            setShowModal(true)
          }}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(course.id)}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">₹{course.pricePerMonth.toLocaleString()}/month</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">{course.duration.join(', ')} months</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">{course.students} enrolled</span>
              </div>
            </div>

            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              course.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
              'bg-gray-500/10 text-gray-400 border border-gray-500/20'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              {course.status}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
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
              <div>
                <label className="block text-sm text-gray-400 mb-2">Course Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="e.g., MERN Stack Development"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 resize-none"
                  placeholder="Course description..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Price per Month (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="2999"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
