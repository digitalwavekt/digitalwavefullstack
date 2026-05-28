import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Download, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const txnid = searchParams.get('txnId') || searchParams.get('txnid')
  const [txInfo, setTxInfo] = useState(null)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    toast.success('Payment successful! Welcome to Digital Wave.')
    if (txnid) fetchTxInfo(txnid)
  }, [])

  const fetchTxInfo = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payment/tx-info?txnid=${encodeURIComponent(id)}`)
      const data = await res.json()
      if (data?.success) setTxInfo(data.data)
    } catch (err) {
      console.warn('Failed to fetch tx info', err)
    }
  }

  const handleResend = async () => {
    if (!txInfo) return
    setResending(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai-project-delivery/student/resend-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnId: txInfo.txnId, email: txInfo.email }),
      })
      const data = await res.json()
      if (data?.success) {
        toast.success('Temporary password resent to your email')
      } else {
        toast.error(data?.message || 'Failed to resend')
      }
    } catch (err) {
      toast.error('Failed to resend login email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center section-padding pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 md:p-12 text-center max-w-lg w-full border border-white/10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-6">
          Thank you for your payment. Your enrollment is confirmed.
        </p>

        {txnid && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
            <p className="text-gray-400 text-xs">Transaction ID</p>
            <p className="text-white font-mono text-sm">{txnid}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/student/project-login" className="btn-primary w-full flex items-center justify-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Student Login
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-gray-400 text-sm">Use your payment email and temporary password to log in and access your project dashboard.</p>
          {txInfo?.email && (
            <div className="text-sm text-gray-300">Email used: <span className="font-mono text-white">{txInfo.email}</span></div>
          )}
          {txInfo?.txnId && (
            <button onClick={handleResend} disabled={resending} className="w-full px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors inline-block">
              {resending ? 'Resending...' : 'Resend Temporary Password'}
            </button>
          )}
          <Link to="/" className="w-full px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors inline-block">
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
