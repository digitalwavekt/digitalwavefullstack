import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, Shield, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../../hooks/useAuthStore'
import useSiteSettings from '../../hooks/useSiteSettings'
import { useTheme } from '../../hooks/useTheme'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Projects', path: '/projects' },
  { name: 'Internship', path: '/internship' },
  { name: 'College Project', path: '/college-project' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const { user, isAdmin, logout } = useAuthStore()
  const { settings } = useSiteSettings()
  const { theme, toggleTheme } = useTheme()

  const general = settings?.general || {}

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="section-padding max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11">
            {general.logo ? (
              <img
                src={general.logo}
                alt={general.companyName || 'Logo'}
                className="w-11 h-11 rounded-xl object-contain bg-white/5 border border-white/10 p-1"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg rotate-45 group-hover:rotate-90 transition-transform duration-500" />

                <div className="absolute inset-1 bg-dark-900 rounded-md flex items-center justify-center">
                  <span className="text-lg font-bold gradient-text">
                    DW
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold leading-tight">
              <span className="gradient-text">
                {general.companyName || 'Digital Wave'}
              </span>
            </h1>

            <p className="text-[10px] text-gray-400 tracking-widest uppercase">
              {general.tagline || 'IT Solutions'}
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-lg ${location.pathname === link.path
                  ? 'text-blue-400'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
            >
              {link.name}

              {location.pathname === link.path && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* AUTH */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle dark or bright mode"
            title={theme === 'dark' ? 'Bright mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
                <User className="w-4 h-4" />
                {user.name ? user.name.split(' ')[0] : 'Member'}
              </span>

              <Link
                to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {isAdmin ? (
                  <>
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    My Dashboard
                  </>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>

              <Link
                to="/internship"
                className="btn-primary text-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-t border-white/5"
          >
            <div className="section-padding py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-white/5 pt-4 mt-2 flex flex-col gap-2">
                <button
                  onClick={toggleTheme}
                  className="px-4 py-3 text-sm text-gray-300 text-left flex items-center gap-2"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Bright Mode' : 'Dark Mode'}
                </button>

                {user ? (
                  <>
                    <Link
                      to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                      className="px-4 py-3 text-sm text-gray-300"
                    >
                      {isAdmin ? 'Admin Panel' : 'My Dashboard'}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 text-sm text-red-400 text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-3 text-sm text-gray-300"
                    >
                      Login
                    </Link>

                    <Link
                      to="/admin/login"
                      className="px-4 py-3 text-sm text-gray-300"
                    >
                      Admin Login
                    </Link>

                    <Link
                      to="/internship"
                      className="btn-primary text-center text-sm mx-4"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
