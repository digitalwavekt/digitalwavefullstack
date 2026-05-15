import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Brain, CheckCircle2, Loader2, Send, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../lib/api'

export default function AIProjectOrder() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    year: '',
    title: '',
    projectDomain: '',
    deadline: '',
    features: '',
    customNotes: '',
    amount: 0,
    documentationRequired: true,
    pptRequired: true,
    deploymentRequired: true,
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const res = await apiFetch('/api/project-templates')
      setTemplates(res.data || [])
      if (res.data?.[0]?.id) {
        setSelectedTemplateId(res.data[0].id)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load project programs')
    } finally {
      setLoading(false)
    }
  }

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [templates, selectedTemplateId]
  )

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedTemplate) {
      toast.error('Please select internship/project program')
      return
    }

    if (!formData.email || !formData.title) {
      toast.error('Email and project title are required')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiFetch('/api/ai-project-delivery/submit', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          deliveryTemplateId: selectedTemplate.id,
          internshipProgramType: selectedTemplate.slug,
          techStack: selectedTemplate.name,
          features: formData.features
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          paymentStatus: 'pending',
        }),
      })

      toast.success(res.message || 'AI project order created')
      setFormData({
        studentName: '',
        email: '',
        phone: '',
        college: '',
        branch: '',
        year: '',
        title: '',
        projectDomain: '',
        deadline: '',
        features: '',
        customNotes: '',
        amount: 0,
        documentationRequired: true,
        pptRequired: true,
        deploymentRequired: true,
      })
    } catch (error) {
      toast.error(error.message || 'Failed to create project order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>AI Student Project Order | Digital Wave IT Solutions</title>
      </Helmet>

      <main className="min-h-screen pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 mb-4">
              <Sparkles className="w-4 h-4" />
              AI-powered project delivery
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Order Your Academic / Portfolio Project
            </h1>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Select your internship program type. Digital Wave will generate program-specific
              architecture, code, documentation, PPT, viva questions and deployment guide after admin review.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <section className="lg:col-span-1 space-y-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${
                      selectedTemplateId === template.id
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="w-5 h-5 text-blue-300" />
                      <h3 className="font-semibold text-white">{template.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </button>
                ))}
              </section>

              <form onSubmit={handleSubmit} className="lg:col-span-2 glass rounded-3xl p-6 border border-white/10 space-y-5">
                {selectedTemplate && (
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                    <div className="flex items-center gap-2 text-emerald-300 font-medium mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Selected: {selectedTemplate.name}
                    </div>
                    <p className="text-sm text-gray-300">
                      Output will be generated according to this program template.
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <input className="input-field" placeholder="Student name" value={formData.studentName} onChange={(e) => updateField('studentName', e.target.value)} />
                  <input className="input-field" placeholder="Email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
                  <input className="input-field" placeholder="Phone" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
                  <input className="input-field" placeholder="College" value={formData.college} onChange={(e) => updateField('college', e.target.value)} />
                  <input className="input-field" placeholder="Branch" value={formData.branch} onChange={(e) => updateField('branch', e.target.value)} />
                  <input className="input-field" placeholder="Year" value={formData.year} onChange={(e) => updateField('year', e.target.value)} />
                  <input className="input-field md:col-span-2" placeholder="Project title" value={formData.title} onChange={(e) => updateField('title', e.target.value)} />
                  <input className="input-field" placeholder="Project domain e.g. HR, Health, E-commerce" value={formData.projectDomain} onChange={(e) => updateField('projectDomain', e.target.value)} />
                  <input className="input-field" type="date" value={formData.deadline} onChange={(e) => updateField('deadline', e.target.value)} />
                </div>

                <textarea
                  className="input-field min-h-[120px]"
                  placeholder="Required features, one per line"
                  value={formData.features}
                  onChange={(e) => updateField('features', e.target.value)}
                />

                <textarea
                  className="input-field min-h-[100px]"
                  placeholder="Custom notes / documentation / deployment requirements"
                  value={formData.customNotes}
                  onChange={(e) => updateField('customNotes', e.target.value)}
                />

                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    ['documentationRequired', 'Documentation'],
                    ['pptRequired', 'PPT'],
                    ['deploymentRequired', 'Deployment Guide'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                      <input
                        type="checkbox"
                        checked={formData[key]}
                        onChange={(e) => updateField(key, e.target.checked)}
                      />
                      <span className="text-sm text-gray-200">{label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Create AI Project Order
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
