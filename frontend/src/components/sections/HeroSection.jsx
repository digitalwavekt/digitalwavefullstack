import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Sparkles, Code, Smartphone, Database, GraduationCap } from 'lucide-react'

const floatingIcons = [
  { Icon: Code, color: 'text-blue-400', delay: 0 },
  { Icon: Smartphone, color: 'text-purple-400', delay: 0.5 },
  { Icon: Database, color: 'text-cyan-400', delay: 1 },
  { Icon: GraduationCap, color: 'text-pink-400', delay: 1.5 },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Floating icons */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            y: [0, -20, 0],
            x: [0, i % 2 === 0 ? 10 : -10, 0]
          }}
          transition={{ 
            duration: 5,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`absolute hidden lg:block ${
            i === 0 ? 'top-1/4 left-[15%]' :
            i === 1 ? 'top-1/3 right-[15%]' :
            i === 2 ? 'bottom-1/3 left-[10%]' :
            'bottom-1/4 right-[10%]'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color}`}>
            <item.Icon className="w-6 h-6" />
          </div>
        </motion.div>
      ))}

      <div className="section-padding max-w-7xl mx-auto text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300">Transforming Ideas into Digital Reality</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        >
          <span className="text-white">We Build</span>
          <br />
          <span className="gradient-text">Digital Excellence</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          From cutting-edge websites and mobile apps to industry-ready internship programs 
          and college projects — we empower students and businesses to thrive in the digital era.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/services" className="btn-primary flex items-center gap-2 group">
            Explore Services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/internship" 
            className="px-8 py-3 rounded-xl font-semibold border border-white/10 text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Join Internship
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { value: '500+', label: 'Projects Delivered' },
            { value: '2000+', label: 'Students Trained' },
            { value: '50+', label: 'Team Experts' },
            { value: '99%', label: 'Client Satisfaction' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="glass rounded-2xl p-4 text-center"
            >
              <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent" />
    </section>
  )
}
