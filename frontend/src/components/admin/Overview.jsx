import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL

export default function Overview() {
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalProjects: 0,
    monthlyRevenue: 0,
    recentStudents: [],
    pendingProjects: [],
  })

  const fetchStats = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/api/admin/stats`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch stats')
      }

      setStatsData(data.data)
    } catch (error) {
      toast.error(error.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const stats = [
    {
      title: 'Total Students',
      value: Number(statsData.totalStudents || 0).toLocaleString(),
      change: 'Live',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Active Courses',
      value: Number(statsData.activeCourses || 0).toLocaleString(),
      change: 'Live',
      icon: BookOpen,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'College Projects',
      value: Number(statsData.totalProjects || 0).toLocaleString(),
      change: 'Live',
      icon: GraduationCap,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
    },
    {
      title: 'Revenue',
      value: `₹${Number(statsData.monthlyRevenue || 0).toLocaleString()}`,
      change: 'Live',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm mt-1">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass rounded-2xl p-5 border ${stat.borderColor} ${stat.bgColor}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-400">
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </div>
            </div>

            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-400 text-xs mt-1">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Recent Students</h3>
          </div>

          <div className="space-y-3">
            {(statsData.recentStudents || []).length === 0 ? (
              <p className="text-gray-400 text-sm">No recent students found.</p>
            ) : (
              statsData.recentStudents.map((student, i) => (
                <div
                  key={`${student.email || student.name}-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {(student.name || 'S').charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {student.name || '-'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {student.course || '-'}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : student.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}
                  >
                    {student.status || 'pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Pending College Projects</h3>
          </div>

          <div className="space-y-3">
            {(statsData.pendingProjects || []).length === 0 ? (
              <p className="text-gray-400 text-sm">No pending projects found.</p>
            ) : (
              statsData.pendingProjects.map((project, i) => (
                <div
                  key={`${project.student || project.project}-${i}`}
                  className="p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {project.project || '-'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {project.student || '-'} • {project.stack || '-'}
                      </p>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {project.amount || '₹0'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {project.status === 'payment_pending' && (
                      <span className="flex items-center gap-1 text-xs text-orange-400">
                        <AlertCircle className="w-3 h-3" />
                        Payment Pending
                      </span>
                    )}
                    {project.status === 'in_progress' && (
                      <span className="flex items-center gap-1 text-xs text-blue-400">
                        <Clock className="w-3 h-3" />
                        In Progress
                      </span>
                    )}
                    {project.status === 'review' && (
                      <span className="flex items-center gap-1 text-xs text-purple-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Under Review
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Students', icon: Users },
            { label: 'Courses', icon: BookOpen },
            { label: 'Certificates', icon: CheckCircle2 },
            { label: 'Reports', icon: TrendingUp },
          ].map((action) => (
            <button
              key={action.label}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
            >
              <action.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <span className="text-gray-300 text-xs">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}