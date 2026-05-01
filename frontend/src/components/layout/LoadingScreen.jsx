import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-900 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-xl border-2 border-transparent border-t-blue-500 border-r-purple-500"
          />
          <div className="absolute inset-2 bg-dark-800 rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold gradient-text">DW</span>
          </div>
        </div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-gray-400 text-sm"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  )
}
