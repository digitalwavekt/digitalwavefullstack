import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award, Download, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CertificateDownload() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState(null)

  useEffect(() => {
    fetchCertificate()
  }, [id])

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/certificate/generate/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        setCertificate(url)
      }
    } catch (error) {
      toast.error('Failed to load certificate')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (certificate) {
      const a = document.createElement('a')
      a.href = certificate
      a.download = `certificate-${id}.pdf`
      a.click()
      toast.success('Certificate downloaded!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center section-padding pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 md:p-12 text-center max-w-lg w-full border border-white/10"
      >
        <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-blue-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Certificate of Completion</h1>
        <p className="text-gray-400 mb-8">
          Congratulations on completing your course! Download your certificate below.
        </p>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Verified Certificate</span>
          </div>
          <p className="text-gray-400 text-xs">Certificate ID: DW-2024-{id}</p>
        </div>

        <button 
          onClick={handleDownload}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Certificate (PDF)
        </button>
      </motion.div>
    </div>
  )
}
