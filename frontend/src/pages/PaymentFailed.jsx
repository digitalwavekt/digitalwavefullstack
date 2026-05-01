import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { XCircle, RefreshCcw, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PaymentFailed() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    toast.error('Payment failed. Please try again.')
  }, [])

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
          className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-10 h-10 text-red-400" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
        <p className="text-gray-400 mb-6">
          We couldn't process your payment. Please try again or contact support.
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => window.history.back()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link to="/contact" className="w-full px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors inline-flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
