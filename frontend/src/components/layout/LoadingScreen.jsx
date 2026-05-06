import { motion } from 'framer-motion'
import useSiteSettings from '../../hooks/useSiteSettings'

export default function LoadingScreen() {
  const { settings } = useSiteSettings()
  const general = settings?.general || {}

  return (
    <div className="fixed inset-0 bg-dark-900 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-blue-500 border-r-purple-500 border-b-orange-500"
          />

          <div className="absolute inset-2 bg-dark-800 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
            {general.logo ? (
              <img
                src={general.logo}
                alt={general.companyName || 'Digital Wave'}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-xl font-bold gradient-text">DW</span>
            )}
          </div>
        </div>

        <div className="text-center">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-300 text-sm font-medium"
          >
            {general.companyName || 'Digital Wave IT Solutions'}
          </motion.p>

          <p className="text-gray-500 text-xs mt-1">
            {general.tagline || 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  )
}