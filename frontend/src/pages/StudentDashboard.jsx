import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'
import { 
  GraduationCap, Calendar, Video, Award, Download, 
  Clock, BookOpen, User, LogOut, Loader2, FileText,
  CheckCircle2, AlertCircle, Briefcase, Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../lib/api'

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [studentData, setStudentData] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()

  useEffect(() => {
    if (!token) {
      navigate('/internship')
      return
    }
    fetchDashboardData()
  }, [token])

  const fetchDashboardData = async () => {
    try {
      const data = await apiFetch('/api/student/dashboard')
      setStudentData(data.data.student)
      setOrders(data.data.orders || [])
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = async (orderId, studentName) => {
    // Note: implementation for actual download logic
    toast.success('Certificate download started')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  // Use the most recent order to determine the primary view
  const currentOrder = orders[0]
  const isProjectOnly = currentOrder?.orderType === 'project'

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    ...(!isProjectOnly ? [{ id: 'classes', label: 'Classes', icon: Video }] : []),
    { id: 'certificate', label: isProjectOnly ? 'Project Assets' : 'Certificate', icon: isProjectOnly ? Download : Award },
  ]

  // Calculate deadline/progress for project-only
  let deadlineInfo = null
  if (isProjectOnly && currentOrder) {
    const created = new Date(currentOrder.createdAt)
    const deadline = currentOrder.deadline ? new Date(currentOrder.deadline) : new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000)
    const now = new Date()
    const daysLeft = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)))
    const progress = Math.min(100, Math.max(0, 100 - (daysLeft / 7) * 100))
    deadlineInfo = { daysLeft, progress, date: deadline.toLocaleDateString('en-IN') }
  }

  return (
    <>
      <Helmet>
        <title>Student Dashboard | Digital Wave IT Solutions</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-16 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {isProjectOnly ? <Briefcase className="w-6 h-6 text-orange-400" /> : <GraduationCap className="w-6 h-6 text-blue-400" />}
                Student Dashboard
              </h1>
              <p className="text-gray-400 text-sm mt-1">Welcome back, {studentData?.name || 'Student'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {!currentOrder ? (
            <div className="glass rounded-2xl p-8 border border-white/10 text-center text-gray-400">
              <p className="mb-4">You don't have any active enrollments.</p>
              <button onClick={() => navigate('/college-project')} className="btn-primary">
                Explore Programs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="glass rounded-2xl p-4 border border-white/10 sticky top-24">
                  <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {studentData?.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-white font-medium text-sm truncate">{studentData?.name}</p>
                      <p className="text-gray-400 text-xs truncate">{studentData?.email}</p>
                    </div>
                  </div>

                  <nav className="space-y-1 mb-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>

                  {/* Program Info Card */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-white font-semibold text-sm mb-3 border-b border-white/10 pb-2">Enrollment Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Type</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${isProjectOnly ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                          {isProjectOnly ? 'Project Only' : 'Internship'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Course</span>
                        <span className="text-white text-xs font-medium text-right max-w-[120px] truncate">{currentOrder.category || currentOrder.techStack}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Project</span>
                        <span className="text-white text-xs font-medium text-right max-w-[120px] truncate">{currentOrder.title}</span>
                      </div>
                      {!isProjectOnly && currentOrder.duration && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Duration</span>
                          <span className="text-white text-xs font-medium">{currentOrder.duration} Months</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                      
                      {/* Status Banner */}
                      <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">Current Status: <span className="text-blue-400">{currentOrder.progressLabel}</span></h3>
                          <p className="text-gray-400 text-sm">Order ID: {currentOrder.orderNumber}</p>
                        </div>
                        {isProjectOnly && deadlineInfo && (
                          <div className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-400" />
                            <div>
                              <p className="text-xs text-orange-400 font-semibold">Delivery Deadline</p>
                              <p className="text-sm text-white font-bold">{deadlineInfo.daysLeft} days left</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dynamic Content based on Type */}
                      {isProjectOnly ? (
                        <>
                          <div className="glass rounded-2xl p-6 border border-white/10">
                            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                              <Zap className="w-5 h-5 text-orange-400" /> Delivery Progress
                            </h3>
                            <div className="relative pt-2">
                              <div className="flex mb-2 items-center justify-between">
                                <div>
                                  <span className="text-xs font-semibold inline-block text-orange-400">
                                    {Math.round(deadlineInfo.progress)}% Elapsed
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-semibold inline-block text-gray-400">
                                    Est. Date: {deadlineInfo.date}
                                  </span>
                                </div>
                              </div>
                              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-white/5 border border-white/10">
                                <div style={{ width: `${deadlineInfo.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-1000"></div>
                              </div>
                              <p className="text-sm text-gray-400">Your project is currently being developed and assembled. You will be able to download all assets here once it reaches the "Ready for Download" stage.</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: 'Classes Attended', value: studentData?.classesAttended || 0, icon: Video, color: 'text-blue-400' },
                              { label: 'Total Classes', value: studentData?.totalClasses || 0, icon: Calendar, color: 'text-purple-400' },
                              { label: 'Assignments', value: studentData?.assignmentsCompleted || 0, icon: FileText, color: 'text-green-400' },
                              { label: 'Days Left', value: studentData?.daysLeft || 0, icon: Clock, color: 'text-orange-400' },
                            ].map((stat, i) => (
                              <div key={i} className="glass rounded-2xl p-5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                  <span className="text-gray-400 text-xs">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Google Meet Credentials */}
                          <div className="glass rounded-2xl p-6 border border-white/10">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                              <Video className="w-5 h-5 text-blue-400" /> Google Meet Login
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 text-xs mb-1">Email ID</p>
                                <p className="text-white font-mono text-sm">{studentData?.googleMeetEmail || 'Will be assigned soon'}</p>
                              </div>
                              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 text-xs mb-1">Password</p>
                                <p className="text-white font-mono text-sm">{studentData?.googleMeetPassword || 'Will be assigned soon'}</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Project Requirements Summary */}
                      {currentOrder.requirements?.custom_notes && (
                        <div className="glass rounded-2xl p-6 border border-white/10">
                          <h3 className="text-white font-semibold mb-3">Your Requirements</h3>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300">
                            {currentOrder.requirements.custom_notes}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* CLASSES TAB (Internship Only) */}
                  {!isProjectOnly && activeTab === 'classes' && (
                    <motion.div key="classes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-6">Upcoming Classes</h3>
                      <div className="space-y-4">
                        {studentData?.upcomingClasses?.length > 0 ? (
                          studentData.upcomingClasses.map((cls, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Video className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-medium text-sm">{cls.title}</h4>
                                <p className="text-gray-400 text-xs mt-1">{cls.date} • {cls.time}</p>
                              </div>
                              <a href={cls.meetLink || '#'} target="_blank" rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-center">
                                Join Meet
                              </a>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p>No upcoming classes scheduled at the moment.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* CERTIFICATE / ASSETS TAB */}
                  {activeTab === 'certificate' && (
                    <motion.div key="certificate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl p-6 border border-white/10 text-center">
                      
                      {['delivery_unlocked', 'delivered'].includes(currentOrder.status) ? (
                        <div className="py-8 max-w-md mx-auto">
                          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                            {isProjectOnly ? <Download className="w-10 h-10 text-green-400" /> : <Award className="w-10 h-10 text-green-400" />}
                          </div>
                          <h4 className="text-xl font-bold text-white mb-2">
                            {isProjectOnly ? 'Your Assets Are Ready!' : 'Congratulations!'}
                          </h4>
                          <p className="text-gray-400 text-sm mb-8">
                            {isProjectOnly 
                              ? 'Your project source code, documentation, and PPT are ready for download.'
                              : 'You have successfully completed your internship program. Your certificate and project assets are ready.'}
                          </p>
                          <button onClick={() => handleDownloadCertificate(currentOrder.id, studentData?.name)} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                            <Download className="w-4 h-4" /> Download {isProjectOnly ? 'Project ZIP' : 'Certificate & Assets'}
                          </button>
                        </div>
                      ) : (
                        <div className="py-12 max-w-md mx-auto">
                          <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-orange-400" />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2">
                            {isProjectOnly ? 'Assets Not Ready Yet' : 'Certificate Not Available Yet'}
                          </h4>
                          <p className="text-gray-400 text-sm mb-6">
                            {isProjectOnly
                              ? 'Your project is still in progress. Check back once the status changes to "Ready for Download".'
                              : 'Complete your internship duration and assignments to unlock your certificate and project assets.'}
                          </p>
                          
                          {/* Progress Indicator */}
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-400 text-xs">Current Stage</span>
                              <span className="text-blue-400 text-xs font-semibold">{currentOrder.progressLabel}</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '40%' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
