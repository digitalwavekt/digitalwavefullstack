import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  ExternalLink,
  Globe,
  Brain,
  ShoppingCart,
  MessageSquare,
  Activity,
  ShieldCheck,
  Zap,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  Database
} from 'lucide-react'
import { apiFetch } from '../lib/api'

const STATUS = {
  'Live': { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: Globe },
  'In Development': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Zap },
  'Planning': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Clock },
  'Internal': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: ShieldCheck },
}

const CATEGORY_STYLES = {
  'AI Platform': { gradient: 'from-purple-600 via-violet-500 to-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'Service Marketplace': { gradient: 'from-blue-600 via-cyan-500 to-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'Agriculture AI': { gradient: 'from-emerald-600 via-green-500 to-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'Communication': { gradient: 'from-pink-600 via-rose-500 to-pink-400', badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  'Lead Marketplace': { gradient: 'from-orange-600 via-amber-500 to-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  'Farmer Products': { gradient: 'from-green-600 via-emerald-500 to-green-400', badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  'FinTech / Trading Research': { gradient: 'from-indigo-600 via-blue-500 to-indigo-400', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  'Health / Emergency': { gradient: 'from-red-600 via-rose-500 to-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  'AI Operations': { gradient: 'from-violet-600 via-purple-500 to-violet-400', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  'Admin System': { gradient: 'from-gray-600 via-slate-500 to-gray-400', badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
}

const ALL_CATEGORIES = [
  'All', 'AI Platform', 'Service Marketplace', 'Agriculture AI', 'Communication',
  'Farmer Products', 'Internal'
]

export default function Projects() {
  const [ref, inView] = useInView({ threshold: 0.05, triggerOnce: true })
  const [activeCategory, setActiveCategory] = useState('All')
  const [hoveredId, setHoveredId] = useState(null)
  
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const res = await apiFetch('/api/projects')
        setProjects(res.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // TODO: When integrating these individual projects in separate repositories,
  // remember to add a "Back to Digital Wave" link/button in each of them.

  const filtered =
    activeCategory === 'All'
      ? projects
      : activeCategory === 'Internal' 
        ? projects.filter(p => p.status === 'Internal')
        : projects.filter((p) => p.category === activeCategory)

  return (
    <>
      <Helmet>
        <title>Projects | Digital Wave IT Solutions</title>
        <meta
          name="description"
          content="A growing ecosystem of AI, SaaS, service, agriculture, communication, and digital transformation products."
        />
      </Helmet>

      <div className="pt-24 pb-16 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
              🚀 Our Portfolio
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Projects Built & Managed by <span className="gradient-text">Digital Wave IT Solutions</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              A growing ecosystem of AI, SaaS, service, agriculture, communication, and digital transformation products.
            </p>
          </motion.div>

          {/* Filter Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {ALL_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* API States */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-400">Loading projects...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-400 font-medium mb-2">Oops! Something went wrong.</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20 glass rounded-3xl border border-white/5">
              <Database className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
              <p className="text-gray-400">Try selecting a different category.</p>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && !error && (
            <div
              ref={ref}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((project, index) => {
                  const style = CATEGORY_STYLES[project.category] || { gradient: 'from-gray-600 via-slate-500 to-gray-400', badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
                  const statusInfo = STATUS[project.status] || { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: Database }
                  const StatusIcon = statusInfo.icon

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      key={project.id}
                      onMouseEnter={() => setHoveredId(project.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="group relative rounded-3xl bg-dark-800/50 border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500 flex flex-col"
                    >
                      {/* Image / Header Area */}
                      <div className="relative h-48 sm:h-56 overflow-hidden bg-dark-900">
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${style.gradient} opacity-20 transition-transform duration-700 group-hover:scale-105`} />
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${style.badge}`}>
                            {project.category}
                          </span>
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {project.status}
                          </span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                          {project.description}
                        </p>

                        {/* Action Area */}
                        <div className="pt-6 border-t border-white/10 mt-auto">
                          {project.projectUrl ? (
                            <a
                              href={project.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm group/btn"
                            >
                              <Globe className="w-4 h-4" />
                              View Project
                              <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <Clock className="w-4 h-4" /> Coming Soon
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Hover Gradient Effect */}
                      <div
                        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-3xl opacity-0 group-hover:opacity-100 ${
                          hoveredId === project.id ? 'ring-1 ring-white/20' : ''
                        }`}
                        style={{
                          background: `radial-gradient(800px circle at 50% 100%, rgba(59, 130, 246, 0.05), transparent 40%)`
                        }}
                      />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
