import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useGoogleLogin } from '@react-oauth/google'
import {
  GraduationCap,
  Calendar,
  Award,
  CheckCircle2,
  ArrowRight,
  Video,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

const courses = [
  {
    id: 'mern',
    name: 'MERN Stack Development',
    description:
      'Master MongoDB, Express, React, and Node.js. Build full-stack applications from scratch.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 2999,
    features: ['Live Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '💻',
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description:
      'Learn Python, TensorFlow, and build intelligent systems with hands-on ML projects.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 3499,
    features: ['Live Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '🤖',
  },
  {
    id: 'python',
    name: 'Python Development',
    description:
      'Comprehensive Python programming with Django, Flask, and data analysis.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 2499,
    features: ['Live Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '🐍',
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    description:
      'Frontend and backend development with React, Next.js, and modern web technologies.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 2799,
    features: ['Live Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '🌐',
  },
  {
    id: 'app-dev',
    name: 'Mobile App Development',
    description: 'Build cross-platform mobile apps with React Native and Flutter.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 3299,
    features: ['Live Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '📱',
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description:
      'Data analysis, visualization, and predictive modeling with Python and SQL.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 2999,
    features: ['Live Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '📊',
  },
]

export default function Internship() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(1)
  const [step, setStep] = useState(localStorage.getItem('token') ? 2 : 1)
  const [loading, setLoading] = useState(false)

  const submitPayuForm = ({ action, payload }) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = action

    Object.entries(payload).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value ?? ''
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)

      try {
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Google login failed')
        }

        localStorage.setItem('token', data.token)
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user))

        setStep(2)
        toast.success('Login successful!')
      } catch (error) {
        toast.error(error.message || 'Login failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      toast.error('Google login failed')
    },
  })

  const handlePayment = async () => {
    if (!selectedCourse || !selectedDuration) {
      toast.error('Please select a course and duration')
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      toast.error('Please login first')
      setStep(1)
      return
    }

    setLoading(true)

    try {
      const totalAmount = selectedCourse.pricePerMonth * selectedDuration

      const user = JSON.parse(localStorage.getItem('user') || '{}')

      const res = await fetch(`${API_BASE}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalAmount,
          email: user.email || '',
          name: user.name || user.fullName || 'Digital Wave Student',
          phone: user.phone || '9999999999',
          type: 'internship',
          referenceId: `${selectedCourse.id}_${selectedDuration}_month`,
          productInfo: `${selectedCourse.name} - ${selectedDuration} Month`,
          courseId: selectedCourse.id,
          duration: selectedDuration,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment initiation failed')
      }

      if (!data.data?.action || !data.data?.payload) {
        throw new Error('Invalid payment gateway response')
      }

      submitPayuForm(data.data)
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Internship Programs | Digital Wave IT Solutions</title>
        <meta
          name="description"
          content="Apply for industry-ready internship programs in MERN, AI/ML, Python, Web Development and more."
        />
      </Helmet>

      <div className="relative pt-24 pb-16 section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
              Internship Programs
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Industry-Ready <span className="gradient-text">Internship Courses</span>
            </h1>

            <p className="text-gray-400 max-w-2xl mx-auto">
              Gain hands-on experience with real projects. Choose your stack,
              select duration, and get certified with live mentorship.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {[
              {
                icon: GraduationCap,
                step: '1',
                title: 'Choose Course',
                desc: 'Select your tech stack',
              },
              {
                icon: Calendar,
                step: '2',
                title: 'Select Duration',
                desc: '1 to 6 months',
              },
              {
                icon: Video,
                step: '3',
                title: 'Login',
                desc: 'Verify your account',
              },
              {
                icon: Award,
                step: '4',
                title: 'Get Certified',
                desc: 'Download certificate',
              },
            ].map((item, i) => {
              const Icon = item.icon

              return (
                <div key={i} className="glass rounded-2xl p-5 text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-blue-400 font-medium mb-1">
                    Step {item.step}
                  </p>
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {item.title}
                  </h4>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              )
            })}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setSelectedCourse(course)
                  setSelectedDuration(course.duration[0])
                }}
                className={`relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 ${selectedCourse?.id === course.id
                    ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10'
                    : 'border-white/10 bg-dark-800/50 hover:border-white/20'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{course.icon}</span>
                  {selectedCourse?.id === course.id && (
                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{course.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{course.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {course.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-gray-400">
                  <span className="text-white font-bold">
                    ₹{course.pricePerMonth.toLocaleString()}
                  </span>
                  /month
                </p>
              </motion.div>
            ))}
          </div>

          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-8 mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">
                Select Duration
              </h3>

              <div className="flex flex-wrap gap-3 mb-6">
                {selectedCourse.duration.map((months) => (
                  <button
                    key={months}
                    onClick={() => setSelectedDuration(months)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${selectedDuration === months
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                      }`}
                  >
                    {months} Month{months > 1 ? 's' : ''}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-gray-400 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{(selectedCourse.pricePerMonth * selectedDuration).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-gray-400 text-sm">Course</p>
                  <p className="text-white font-medium">{selectedCourse.name}</p>
                </div>
              </div>
            </motion.div>
          )}

          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {step === 1 ? (
                <button
                  onClick={() => handleGoogleLogin()}
                  disabled={loading}
                  className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Login with Google
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirecting to PayU...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}