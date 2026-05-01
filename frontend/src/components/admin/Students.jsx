import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Filter, Download, Mail, Phone, Calendar,
  CheckCircle2, XCircle, Clock, MoreVertical, Eye
} from 'lucide-react'

const mockStudents = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', phone: '+91 98765 43210', course: 'MERN Stack', duration: '3 months', startDate: '2024-01-01', endDate: '2024-04-01', status: 'active', progress: 65, certificateStatus: 'not_eligible' },
  { id: 2, name: 'Priya Patel', email: 'priya@email.com', phone: '+91 98765 43211', course: 'AI & ML', duration: '6 months', startDate: '2023-10-01', endDate: '2024-04-01', status: 'active', progress: 88, certificateStatus: 'eligible' },
  { id: 3, name: 'Amit Kumar', email: 'amit@email.com', phone: '+91 98765 43212', course: 'Python', duration: '2 months', startDate: '2024-01-10', endDate: '2024-03-10', status: 'active', progress: 45, certificateStatus: 'not_eligible' },
  { id: 4, name: 'Sneha Gupta', email: 'sneha@email.com', phone: '+91 98765 43213', course: 'Data Science', duration: '3 months', startDate: '2023-11-01', endDate: '2024-02-01', status: 'completed', progress: 100, certificateStatus: 'issued' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@email.com', phone: '+91 98765 43214', course: 'Web Development', duration: '1 month', startDate: '2024-01-15', endDate: '2024-02-15', status: 'active', progress: 30, certificateStatus: 'not_eligible' },
]

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-gray-400 text-sm">Manage all enrolled students</p>
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
          <option value="all" className="bg-dark-800">All Status</option>
          <option value="active" className="bg-dark-800">Active</option>
          <option value="completed" className="bg-dark-800">Completed</option>
          <option value="dropped" className="bg-dark-800">Dropped</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Student</th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Course</th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Duration</th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Progress</th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Certificate</th>
                <th className="text-right text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{student.name}</p>
                        <p className="text-gray-400 text-xs">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-sm">{student.course}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-sm">{student.duration}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs">{student.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      student.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.certificateStatus === 'issued' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      student.certificateStatus === 'eligible' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                      {student.certificateStatus === 'issued' ? 'Issued' :
                       student.certificateStatus === 'eligible' ? 'Eligible' : 'Not Eligible'}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
