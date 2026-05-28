import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, CheckCircle2, Loader2,
  FileCode2, GraduationCap, Briefcase, Clock, Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../lib/api'

const ENROLLMENT_TYPES = [
  {
    id: 'project_only',
    title: 'Project Only',
    subtitle: '7-Day Delivery',
    icon: Briefcase,
    color: 'from-orange-500 to-amber-500',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    features: [
      'Complete source code',
      'Documentation & PPT',
      'Report & viva guide',
      'Installation guide',
      'Fixed 7-day delivery',
    ],
  },
  {
    id: 'internship_project',
    title: 'Internship + Project',
    subtitle: 'Full Program',
    icon: GraduationCap,
    color: 'from-blue-500 to-purple-500',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    features: [
      'Live mentorship classes',
      'Real project + source code',
      'Documentation & PPT',
      'Certificate on completion',
      'Choose 1-6 month duration',
    ],
  },
]

export default function CollegeProject() {
  const [step, setStep] = useState(1)
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  const [enrollmentType, setEnrollmentType] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(1)

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', college: '',
    branch: '', year: '', rollNumber: '', projectTitle: '', requirements: '',
  })

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiFetch('/api/admin/courses/public')
        setCourses(data.data || [])
      } catch {
        toast.error('Failed to load courses')
      } finally {
        setLoadingCourses(false)
      }
    }
    fetchCourses()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const computePrice = () => {
    if (!selectedCourse) return 0
    if (enrollmentType === 'project_only') return selectedCourse.projectPrice || 0
    return (selectedCourse.pricePerMonth || 0) * selectedDuration
  }

  const computeDeadline = () => {
    if (enrollmentType === 'project_only') return '7 days from enrollment'
    return `${selectedDuration} month${selectedDuration > 1 ? 's' : ''} from enrollment`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!enrollmentType || !selectedCourse || !selectedProject) {
      toast.error('Please complete all selection steps')
      return
    }
    setLoading(true)
    try {
      const deadline = enrollmentType === 'project_only'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null

      const payload = {
        orderType: enrollmentType === 'internship_project' ? 'internship' : 'project',
        name: formData.name, email: formData.email, phone: formData.phone,
        studentName: formData.name, studentEmail: formData.email, studentPhone: formData.phone,
        college: formData.college, branch: formData.branch,
        year: formData.year, rollNumber: formData.rollNumber,
        title: formData.projectTitle || selectedProject,
        projectTitle: formData.projectTitle || selectedProject,
        projectName: selectedProject,
        internshipProgramType: selectedCourse.id,
        techStack: selectedCourse.name,
        projectDomain: selectedCourse.name,
        features: formData.requirements ? formData.requirements.split('\n').map(s => s.trim()).filter(Boolean) : [],
        requirements: formData.requirements,
        customNotes: formData.requirements,
        documentationRequired: true, pptRequired: true, deploymentRequired: true,
        amount: computePrice(),
        totalAmount: computePrice(),
        deadline,
        duration: enrollmentType === 'internship_project' ? selectedDuration : null,
        enrollmentType,
      }

      const data = await apiFetch('/api/ai-project-delivery/submit', {
        method: 'POST', body: JSON.stringify(payload),
      })

      toast.success('Enrollment submitted successfully!')
      navigate('/student/ai-projects', {
        state: {
          orderId: data.data?.id || data.order?.id || data.projectId,
          studentEmail: formData.email,
        },
      })
    } catch (error) {
      toast.error(error.message || 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canGoNext = () => {
    if (step === 1) return !!enrollmentType
    if (step === 2) return !!selectedCourse
    if (step === 3) return !!selectedProject && (enrollmentType !== 'internship_project' || !!selectedDuration)
    return true
  }

  return (
    <>
      <Helmet>
        <title>Enroll Now | Digital Wave IT Solutions</title>
        <meta name="description" content="Enroll for industry-standard projects or internship programs with complete documentation and AI-powered delivery." />
      </Helmet>

      <div className="relative pt-24 pb-16 section-padding">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              🎓 Student Enrollment
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Get Your <span className="gradient-text">Project Started</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Choose your enrollment type, select a course and project, fill in your details.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {['Type', 'Course', 'Project', 'Details'].map((label, i) => {
              const stepNum = i + 1
              const active = step === stepNum
              const done = step > stepNum
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    done ? 'bg-green-500 text-white' : active ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                  {i < 3 && <div className={`w-8 h-0.5 ${done ? 'bg-green-500' : 'bg-white/10'}`} />}
                </div>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Enrollment Type */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-xl font-bold text-white mb-6 text-center">Choose Enrollment Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ENROLLMENT_TYPES.map((type) => {
                    const Icon = type.icon
                    const selected = enrollmentType === type.id
                    return (
                      <div
                        key={type.id}
                        onClick={() => setEnrollmentType(type.id)}
                        className={`relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          selected ? `${type.border} ${type.bg} shadow-xl` : 'border-white/10 bg-dark-800/50 hover:border-white/20'
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-4 right-4"><CheckCircle2 className={`w-6 h-6 ${type.text}`} /></div>
                        )}
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{type.title}</h3>
                        <p className={`text-xs font-semibold mb-4 ${type.text}`}>{type.subtitle}</p>
                        <ul className="space-y-2">
                          {type.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Choose Course */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-xl font-bold text-white mb-6 text-center">Choose Your Course</h2>
                {loadingCourses ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No courses available yet. Please check back later.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course) => {
                      const selected = selectedCourse?.id === course.id
                      const price = enrollmentType === 'project_only'
                        ? `₹${Number(course.projectPrice || 0).toLocaleString()} (one-time)`
                        : `₹${Number(course.pricePerMonth || 0).toLocaleString()}/month`
                      return (
                        <div
                          key={course.id}
                          onClick={() => { setSelectedCourse(course); setSelectedProject(null) }}
                          className={`rounded-2xl border p-5 cursor-pointer transition-all duration-300 ${
                            selected ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10' : 'border-white/10 bg-dark-800/50 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-white font-bold">{course.name}</h3>
                            {selected && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                          </div>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{course.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{(course.projectsList || []).length} projects</span>
                            <span className="text-sm font-semibold text-white">{price}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Choose Project + Duration */}
            {step === 3 && selectedCourse && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-xl font-bold text-white mb-2 text-center">Choose Your Project</h2>
                <p className="text-gray-400 text-sm text-center mb-6">from {selectedCourse.name}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {(selectedCourse.projectsList || []).map((project, i) => (
                    <button
                      key={i} type="button"
                      onClick={() => setSelectedProject(project)}
                      className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                        selectedProject === project
                          ? 'bg-blue-500/10 border border-blue-500/30 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <FileCode2 className={`w-5 h-5 shrink-0 ${selectedProject === project ? 'text-blue-400' : 'text-gray-500'}`} />
                      <span className="text-sm">{project}</span>
                    </button>
                  ))}
                  {(selectedCourse.projectsList || []).length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">No projects defined for this course yet.</div>
                  )}
                </div>

                {/* Duration selector for internship */}
                {enrollmentType === 'internship_project' && (
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" /> Select Duration
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {(selectedCourse.duration || [1, 2, 3, 6]).map((months) => (
                        <button
                          key={months}
                          onClick={() => setSelectedDuration(months)}
                          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                            selectedDuration === months
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                              : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {months} Month{months > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price summary */}
                {selectedProject && (
                  <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Amount</p>
                        <p className="text-2xl font-bold text-white">₹{computePrice().toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Delivery</p>
                        <p className="text-white font-medium flex items-center gap-1">
                          {enrollmentType === 'project_only' ? <Zap className="w-4 h-4 text-orange-400" /> : <Clock className="w-4 h-4 text-blue-400" />}
                          {computeDeadline()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: Student Details Form */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="glass rounded-2xl p-8 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-6">Student Details</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField label="Full Name *" name="name" value={formData.name} onChange={handleInputChange} required />
                      <InputField label="Email *" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                      <InputField label="Phone *" name="phone" value={formData.phone} onChange={handleInputChange} required />
                      <InputField label="College Name *" name="college" value={formData.college} onChange={handleInputChange} required />
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Branch *</label>
                        <select name="branch" required value={formData.branch} onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50">
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
                        <select name="year" required value={formData.year} onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50">
                          <option value="" className="bg-dark-800">Select Year</option>
                          <option value="1" className="bg-dark-800">1st Year</option>
                          <option value="2" className="bg-dark-800">2nd Year</option>
                          <option value="3" className="bg-dark-800">3rd Year</option>
                          <option value="4" className="bg-dark-800">4th Year</option>
                        </select>
                      </div>
                      <InputField label="Roll Number *" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} required />
                      <InputField label="Custom Project Title" name="projectTitle" value={formData.projectTitle} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Additional Requirements</label>
                      <textarea name="requirements" rows={3} value={formData.requirements} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
                        placeholder="e.g. admin panel, charts, PDF report..." />
                    </div>

                    {/* Summary */}
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Type</span>
                        <span className="text-white font-medium">{enrollmentType === 'project_only' ? 'Project Only (7 days)' : 'Internship + Project'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Course</span>
                        <span className="text-white font-medium">{selectedCourse?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Project</span>
                        <span className="text-white font-medium truncate ml-4">{selectedProject}</span>
                      </div>
                      {enrollmentType === 'internship_project' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Duration</span>
                          <span className="text-white font-medium">{selectedDuration} Month{selectedDuration > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                        <span className="text-gray-400">Total</span>
                        <span className="text-xl font-bold text-white">₹{computePrice().toLocaleString()}</span>
                      </div>
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 py-4 text-base">
                      {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <>Submit Enrollment <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < 4 && (
              <button
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                disabled={!canGoNext()}
                className="btn-primary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function InputField({ label, name, type = 'text', value, onChange, required = false }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <input type={type} name={name} required={required} value={value} onChange={onChange}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
        placeholder={label.replace('*', '').trim()} />
    </div>
  )
}
