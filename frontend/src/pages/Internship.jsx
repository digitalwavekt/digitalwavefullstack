import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
  X,
  ArrowRight,
  CheckCircle2,
  Layers,
  Brain,
  Code2,
  Globe,
  Smartphone,
  Database,
  Briefcase,
  Cpu,
  TrendingUp,
  Users,
  Star,
  Zap,
} from 'lucide-react'

const categories = [
  {
    id: 'mern',
    name: 'MERN Stack Development',
    icon: Layers,
    emoji: '🌐',
    tagline: 'Full-Stack JavaScript Powerhouse',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    glowColor: 'shadow-green-500/20',
    textColor: 'text-green-400',
    shortDesc:
      'Build end-to-end web applications using MongoDB, Express.js, React, and Node.js — the industry-standard JavaScript stack.',
    overview:
      'MERN Stack is the most in-demand full-stack technology combination used by startups and enterprises alike. From e-commerce platforms to SaaS products, MERN powers real-world applications at scale.',
    industryUse: [
      'E-Commerce & Marketplace platforms (Amazon, Flipkart clones)',
      'SaaS dashboards and admin portals',
      'Real-time applications (chat apps, collaboration tools)',
      'Job portals, CMS, and booking systems',
    ],
    whatYouGet: [
      'Complete source code with clean architecture',
      'Database schema design with MongoDB',
      'REST API development with Express & Node.js',
      'React frontend with responsive UI',
      'Authentication with JWT & Google OAuth',
      'Deployment-ready production build',
      'Full project documentation & PPT',
      'Viva Q&A preparation guide',
    ],
    skills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'REST APIs', 'JWT Auth', 'Git & GitHub'],
    projectCount: 6,
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    icon: Brain,
    emoji: '🤖',
    tagline: 'Build Intelligent Systems',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20',
    textColor: 'text-purple-400',
    shortDesc:
      'Dive into the future of technology — build predictive models, classification systems, and AI-powered solutions using Python & TensorFlow.',
    overview:
      'Artificial Intelligence and Machine Learning are reshaping every industry from healthcare to finance. This domain teaches you to build real intelligent systems that can predict, classify, and recommend at scale.',
    industryUse: [
      'Healthcare: Disease prediction & diagnostic AI',
      'Finance: Fraud detection & stock prediction models',
      'Retail: Customer recommendation engines',
      'Security: Face recognition & anomaly detection',
    ],
    whatYouGet: [
      'Python-based ML project with full pipeline',
      'Data preprocessing & feature engineering',
      'Model training, testing & evaluation',
      'Scikit-learn / TensorFlow / Keras implementation',
      'Visualization with Matplotlib & Seaborn',
      'Jupyter Notebook with detailed comments',
      'Research paper-style documentation & PPT',
      'Industry-level viva preparation guide',
    ],
    skills: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy', 'Data Visualization', 'Jupyter'],
    projectCount: 6,
  },
  {
    id: 'python',
    name: 'Python Development',
    icon: Code2,
    emoji: '🐍',
    tagline: 'Versatile & Production-Ready',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    glowColor: 'shadow-yellow-500/20',
    textColor: 'text-yellow-400',
    shortDesc:
      'Master Python web development with Django, Flask & FastAPI — building robust backend systems, APIs, and data-driven applications.',
    overview:
      'Python is the world\'s most popular programming language used across web development, automation, data engineering, and more. Build enterprise-grade applications with clean, maintainable code.',
    industryUse: [
      'Backend APIs for mobile & web apps',
      'Hospital, library & inventory management systems',
      'Automation scripts and data pipelines',
      'Government portals and educational platforms',
    ],
    whatYouGet: [
      'Complete Django/Flask web application',
      'Database integration with PostgreSQL/SQLite',
      'User authentication and role-based access',
      'REST API with Django REST Framework',
      'Admin dashboard with CRUD operations',
      'PDF/Excel report generation',
      'Full documentation, PPT & database schema',
      'Deployment guide with Heroku/Render',
    ],
    skills: ['Python', 'Django', 'Flask', 'FastAPI', 'PostgreSQL', 'REST API', 'HTML/CSS'],
    projectCount: 6,
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    icon: Globe,
    emoji: '💻',
    tagline: 'Modern Frontend & Full-Stack',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
    textColor: 'text-blue-400',
    shortDesc:
      'Create stunning, high-performance websites using React, Next.js & Tailwind CSS — from landing pages to full-stack web platforms.',
    overview:
      'Web Development is the backbone of every digital business. Learn to build pixel-perfect, SEO-optimized, and blazing-fast web applications that perform and convert.',
    industryUse: [
      'Corporate websites & digital agencies',
      'SaaS landing pages and marketing sites',
      'Real estate, travel & hospitality portals',
      'Event management and booking platforms',
    ],
    whatYouGet: [
      'React / Next.js application with modern UI',
      'Responsive design using Tailwind CSS',
      'Component-based architecture with best practices',
      'SEO optimization and performance tuning',
      'API integration with external services',
      'Form handling with validation',
      'Full project documentation & presentation',
      'Deployment on Vercel/Netlify guide',
    ],
    skills: ['React.js', 'Next.js', 'Tailwind CSS', 'JavaScript', 'HTML5', 'CSS3', 'Figma Basics'],
    projectCount: 6,
  },
  {
    id: 'app-dev',
    name: 'Mobile App Development',
    icon: Smartphone,
    emoji: '📱',
    tagline: 'Cross-Platform Mobile Apps',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    glowColor: 'shadow-pink-500/20',
    textColor: 'text-pink-400',
    shortDesc:
      'Build cross-platform mobile applications for iOS and Android using React Native & Flutter — ship to both platforms with one codebase.',
    overview:
      'Mobile apps are the primary touchpoint for billions of users worldwide. Build feature-rich, performant mobile applications that work seamlessly on both Android and iOS using modern frameworks.',
    industryUse: [
      'Food delivery and logistics apps',
      'Fintech and banking mobile applications',
      'Healthcare and fitness tracking apps',
      'Social media and community platforms',
    ],
    whatYouGet: [
      'Cross-platform app with React Native / Flutter',
      'Responsive mobile-first UI components',
      'Navigation and state management setup',
      'API integration with backend services',
      'Push notifications and local storage',
      'APK build ready for submission',
      'Full source code with documentation & PPT',
      'Play Store listing guide',
    ],
    skills: ['React Native', 'Flutter', 'Dart', 'JavaScript', 'REST APIs', 'Redux', 'Firebase'],
    projectCount: 6,
  },
  {
    id: 'data-science',
    name: 'Data Science & Analytics',
    icon: Database,
    emoji: '📊',
    tagline: 'Insights from Data at Scale',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    glowColor: 'shadow-indigo-500/20',
    textColor: 'text-indigo-400',
    shortDesc:
      'Transform raw data into actionable insights — data cleaning, visualization, statistical modeling, and business intelligence dashboards.',
    overview:
      'Data Science is the most in-demand skillset across all industries. Companies rely on data scientists to make evidence-based decisions, optimize operations, and predict future trends.',
    industryUse: [
      'Retail: Sales forecasting and customer analytics',
      'Banking: Credit scoring & fraud detection analysis',
      'Healthcare: Patient outcome prediction',
      'Manufacturing: Predictive maintenance & quality control',
    ],
    whatYouGet: [
      'End-to-end data science project in Python',
      'Data cleaning, transformation & EDA',
      'Statistical analysis and hypothesis testing',
      'Interactive dashboards with Plotly / Power BI',
      'Predictive model with evaluation metrics',
      'Jupyter Notebook with step-by-step explanations',
      'Research-quality report, PPT & findings summary',
      'Dataset included with proper attribution',
    ],
    skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'SQL', 'Power BI / Tableau'],
    projectCount: 6,
  },
]

const stats = [
  { icon: Users, value: '500+', label: 'Students Enrolled' },
  { icon: Star, value: '4.9★', label: 'Average Rating' },
  { icon: Briefcase, value: '6', label: 'Tech Domains' },
  { icon: Zap, value: '48hr', label: 'Delivery Time' },
]

export default function Internship() {
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <>
      <Helmet>
        <title>Internship Programs | Digital Wave IT Solutions</title>
        <meta
          name="description"
          content="Explore 6 industry-ready internship program categories — MERN Stack, AI/ML, Python, Web Dev, Mobile Apps, and Data Science. Get real projects with full documentation."
        />
      </Helmet>

      <div className="relative pt-24 pb-16 section-padding">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
              🎓 Industry-Ready Internship Programs
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Choose Your{' '}
              <span className="gradient-text">Tech Domain</span>
            </h1>

            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Select a category to explore what the internship covers, what skills you'll gain,
              and how it maps to real industry applications. Then enroll to get started.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="glass rounded-2xl p-5 text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              )
            })}
          </motion.div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, index) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative group rounded-2xl border p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${cat.borderColor} ${cat.bgColor} shadow-lg ${cat.glowColor}`}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-3xl">{cat.emoji}</span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
                  <p className={`text-xs font-semibold mb-3 ${cat.textColor}`}>{cat.tagline}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{cat.shortDesc}</p>

                  {/* Skills Preview */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {cat.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10"
                      >
                        {skill}
                      </span>
                    ))}
                    {cat.skills.length > 4 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-500">
                        +{cat.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* CTA Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{cat.projectCount} Projects Available</span>
                    <span className={`flex items-center gap-1 text-sm font-medium ${cat.textColor} group-hover:gap-2 transition-all`}>
                      View Details <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Hover glow overlay */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                </motion.div>
              )
            })}
          </div>

          {/* Bottom CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 glass rounded-3xl p-8 md:p-12 text-center border border-white/10"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-medium text-sm">Ready to Build Your Future?</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Pick a domain above and{' '}
              <span className="gradient-text">get enrolled today</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Each program delivers a full industry-level project with source code, documentation, PPT, report,
              viva preparation guide, and deployment support.
            </p>
            <Link
              to="/college-project"
              className="btn-primary inline-flex items-center gap-2"
            >
              Enroll Now <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setSelectedCategory(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d0d1a] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`relative p-8 bg-gradient-to-br ${selectedCategory.color} bg-opacity-20`}>
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/10 to-transparent" />

                <button
                  onClick={() => setSelectedCategory(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedCategory.color} flex items-center justify-center shadow-xl`}>
                    <selectedCategory.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold mb-1 ${selectedCategory.textColor}`}>
                      {selectedCategory.tagline}
                    </p>
                    <h2 className="text-2xl font-bold text-white">{selectedCategory.name}</h2>
                  </div>
                </div>

                <p className="text-gray-200 leading-relaxed text-sm">{selectedCategory.overview}</p>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8">

                {/* Industry Use Cases */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className={`w-5 h-5 ${selectedCategory.textColor}`} />
                    <h4 className="text-white font-semibold">Real Industry Applications</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedCategory.industryUse.map((use, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                        <Cpu className={`w-4 h-4 mt-0.5 shrink-0 ${selectedCategory.textColor}`} />
                        <p className="text-gray-300 text-sm">{use}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What You Get */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <h4 className="text-white font-semibold">What's Included in Your Project</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedCategory.whatYouGet.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <p className="text-gray-300 text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className={`w-5 h-5 ${selectedCategory.textColor}`} />
                    <h4 className="text-white font-semibold">Technologies & Skills Covered</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${selectedCategory.bgColor} ${selectedCategory.textColor} border ${selectedCategory.borderColor}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <Link
                    to="/college-project"
                    onClick={() => setSelectedCategory(null)}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
                  >
                    Get Enrolled for this Program
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    You'll be taken to the project enrollment form. No payment shown upfront.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}