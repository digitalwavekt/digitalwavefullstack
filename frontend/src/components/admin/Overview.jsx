import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, BookOpen, GraduationCap, DollarSign, TrendingUp,
  Clock, AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const stats = [
  { 
    title: 'Total Students', 
    value: '2,456', 
    change: '+12%', 
    trend: 'up',
    icon: Users, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  { 
    title: 'Active Courses', 
    value: '18', 
    change: '+3', 
    trend: 'up',
    icon: BookOpen, 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  { 
    title: 'College Projects', 
    value: '342', 
    change: '+28', 
    trend: 'up',
    icon: GraduationCap, 
    color: 'text-pink-400', 
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20'
  },
  { 
    title: 'Revenue (Monthly)', 
    value: '₹4.2L', 
    change: '+8%', 
    trend: 'up',
    icon: DollarSign, 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
]

const recentStudents = [
  { name: 'Rahul Sharma', course: 'MERN Stack', date: '2024-01-15', status: 'active', email: 'rahul@email.com' },
  { name: 'Priya Patel', course: 'AI & ML', date: '2024-01-14', status: 'active', email: 'priya@email.com' },
  { name: 'Amit Kumar', course: 'Python', date: '2024-01-13', status: 'pending', email: 'amit@email.com' },
  { name: 'Sneha Gupta', course: 'Data Science', date: '2024-01-12', status: 'completed', email: 'sneha@email.com' },
  { name: 'Vikram Singh', course: 'Web Dev', date: '2024-01-11', status: 'active', email: 'vikram@email.com' },
]

const pendingProjects = [
  { student: 'Rohan Mehta', project: 'E-Commerce Platform', stack: 'MERN', amount: '₹4,999', status: 'payment_pending' },
  { student: 'Anjali Desai', project: 'Sentiment Analysis', stack: 'AI/ML', amount: '₹5,999', status: 'in_progress' },
  { student: 'Karan Joshi', project: 'Library Management', stack: 'Python', amount: '₹4,499', status: 'review' },
]

export default function Overview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass rounded-2xl p-5 border ${stat.borderColor} ${stat.bgColor}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-400 text-xs mt-1">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Recent Students</h3>
            <button className="text-blue-400 text-xs hover:text-blue-300">View All</button>
          </div>
          <div className="space-y-3">
            {recentStudents.map((student, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{student.name}</p>
                  <p className="text-gray-400 text-xs">{student.course}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  student.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                }`}>
                  {student.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Pending College Projects</h3>
            <button className="text-blue-400 text-xs hover:text-blue-300">View All</button>
          </div>
          <div className="space-y-3">
            {pendingProjects.map((project, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white text-sm font-medium">{project.project}</p>
                    <p className="text-gray-400 text-xs">{project.student} • {project.stack}</p>
                  </div>
                  <span className="text-white font-semibold text-sm">{project.amount}</span>
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
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Student', icon: Users, color: 'blue' },
            { label: 'Create Course', icon: BookOpen, color: 'purple' },
            { label: 'Design Certificate', icon: CheckCircle2, color: 'green' },
            { label: 'View Reports', icon: TrendingUp, color: 'pink' },
          ].map((action, i) => (
            <button
              key={i}
              className={`p-4 rounded-xl bg-${action.color}-500/5 border border-${action.color}-500/20 hover:bg-${action.color}-500/10 transition-colors text-center`}
            >
              <action.icon className={`w-6 h-6 text-${action.color}-400 mx-auto mb-2`} />
              <span className="text-gray-300 text-xs">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
