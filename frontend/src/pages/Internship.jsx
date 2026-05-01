import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { 
  GraduationCap, Calendar, Clock, Users, Award, 
  CheckCircle2, ArrowRight, BookOpen, Video, FileCheck,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

const courses = [
  {
    id: 'mern',
    name: 'MERN Stack Development',
    description: 'Master MongoDB, Express, React, and Node.js. Build full-stack applications from scratch.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 2999,
    features: ['Live Google Meet Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '💻',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description: 'Learn Python, TensorFlow, and build intelligent systems with hands-on ML projects.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 3499,
    features: ['Live Google Meet Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '🤖',
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 'python',
    name: 'Python Development',
    description: 'Comprehensive Python programming with Django, Flask, and data analysis.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 2499,
    features: ['Live Google Meet Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '🐍',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    description: 'Frontend and backend development with React, Next.js, and modern web technologies.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 2799,
    features: ['Live Google Meet Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '🌐',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'app-dev',
    name: 'Mobile App Development',
    description: 'Build cross-platform mobile apps with React Native and Flutter.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 3299,
    features: ['Live Google Meet Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '📱',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Data analysis, visualization, and predictive modeling with Python and SQL.',
    duration: [1, 2, 3, 6],
    pricePerMonth: 2999,
    features: ['Live Google Meet Classes', 'Real Projects', 'Certificate', 'Placement Support'],
    icon: '📊',
    color: 'from-indigo-500 to-blue-500',
  },
]

export default function Internship() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(1)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        // Send token to backend to verify and get user info
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        })
        const data = await res.json()

        if (data.success) {
          localStorage.setItem('token', data.token)
          setStep(2)
          toast.success('Login successful!')
        }
      } catch (error) {
        toast.error('Login failed. Please try again.')
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

    setLoading(true)
    try {
      const totalAmount = selectedCourse.pricePerMonth * selectedDuration

      // Initiate PayU payment
      const res = await fetch(`${import.meta.env.VITE_API_URL}/payment/initiate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: totalAmount,
          courseId: selectedCourse.id,
          duration: selectedDuration,
          type: 'internship',
        }),
      })

      const data = await res.json()

      if (data.success && data.paymentUrl) {
        // Redirect to PayU payment page
        window.location.href = data.paymentUrl
      } else {
        toast.error('Payment initiation failed')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Internship Programs | Digital Wave IT Solutions</title>
        <meta name="description" content="Apply for industry-ready internship programs in MERN, AI/ML, Python, Web Development and more." />
      </Helmet>

      <div className="relative pt-24 pb-16 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
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
              Gain hands-on experience with real projects. Choose your stack, select duration, 
              and get certified with live mentorship via Google Meet.
            </p>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {[
              { icon: GraduationCap, step: '1', title: 'Choose Course', desc: 'Select your tech stack' },
              { icon: Calendar, step: '2', title: 'Select Duration', desc: '1 to 6 months' },
              { icon: Video, step: '3', title: 'Google Meet Login', desc: 'Get your credentials' },
              { icon: Award, step: '4', title: 'Get Certified', desc: 'Download certificate' },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-blue-400 font-medium mb-1">Step {item.step}</p>
                <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Course Selection */}
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
                className={`relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 ${
                  selectedCourse?.id === course.id
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
                  {course.features.map((f, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    <span className="text-white font-bold">₹{course.pricePerMonth.toLocaleString()}</span>/month
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Duration Selection */}
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-8 mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">Select Duration</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {selectedCourse.duration.map((months) => (
                  <button
                    key={months}
                    onClick={() => setSelectedDuration(months)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      selectedDuration === months
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

          {/* Action Buttons */}
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
                    <Loader2 className="w-5 h-5 animate-spin" />
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
                    <Loader2 className="w-5 h-5 animate-spin" />
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
