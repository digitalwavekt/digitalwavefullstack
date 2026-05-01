import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { GraduationCap, ArrowRight, Calendar, Users, Award, Clock } from 'lucide-react'

const benefits = [
  { icon: Calendar, text: 'Flexible Duration (1-6 Months)' },
  { icon: Users, text: 'Live Google Meet Sessions' },
  { icon: Award, text: 'Industry Recognized Certificate' },
  { icon: Clock, text: 'Real Project Experience' },
]

export default function InternshipCTA() {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <section className="relative py-24 section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute inset-0 bg-dark-800/80 backdrop-blur-xl" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 p-8 md:p-16 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-8"
            >
              <GraduationCap className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Kickstart Your <br />
              <span className="gradient-text">Tech Career?</span>
            </h2>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
              Join our industry-focused internship programs and gain hands-on experience 
              with real projects. Get certified and job-ready with expert mentorship.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                >
                  <benefit.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/internship" className="btn-primary flex items-center gap-2">
                Apply for Internship
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/college-project" 
                className="px-8 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all duration-300"
              >
                College Projects
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
