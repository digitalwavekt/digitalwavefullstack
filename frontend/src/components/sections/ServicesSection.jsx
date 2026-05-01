import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { 
  Globe, Smartphone, Database, GraduationCap, 
  Code2, Palette, Shield, Zap, ArrowRight 
} from 'lucide-react'

const services = [
  {
    icon: Globe,
    title: 'Website Development',
    description: 'Custom, responsive, and SEO-optimized websites built with modern technologies like React, Next.js, and Node.js. From landing pages to complex web applications.',
    features: ['React & Next.js', 'E-commerce Solutions', 'CMS Integration', 'SEO Optimized'],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Smartphone,
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications for iOS and Android using React Native and Flutter. Build apps that users love.',
    features: ['React Native', 'Flutter', 'iOS & Android', 'Push Notifications'],
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: Database,
    title: 'CRM Solutions',
    description: 'Custom CRM systems tailored to your business needs. Streamline customer relationships, sales pipelines, and team collaboration.',
    features: ['Lead Management', 'Sales Pipeline', 'Analytics Dashboard', 'Automation'],
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    icon: GraduationCap,
    title: 'College Projects',
    description: 'Industry-standard final year projects with complete documentation, source code, and guidance. Choose from MERN, AI/ML, Python, and more.',
    features: ['MERN Stack', 'AI & ML', 'Python Projects', 'Full Documentation'],
    color: 'from-pink-500 to-orange-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
  {
    icon: Code2,
    title: 'Internship Programs',
    description: 'Industry-ready internship courses with live project experience. Get certified and job-ready with hands-on training from experts.',
    features: ['Live Projects', 'Google Meet Classes', 'Certificate', 'Placement Support'],
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    icon: Shield,
    title: 'IT Consulting',
    description: 'Strategic technology consulting to help your business leverage the right tools and frameworks for maximum growth and efficiency.',
    features: ['Tech Stack Advice', 'Architecture Design', 'Security Audit', 'Cloud Migration'],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
]

export default function ServicesSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section id="services" className="relative py-24 section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            What We Do
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Services We <span className="gradient-text">Provide</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprehensive IT solutions designed to accelerate your digital transformation 
            and empower the next generation of tech professionals.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className={`group relative rounded-2xl border ${service.borderColor} ${service.bgColor} p-6 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-${service.color.split(' ')[1]}/10`}
            >
              {/* Hover gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{service.description}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {service.features.map((feature, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 rounded-full text-xs bg-white/5 text-gray-300 border border-white/10"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <Link 
                  to="/services" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group/link"
                >
                  Learn More 
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
