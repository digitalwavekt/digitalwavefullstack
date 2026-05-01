import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import { Briefcase, Users, Award, Clock, TrendingUp, Code } from 'lucide-react'

const stats = [
  { icon: Briefcase, value: 500, suffix: '+', label: 'Projects Completed', color: 'text-blue-400' },
  { icon: Users, value: 2000, suffix: '+', label: 'Students Trained', color: 'text-purple-400' },
  { icon: Award, value: 50, suffix: '+', label: 'Expert Team Members', color: 'text-cyan-400' },
  { icon: Clock, value: 5, suffix: '+', label: 'Years Experience', color: 'text-pink-400' },
  { icon: TrendingUp, value: 99, suffix: '%', label: 'Success Rate', color: 'text-orange-400' },
  { icon: Code, value: 25, suffix: '+', label: 'Technologies', color: 'text-green-400' },
]

export default function StatsSection() {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <section className="relative py-20 section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-8 md:p-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {inView ? (
                    <CountUp end={stat.value} duration={2.5} suffix={stat.suffix} />
                  ) : (
                    `0${stat.suffix}`
                  )}
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
