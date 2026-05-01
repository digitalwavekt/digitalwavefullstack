import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  Globe, Smartphone, Database, GraduationCap, 
  Code2, Shield, Zap, ArrowRight, CheckCircle2
} from 'lucide-react'

const services = [
  {
    icon: Globe,
    title: 'Website Development',
    description: 'Custom, responsive, and SEO-optimized websites built with modern technologies like React, Next.js, and Node.js. From landing pages to complex web applications.',
    features: ['React & Next.js', 'E-commerce Solutions', 'CMS Integration', 'SEO Optimized', 'Responsive Design', 'API Development'],
    price: 'Starting from ₹15,000',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications for iOS and Android using React Native and Flutter. Build apps that users love.',
    features: ['React Native', 'Flutter', 'iOS & Android', 'Push Notifications', 'Offline Support', 'App Store Publishing'],
    price: 'Starting from ₹25,000',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Database,
    title: 'CRM Solutions',
    description: 'Custom CRM systems tailored to your business needs. Streamline customer relationships, sales pipelines, and team collaboration.',
    features: ['Lead Management', 'Sales Pipeline', 'Analytics Dashboard', 'Automation', 'Email Integration', 'Custom Reports'],
    price: 'Starting from ₹30,000',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: GraduationCap,
    title: 'College Projects',
    description: 'Industry-standard final year projects with complete documentation, source code, and guidance. Choose from MERN, AI/ML, Python, and more.',
    features: ['MERN Stack', 'AI & ML', 'Python Projects', 'Full Documentation', 'Source Code', 'Video Demo'],
    price: 'Starting from ₹3,999',
    color: 'from-pink-500 to-orange-500',
  },
  {
    icon: Code2,
    title: 'Internship Programs',
    description: 'Industry-ready internship courses with live project experience. Get certified and job-ready with hands-on training from experts.',
    features: ['Live Projects', 'Google Meet Classes', 'Certificate', 'Placement Support', 'Mentorship', 'Community Access'],
    price: 'Starting from ₹2,499/month',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: Shield,
    title: 'IT Consulting',
    description: 'Strategic technology consulting to help your business leverage the right tools and frameworks for maximum growth and efficiency.',
    features: ['Tech Stack Advice', 'Architecture Design', 'Security Audit', 'Cloud Migration', 'Performance Optimization', 'Code Review'],
    price: 'Custom Pricing',
    color: 'from-green-500 to-emerald-500',
  },
]

export default function Services() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <>
      <Helmet>
        <title>Our Services | Digital Wave IT Solutions</title>
        <meta name="description" content="Explore our comprehensive IT services including web development, mobile apps, CRM solutions, college projects, and internship programs." />
      </Helmet>

      <div className="relative pt-24 pb-16 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
              Our Services
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              What We <span className="gradient-text">Offer</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive IT solutions designed to accelerate your digital transformation 
              and empower the next generation of tech professionals.
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" ref={ref}>
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shrink-0`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{service.title}</h3>
                      <span className="text-sm text-blue-400 font-medium">{service.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{service.description}</p>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                          <span className="text-gray-300 text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link 
                      to={service.title === 'Internship Programs' ? '/internship' : 
                          service.title === 'College Projects' ? '/college-project' : '/contact'}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
