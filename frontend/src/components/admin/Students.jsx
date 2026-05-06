import { useEffect, useState } from 'react'
import {
  Search,
  Download,
  Eye,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/api/admin/students`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch students')
      }

      setStudents(data.data || [])
    } catch (error) {
      toast.error(error.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.course_name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === 'all' || student.status === filterStatus

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading students...
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-gray-400 text-sm">
            Manage all enrolled students
          </p>
        </div>

        <button className="btn-primary text-sm flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">

        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

          <input
            type="text"
            placeholder="Search by name, email, or course..."
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

          <option value="active" className="bg-dark-800">
            Active
          </option>

          <option value="completed" className="bg-dark-800">
            Completed
          </option>

          <option value="dropped" className="bg-dark-800">
            Dropped
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
                  Course
                </th>

                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Duration
                </th>

                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Status
                </th>

                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Certificate
                </th>

                <th className="text-right text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-gray-400 py-10"
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {(student.name || 'S').charAt(0)}
                        </div>

                        <div>
                          <p className="text-white text-sm font-medium">
                            {student.name}
                          </p>

                          <p className="text-gray-400 text-xs">
                            {student.email}
                          </p>
                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-4">
                      <span className="text-white text-sm">
                        {student.course_name || '-'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">
                        {student.duration || '-'} months
                      </span>
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : student.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                      >
                        {student.status || 'active'}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${student.certificate_available
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}
                      >
                        {student.certificate_available
                          ? 'Issued'
                          : 'Not Issued'}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center justify-end gap-2">

                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">

          <div className="glass rounded-2xl p-6 w-full max-w-lg border border-white/10">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Student Details
              </h2>

              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">

              <div>
                <p className="text-gray-400">Name</p>
                <p className="text-white">{selectedStudent.name}</p>
              </div>

              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white">{selectedStudent.email}</p>
              </div>

              <div>
                <p className="text-gray-400">Phone</p>
                <p className="text-white">
                  {selectedStudent.phone || '-'}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Course</p>
                <p className="text-white">
                  {selectedStudent.course_name || '-'}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Duration</p>
                <p className="text-white">
                  {selectedStudent.duration || '-'} months
                </p>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  )
}