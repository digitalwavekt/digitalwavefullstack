import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../hooks/useAuthStore'
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, Settings,
  LogOut, Menu, X, ChevronRight, Shield, UserPlus,
  Image, MapPin, Phone, Mail, FileText, Award, DollarSign,
  TrendingUp, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

// Dashboard Components
import Overview from '../components/admin/Overview'
import Students from '../components/admin/Students'
import Courses from '../components/admin/Courses'
import Certificates from '../components/admin/Certificates'
import CollegeProjects from '../components/admin/CollegeProjects'
import SettingsPanel from '../components/admin/SettingsPanel'
import SubAdmins from '../components/admin/SubAdmins'

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '' },
  { id: 'students', label: 'Students', icon: Users, path: 'students' },
  { id: 'courses', label: 'Courses', icon: BookOpen, path: 'courses' },
  { id: 'certificates', label: 'Certificates', icon: Award, path: 'certificates' },
  { id: 'college-projects', label: 'College Projects', icon: GraduationCap, path: 'college-projects' },
  { id: 'subadmins', label: 'Sub-Admins', icon: UserPlus, path: 'subadmins' },
  { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
]

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin, isSubAdmin, logout, hasPermission } = useAuthStore()

  useEffect(() => {
    if (!user) {
      navigate('/admin/login')
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  // Filter sidebar items based on permissions
  const visibleItems = sidebarItems.filter(item => {
    if (isAdmin) return true
    if (item.id === 'subadmins' && !hasPermission('manage_subadmins')) return false
    if (item.id === 'settings' && !hasPermission('manage_settings')) return false
    return true
  })

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Digital Wave IT Solutions</title>
      </Helmet>

      <div className="min-h-screen bg-dark-900 flex">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          className={`fixed lg:sticky top-0 left-0 h-screen w-64 glass border-r border-white/5 z-50 flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } transition-transform duration-300`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg rotate-45" />
                <div className="absolute inset-1 bg-dark-800 rounded-md flex items-center justify-center">
                  <span className="text-lg font-bold gradient-text">DW</span>
                </div>
              </div>
              <div>
                <h1 className="text-sm font-bold gradient-text">Digital Wave</h1>
                <p className="text-[10px] text-gray-400">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {visibleItems.map((item) => {
              const isActive = location.pathname === `/admin/dashboard/${item.path}` || 
                (item.path === '' && location.pathname === '/admin/dashboard')
              return (
                <Link
                  key={item.id}
                  to={`/admin/dashboard/${item.path}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                <p className="text-gray-400 text-xs">{isAdmin ? 'Super Admin' : 'Sub Admin'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 glass sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-white font-semibold">Admin Panel</span>
            <div className="w-8" />
          </div>

          {/* Page Content */}
          <div className="p-6 lg:p-8">
            <Routes>
              <Route path="" element={<Overview />} />
              <Route path="students" element={<Students />} />
              <Route path="courses" element={<Courses />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="college-projects" element={<CollegeProjects />} />
              <Route path="subadmins" element={<SubAdmins />} />
              <Route path="settings" element={<SettingsPanel />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  )
}
