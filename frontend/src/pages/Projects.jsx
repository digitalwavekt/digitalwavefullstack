import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  ExternalLink,
  Github,
  ArrowRight,
  Globe,
  Smartphone,
  Brain,
  Layers,
  BarChart3,
  ShoppingCart,
  Activity,
  Building2,
  Truck,
  GraduationCap,
  MessageSquare,
  Warehouse,
  Home,
  Dumbbell,
  Eye,
  Clock,
  CheckCircle,
  Zap,
} from 'lucide-react'

const STATUS = {
  LIVE: { label: 'Live', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', dot: 'bg-green-400' },
  ONGOING: { label: 'Ongoing', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', dot: 'bg-yellow-400' },
  COMPLETED: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', dot: 'bg-orange-400' },
}

const CATEGORY_STYLES = {
  'Web Development': {
    gradient: 'from-blue-600 via-cyan-500 to-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  'Mobile App': {
    gradient: 'from-pink-600 via-rose-500 to-pink-400',
    badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  'AI/ML': {
    gradient: 'from-purple-600 via-violet-500 to-purple-400',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  'CRM': {
    gradient: 'from-emerald-600 via-green-500 to-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  'College Project': {
    gradient: 'from-indigo-600 via-blue-500 to-indigo-400',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
}

const projects = [
  {
    title: 'UrbanCart — E-Commerce Platform',
    category: 'Web Development',
    icon: ShoppingCart,
    status: 'LIVE',
    year: '2024',
    client: 'Retail Startup, Delhi',
    description:
      'Multi-vendor e-commerce platform with real-time inventory tracking, PayU payment gateway, seller dashboard, customer reviews, and a dynamic admin panel managing 5,000+ SKUs.',
    impact: 'Processed ₹12L+ in orders within 3 months of launch',
    tech: ['React', 'Node.js', 'MongoDB', 'PayU', 'Redis', 'Cloudinary'],
    demo: '#',
    github: '#',
  },
  {
    title: 'MedTrack — Healthcare CRM',
    category: 'CRM',
    icon: Activity,
    status: 'LIVE',
    year: '2024',
    client: 'Multispecialty Clinic, Jaipur',
    description:
      'End-to-end CRM for a 12-doctor clinic — patient registration, appointment scheduling, prescription management, billing, lab report uploads, and WhatsApp notification integration.',
    impact: 'Reduced appointment no-shows by 40% with automated reminders',
    tech: ['Next.js', 'PostgreSQL', 'Prisma', 'Twilio', 'Docker', 'AWS S3'],
    demo: '#',
    github: '#',
  },
  {
    title: 'QuickBite — Food Delivery App',
    category: 'Mobile App',
    icon: Truck,
    status: 'ONGOING',
    year: '2024',
    client: 'Cloud Kitchen Chain, Pune',
    description:
      'Cross-platform food delivery app with live order tracking via Google Maps, multiple payment options, push notifications, restaurant admin dashboard, and delivery partner app.',
    impact: 'Serving 300+ daily orders across 4 cities',
    tech: ['React Native', 'Firebase', 'Google Maps API', 'Razorpay', 'Expo'],
    demo: '#',
    github: '#',
  },
  {
    title: 'SentimentAI — Customer Insight Engine',
    category: 'AI/ML',
    icon: Brain,
    status: 'COMPLETED',
    year: '2023',
    client: 'D2C Brand, Bangalore',
    description:
      'NLP-powered sentiment analysis tool that processes product reviews, social media comments, and support tickets. Classifies feedback into positive/negative/neutral with trend dashboards.',
    impact: 'Analyzed 50,000+ reviews, cutting manual QA effort by 70%',
    tech: ['Python', 'BERT', 'FastAPI', 'React', 'MongoDB', 'Celery'],
    demo: '#',
    github: '#',
  },
  {
    title: 'EduPortal — Student Management System',
    category: 'College Project',
    icon: GraduationCap,
    status: 'LIVE',
    year: '2024',
    client: 'Engineering College, Rajasthan',
    description:
      'Full-stack academic portal with student login, attendance tracking, grade management, fee payment integration, notice board, and faculty dashboard for 2,000+ students.',
    impact: 'Adopted by 3 departments, replaced 100% manual paperwork',
    tech: ['MERN Stack', 'Socket.io', 'JWT', 'PayU', 'Cloudinary'],
    demo: '#',
    github: '#',
  },
  {
    title: 'PropFinder — Real Estate Portal',
    category: 'Web Development',
    icon: Home,
    status: 'LIVE',
    year: '2023',
    client: 'Real Estate Agency, Mumbai',
    description:
      'Property listing platform with advanced search filters, virtual tour integration, mortgage EMI calculator, agent profiles, lead management, and SEO-optimised property pages.',
    impact: '2,000+ monthly visitors, 150+ leads generated in Q1',
    tech: ['Next.js', 'Django REST', 'PostgreSQL', 'AWS S3', 'Mapbox'],
    demo: '#',
    github: '#',
  },
  {
    title: 'FitSync — Fitness Tracker App',
    category: 'Mobile App',
    icon: Dumbbell,
    status: 'COMPLETED',
    year: '2023',
    client: 'Fitness Startup, Hyderabad',
    description:
      'Health tracking app with custom workout plans, calorie counter, progress charts, coach chat feature, BMI tracker, and wearable device sync via Bluetooth and HealthKit APIs.',
    impact: '1,200+ active users, 4.6★ rating on Play Store',
    tech: ['Flutter', 'Firebase', 'HealthKit', 'BLE', 'Dart', 'Charts_fl'],
    demo: '#',
    github: '#',
  },
  {
    title: 'StockPilot — Inventory Management',
    category: 'CRM',
    icon: Warehouse,
    status: 'ONGOING',
    year: '2024',
    client: 'FMCG Distributor, Ahmedabad',
    description:
      'Enterprise inventory system with barcode/QR scanning, auto stock alerts, multi-warehouse support, supplier management, purchase orders, and sales analytics with export reports.',
    impact: 'Managing ₹2Cr+ inventory across 3 warehouses',
    tech: ['React', 'Node.js', 'MySQL', 'Redis', 'Express', 'jsPDF'],
    demo: '#',
    github: '#',
  },
  {
    title: 'FaceID Attendance — AI Recognition',
    category: 'AI/ML',
    icon: Eye,
    status: 'IN_PROGRESS',
    year: '2024',
    client: 'Corporate Office, Noida',
    description:
      'Real-time face recognition attendance system using deep learning. Detects and verifies employee faces from live camera feed, logs attendance with timestamps, and generates daily/weekly reports.',
    impact: 'Target: 500-employee deployment replacing manual biometric',
    tech: ['Python', 'OpenCV', 'DeepFace', 'Flask', 'React', 'SQLite'],
    demo: '#',
    github: '#',
  },
  {
    title: 'BuilderBot — AI Support Chatbot',
    category: 'AI/ML',
    icon: MessageSquare,
    status: 'LIVE',
    year: '2023',
    client: 'Construction Firm, Chennai',
    description:
      'AI-powered WhatsApp and web chatbot for a construction company. Handles 200+ FAQ types, captures leads, schedules site visits, and escalates to human agents with full conversation history.',
    impact: 'Handled 3,000+ queries/month with 92% resolution rate',
    tech: ['Python', 'Rasa NLP', 'Twilio', 'FastAPI', 'PostgreSQL', 'React'],
    demo: '#',
    github: '#',
  },
  {
    title: 'SalesForge — B2B CRM Platform',
    category: 'CRM',
    icon: BarChart3,
    status: 'ONGOING',
    year: '2024',
    client: 'SaaS Agency, Bangalore',
    description:
      'Custom B2B CRM with lead pipeline management, email campaign integration, deal tracking, sales forecast analytics, team activity logs, and Slack/Gmail sync for sales teams.',
    impact: 'Tracking ₹80L+ pipeline for 6-member sales team',
    tech: ['Next.js', 'Prisma', 'PostgreSQL', 'SendGrid', 'Recharts', 'Vercel'],
    demo: '#',
    github: '#',
  },
  {
    title: 'CampusConnect — College Social App',
    category: 'College Project',
    icon: Building2,
    status: 'COMPLETED',
    year: '2023',
    client: 'University Project, MP',
    description:
      'Social networking and notice board app for college students with event management, club registration, inter-department forums, job board, and alumni connect module.',
    impact: 'Won Best Final Year Project Award, adopted by 800+ students',
    tech: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Cloudinary', 'JWT'],
    demo: '#',
    github: '#',
  },
]

const categories = ['All', 'Web Development', 'Mobile App', 'CRM', 'AI/ML', 'College Project']

const statusIcons = {
  LIVE: CheckCircle,
  ONGOING: Zap,
  COMPLETED: Globe,
  IN_PROGRESS: Clock,
}

export default function Projects() {
  const [ref, inView] = useInView({ threshold: 0.05, triggerOnce: true })
  const [activeCategory, setActiveCategory] = useState('All')
  const [hoveredId, setHoveredId] = useState(null)

  const filtered =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  return (
    <>
      <Helmet>
        <title>Our Projects | Digital Wave IT Solutions</title>
        <meta
          name="description"
          content="Explore Digital Wave's portfolio — real-world projects in web development, mobile apps, AI/ML, CRM systems and college final year projects."
        />
      </Helmet>

      <div className="relative pt-24 pb-20 section-padding">
        <div className="max-w-7xl mx-auto">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              🚀 Real Work. Real Impact.
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Our <span className="gradient-text">Project Portfolio</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Every project here is real — built for actual clients, deployed in production,
              and solving genuine business problems. No mockups, no demos-only.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { value: '50+', label: 'Projects Delivered', icon: CheckCircle },
              { value: '30+', label: 'Happy Clients', icon: Globe },
              { value: '12+', label: 'Industries Served', icon: Building2 },
              { value: '5', label: 'Tech Domains', icon: Layers },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="glass rounded-2xl p-5 text-center">
                  <Icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              )
            })}
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={ref}>
            <AnimatePresence mode="popLayout">
              {filtered.map((project, index) => {
                const catStyle = CATEGORY_STYLES[project.category]
                const status = STATUS[project.status]
                const StatusIcon = statusIcons[project.status]
                const ProjectIcon = project.icon

                return (
                  <motion.div
                    key={project.title}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    onHoverStart={() => setHoveredId(project.title)}
                    onHoverEnd={() => setHoveredId(null)}
                    className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d1a] hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  >
                    {/* Card Visual Header */}
                    <div className="relative h-44 overflow-hidden">
                      {/* Gradient BG */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${catStyle.gradient} opacity-80`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-transparent" />

                      {/* Grid pattern overlay */}
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                          backgroundSize: '24px 24px',
                        }}
                      />

                      {/* Big icon background */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ProjectIcon className="w-28 h-28 text-white/10" />
                      </div>

                      {/* Status badge — top right */}
                      <div className="absolute top-4 right-4 z-10">
                        <span
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color} border ${status.border} backdrop-blur-sm`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                          {status.label}
                        </span>
                      </div>

                      {/* Year — top left */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-2 py-1 rounded-md text-xs text-white/60 bg-black/20 backdrop-blur-sm">
                          {project.year}
                        </span>
                      </div>

                      {/* Icon — bottom left overlap */}
                      <div className="absolute -bottom-5 left-5 z-10">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${catStyle.gradient} flex items-center justify-center shadow-xl border-2 border-[#0d0d1a]`}>
                          <ProjectIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Hover overlay — links */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredId === project.title ? 1 : 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center gap-4"
                      >
                        <a
                          href={project.demo}
                          onClick={(e) => e.preventDefault()}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-blue-500 text-white text-xs font-medium transition-colors border border-white/20"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Live Demo
                        </a>
                        <a
                          href={project.github}
                          onClick={(e) => e.preventDefault()}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-purple-500 text-white text-xs font-medium transition-colors border border-white/20"
                        >
                          <Github className="w-4 h-4" />
                          Source
                        </a>
                      </motion.div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 pt-8">
                      {/* Category badge */}
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${catStyle.badge} mb-3`}
                      >
                        {project.category}
                      </span>

                      <h3 className="text-base font-bold text-white mb-1 leading-tight">
                        {project.title}
                      </h3>

                      <p className="text-xs text-gray-500 mb-3">📍 {project.client}</p>

                      <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      {/* Impact line */}
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                        <StatusIcon className={`w-4 h-4 mt-0.5 shrink-0 ${status.color}`} />
                        <p className={`text-xs font-medium ${status.color}`}>{project.impact}</p>
                      </div>

                      {/* Tech stack */}
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="text-xs text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 glass rounded-3xl p-8 md:p-12 text-center border border-white/10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Have a project in mind?
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">
              We build production-grade applications tailored to your business needs —
              from MVP to enterprise scale.
            </p>
            <a
              href="/contact"
              className="btn-primary inline-flex items-center gap-2"
            >
              Start a Project <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </>
  )
}
