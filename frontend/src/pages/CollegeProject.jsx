import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, Code2, Brain, Database, FlaskConical, 
  ArrowRight, CheckCircle2, Loader2, Layers, FileCode2,
  Cpu, Globe, Smartphone, Server
} from 'lucide-react'
import toast from 'react-hot-toast'

const techStacks = [
  {
    id: 'mern',
    name: 'MERN Stack',
    icon: Layers,
    description: 'MongoDB, Express, React, Node.js - Full-stack JavaScript development',
    projects: [
      'E-Commerce Platform with Payment Gateway',
      'Social Media Dashboard',
      'Blog Management System',
      'Real-time Chat Application',
      'Job Portal with Admin Panel',
      'Online Learning Management System',
    ],
    price: 4999,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    icon: Brain,
    description: 'Python, TensorFlow, Scikit-learn - Intelligent systems and predictive models',
    projects: [
      'Sentiment Analysis Tool',
      'Image Classification System',
      'Spam Email Detection',
      'Movie Recommendation Engine',
      'Face Recognition Attendance',
      'Stock Price Predictor',
    ],
    price: 5999,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    id: 'python',
    name: 'Python Development',
    icon: Code2,
    description: 'Django, Flask, FastAPI - Robust backend and data processing solutions',
    projects: [
      'Library Management System',
      'Hospital Management Portal',
      'Online Quiz Platform',
      'Expense Tracker with Charts',
      'Weather Forecast App',
      'URL Shortener Service',
    ],
    price: 4499,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    icon: Globe,
    description: 'React, Next.js, Tailwind - Modern frontend and full-stack web apps',
    projects: [
      'Portfolio Website Generator',
      'Restaurant Booking System',
      'Event Management Platform',
      'Travel Booking Website',
      'Online Resume Builder',
      'News Aggregator App',
    ],
    price: 3999,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    id: 'app-dev',
    name: 'Mobile App Development',
    icon: Smartphone,
    description: 'React Native, Flutter - Cross-platform mobile applications',
    projects: [
      'Fitness Tracker App',
      'Food Delivery Mobile App',
      'Notes & Todo App',
      'Music Player Application',
      'E-Commerce Mobile App',
      'Social Media App',
    ],
    price: 5499,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
  {
    id: 'data-science',
    name: 'Data Science',
    icon: Database,
    description: 'Pandas, NumPy, Matplotlib - Data analysis and visualization',
    projects: [
      'Sales Data Analysis Dashboard',
      'Customer Segmentation',
      'Credit Card Fraud Detection',
      'Titanic Survival Prediction',
      'COVID-19 Data Analysis',
      'House Price Prediction',
    ],
    price: 4999,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
  },
]

export default function CollegeProject() {
  const [selectedStack, setSelectedStack] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    year: '',
    rollNumber: '',
    projectTitle: '',
    requirements: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedStack || !selectedProject) {
      toast.error('Please select a tech stack and project')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/college-project/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          stackId: selectedStack.id,
          projectName: selectedProject,
          amount: selectedStack.price,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Project request submitted! Redirecting to payment...')
        // Redirect to PayU payment
        window.location.href = data.paymentUrl
      } else {
        toast.error(data.message || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>College Projects | Digital Wave IT Solutions</title>
        <meta name="description" content="Get industry-standard final year projects with complete documentation and source code. MERN, AI/ML, Python, and more." />
      </Helmet>

      <div className="relative pt-24 pb-16 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              College Projects
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Final Year <span className="gradient-text">Project Solutions</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Industry-standard projects with complete source code, documentation, and guidance. 
              Choose your stack and get started today.
            </p>
          </motion.div>

          {/* Tech Stack Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {techStacks.map((stack, index) => (
              <motion.div
                key={stack.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setSelectedStack(stack)
                  setSelectedProject(null)
                }}
                className={`relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 ${
                  selectedStack?.id === stack.id
                    ? `${stack.borderColor} ${stack.bgColor} shadow-lg`
                    : 'border-white/10 bg-dark-800/50 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stack.color} flex items-center justify-center`}>
                    <stack.icon className="w-6 h-6 text-white" />
                  </div>
                  {selectedStack?.id === stack.id && (
                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{stack.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{stack.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{stack.projects.length} Projects</span>
                  <span className="text-white font-bold">₹{stack.price.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Project Selection */}
          {selectedStack && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-8 mb-12"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                Available {selectedStack.name} Projects
              </h3>
              <p className="text-gray-400 text-sm mb-6">Select a project that matches your requirements</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedStack.projects.map((project, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedProject(project)}
                    className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                      selectedProject === project
                        ? 'bg-blue-500/10 border border-blue-500/30 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <FileCode2 className={`w-5 h-5 shrink-0 ${
                      selectedProject === project ? 'text-blue-400' : 'text-gray-500'
                    }`} />
                    <span className="text-sm">{project}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Student Form */}
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">Student Details</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">College Name *</label>
                    <input
                      type="text"
                      name="college"
                      required
                      value={formData.college}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="Your College Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Branch *</label>
                    <select
                      name="branch"
                      required
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    >
                      <option value="" className="bg-dark-800">Select Branch</option>
                      <option value="CSE" className="bg-dark-800">Computer Science</option>
                      <option value="IT" className="bg-dark-800">Information Technology</option>
                      <option value="ECE" className="bg-dark-800">Electronics</option>
                      <option value="ME" className="bg-dark-800">Mechanical</option>
                      <option value="CE" className="bg-dark-800">Civil</option>
                      <option value="Other" className="bg-dark-800">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Year *</label>
                    <select
                      name="year"
                      required
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    >
                      <option value="" className="bg-dark-800">Select Year</option>
                      <option value="1" className="bg-dark-800">1st Year</option>
                      <option value="2" className="bg-dark-800">2nd Year</option>
                      <option value="3" className="bg-dark-800">3rd Year</option>
                      <option value="4" className="bg-dark-800">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Roll Number *</label>
                    <input
                      type="text"
                      name="rollNumber"
                      required
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="College Roll Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Project Title</label>
                    <input
                      type="text"
                      name="projectTitle"
                      value={formData.projectTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="Custom project title (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Additional Requirements</label>
                  <textarea
                    name="requirements"
                    rows={4}
                    value={formData.requirements}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    placeholder="Any specific requirements or features you need..."
                  />
                </div>

                {/* Summary */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Selected Project</p>
                      <p className="text-white font-medium">{selectedProject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Amount</p>
                      <p className="text-2xl font-bold text-white">₹{selectedStack.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Includes: Source Code, Documentation, PPT, Report, Video Demo
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
