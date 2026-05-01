import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'
import { 
  GraduationCap, Calendar, Video, Award, Download, 
  Clock, BookOpen, User, LogOut, Loader2, FileText,
  CheckCircle2, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()

  useEffect(() => {
    if (!token) {
      navigate('/internship')
      return
    }
    fetchStudentData()
  }, [token])

  const fetchStudentData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/student/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setStudentData(data.data)
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/student/certificate/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${studentData?.name}.pdf`
      a.click()
      toast.success('Certificate downloaded!')
    } catch (error) {
      toast.error('Failed to download certificate')
    }
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'classes', label: 'Classes', icon: Video },
    { id: 'certificate', label: 'Certificate', icon: Award },
  ]

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
              <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
              <p className="text-gray-400 text-sm">Welcome back, {studentData?.name || 'Student'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-white/5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {studentData?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{studentData?.name}</p>
                    <p className="text-gray-400 text-xs">{studentData?.email}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Course Info Card */}
              <div className="glass rounded-2xl p-4 border border-white/10 mt-4">
                <h4 className="text-white font-semibold text-sm mb-3">Course Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Course</span>
                    <span className="text-white text-xs font-medium">{studentData?.courseName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Duration</span>
                    <span className="text-white text-xs font-medium">{studentData?.duration} Months</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Start Date</span>
                    <span className="text-white text-xs font-medium">{studentData?.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">End Date</span>
                    <span className="text-white text-xs font-medium">{studentData?.endDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Stats */}
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
                      <Video className="w-5 h-5 text-blue-400" />
                      Google Meet Login Credentials
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">Email ID</p>
                        <p className="text-white font-mono text-sm">{studentData?.googleMeetEmail}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">Password</p>
                        <p className="text-white font-mono text-sm">{studentData?.googleMeetPassword}</p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">
                      Use these credentials to join your Google Meet classes. Password format: First 4 letters of your name (CAPS) + DOB (DDMMYYYY)
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h3 className="text-white font-semibold mb-4">Course Progress</h3>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${studentData?.progress || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-400 text-xs">{studentData?.progress || 0}% Complete</span>
                      <span className="text-gray-400 text-xs">{studentData?.daysLeft || 0} days remaining</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'classes' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="text-white font-semibold mb-6">Upcoming Classes</h3>
                  <div className="space-y-4">
                    {studentData?.upcomingClasses?.map((cls, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">{cls.title}</h4>
                          <p className="text-gray-400 text-xs">{cls.date} • {cls.time}</p>
                        </div>
                        <a 
                          href={cls.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                        >
                          Join Meet
                        </a>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No upcoming classes scheduled</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'certificate' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6 border border-white/10"
                >
                  <h3 className="text-white font-semibold mb-6">Certificate</h3>

                  {studentData?.certificateAvailable ? (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                        <Award className="w-10 h-10 text-green-400" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">Congratulations!</h4>
                      <p className="text-gray-400 text-sm mb-6">
                        You have successfully completed your internship. Your certificate is ready for download.
                      </p>
                      <button
                        onClick={handleDownloadCertificate}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Certificate
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-orange-400" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">Certificate Not Available Yet</h4>
                      <p className="text-gray-400 text-sm">
                        Complete your internship duration to unlock your certificate. 
                        Keep attending classes and submitting assignments.
                      </p>
                      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-xs">Progress</span>
                          <span className="text-white text-xs font-medium">{studentData?.progress || 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${studentData?.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
