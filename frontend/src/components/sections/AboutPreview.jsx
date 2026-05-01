import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { Target, Lightbulb, Heart, ArrowRight, CheckCircle2 } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'To bridge the gap between academic learning and industry requirements by providing practical, hands-on experience through internships and real-world projects.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Lightbulb,
    title: 'Our Vision',
    description: 'To become the most trusted IT solutions provider and career accelerator for students and businesses across India, delivering excellence in every project.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: Heart,
    title: 'Our Values',
    description: 'Integrity, innovation, and impact drive everything we do. We believe in transparent communication, cutting-edge solutions, and measurable results.',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
]

const highlights = [
  'Industry Expert Mentors',
  'Live Project Experience',
  '100% Placement Support',
  'Flexible Learning Schedule',
  'Affordable Pricing',
  'Lifetime Community Access',
]

export default function AboutPreview() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section className="relative py-24 section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
              About Digital Wave
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Empowering Future <br />
              <span className="gradient-text">Tech Leaders</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Digital Wave IT Solutions is a leading technology company dedicated to delivering 
              world-class web solutions, mobile applications, and industry-ready training programs. 
              Founded with a vision to bridge the gap between academia and industry, we have 
              successfully trained over 2,000 students and delivered 500+ projects.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {highlights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </motion.div>
              ))}
            </div>

            <Link 
              to="/about" 
              className="inline-flex items-center gap-2 btn-primary"
            >
              Know More About Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right Content - Cards */}
          <div className="grid gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ scale: 1.02 }}
                className={`glass rounded-2xl p-6 border ${value.borderColor} ${value.bgColor} group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${value.bgColor} border ${value.borderColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <value.icon className={`w-6 h-6 ${value.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
