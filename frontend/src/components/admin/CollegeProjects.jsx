import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL

export default function CollegeProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [selectedProject, setSelectedProject] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchProjects = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/api/college-project`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch projects')
      }

      setProjects(data.data || [])
    } catch (error) {
      toast.error(error.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((project) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      (project.studentName || '').toLowerCase().includes(search) ||
      (project.project || '').toLowerCase().includes(search) ||
      (project.college || '').toLowerCase().includes(search)

    const matchesStatus =
      filterStatus === 'all' || project.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id)

      const res = await fetch(
        `${API_URL}/api/college-project/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Status update failed')
      }

      toast.success(`Project marked as ${newStatus}`)
      fetchProjects()
    } catch (error) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const openDetail = (project) => {
    setSelectedProject(project)
    setShowDetailModal(true)
  }

  const statusColors = {
    payment_pending:
      'bg-orange-500/10 text-orange-400 border-orange-500/20',

    pending:
      'bg-orange-500/10 text-orange-400 border-orange-500/20',

    in_progress:
      'bg-blue-500/10 text-blue-400 border-blue-500/20',

    review:
      'bg-purple-500/10 text-purple-400 border-purple-500/20',

    completed:
      'bg-green-500/10 text-green-400 border-green-500/20',

    cancelled:
      'bg-red-500/10 text-red-400 border-red-500/20',

    paid:
      'bg-green-500/10 text-green-400 border-green-500/20',
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading projects...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            College Projects
          </h1>

          <p className="text-gray-400 text-sm">
            Manage student project requests
          </p>
        </div>

        <button className="btn-primary text-sm flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

          <input
            type="text"
            placeholder="Search by student, project, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="all" className="bg-dark-800">
            All Status
          </option>

          <option value="payment_pending" className="bg-dark-800">
            Payment Pending
          </option>

          <option value="in_progress" className="bg-dark-800">
            In Progress
          </option>

          <option value="review" className="bg-dark-800">
            Under Review
          </option>

          <option value="completed" className="bg-dark-800">
            Completed
          </option>
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Student
                </th>

                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Project
                </th>

                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Stack
                </th>

                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Amount
                </th>

                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Status
                </th>

                <th className="text-right text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-gray-400 py-10"
                  >
                    No projects found
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {(project.studentName || 'S').charAt(0)}
                        </div>

                        <div>
                          <p className="text-white text-sm font-medium">
                            {project.studentName}
                          </p>

                          <p className="text-gray-400 text-xs">
                            {project.college}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-white text-sm">
                        {project.project}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md text-xs bg-white/5 text-gray-300 border border-white/10">
                        {project.stack}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-white text-sm font-medium">
                        ₹{Number(project.amount || 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[project.status]
                          }`}
                      >
                        {(project.status || '')
                          .replace('_', ' ')
                          .toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(project)}
                          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {project.status === 'payment_pending' && (
                          <button
                            disabled={updatingId === project.id}
                            onClick={() =>
                              handleStatusChange(
                                project.id,
                                'in_progress'
                              )
                            }
                            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {project.status === 'in_progress' && (
                          <button
                            disabled={updatingId === project.id}
                            onClick={() =>
                              handleStatusChange(
                                project.id,
                                'completed'
                              )
                            }
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Project Details
              </h2>

              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                ['Student Name', selectedProject.studentName],
                ['Email', selectedProject.email],
                ['Phone', selectedProject.phone],
                ['College', selectedProject.college],
                [
                  'Branch & Year',
                  `${selectedProject.branch} - ${selectedProject.year}th Year`,
                ],
                ['Project Title', selectedProject.project],
                ['Tech Stack', selectedProject.stack],
                [
                  'Amount',
                  `₹${Number(
                    selectedProject.amount || 0
                  ).toLocaleString()}`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <p className="text-gray-400 text-xs mb-1">
                    {label}
                  </p>

                  <p className="text-white font-medium">
                    {value || '-'}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <p className="text-gray-400 text-xs mb-2">
                Additional Requirements
              </p>

              <p className="text-white text-sm">
                {selectedProject.requirements || '-'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
              >
                Close
              </button>

              {selectedProject.status ===
                'payment_pending' && (
                  <button
                    onClick={() => {
                      handleStatusChange(
                        selectedProject.id,
                        'in_progress'
                      )
                      setShowDetailModal(false)
                    }}
                    className="flex-1 btn-primary"
                  >
                    Start Project
                  </button>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}