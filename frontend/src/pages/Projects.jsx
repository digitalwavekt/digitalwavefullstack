import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ExternalLink, Github, Layers, ArrowRight } from 'lucide-react'

const categories = ['All', 'Web Development', 'Mobile App', 'CRM', 'AI/ML', 'College Project']

const projects = [
  { title: 'E-Commerce Platform', category: 'Web Development', description: 'Full-stack e-commerce solution with payment integration, inventory management, and real-time analytics dashboard.', tech: ['React', 'Node.js', 'MongoDB', 'Stripe'], demo: '#', github: '#' },
  { title: 'Healthcare CRM System', category: 'CRM', description: 'Custom CRM for healthcare providers with patient management, appointment scheduling, and billing integration.', tech: ['Next.js', 'PostgreSQL', 'Redis', 'Docker'], demo: '#', github: '#' },
  { title: 'Food Delivery App', category: 'Mobile App', description: 'Cross-platform mobile application for food delivery with real-time tracking and multiple payment options.', tech: ['React Native', 'Firebase', 'Google Maps', 'PayU'], demo: '#', github: '#' },
  { title: 'AI Chatbot Assistant', category: 'AI/ML', description: 'Intelligent chatbot powered by NLP for customer support with sentiment analysis and automated responses.', tech: ['Python', 'TensorFlow', 'FastAPI', 'React'], demo: '#', github: '#' },
  { title: 'Student Management System', category: 'College Project', description: 'Complete student management portal with attendance, grades, and communication features for educational institutions.', tech: ['MERN Stack', 'Socket.io', 'JWT', 'Cloudinary'], demo: '#', github: '#' },
  { title: 'Real Estate Portal', category: 'Web Development', description: 'Property listing platform with virtual tours, mortgage calculator, and agent management system.', tech: ['Vue.js', 'Django', 'PostgreSQL', 'AWS'], demo: '#', github: '#' },
  { title: 'Fitness Tracker', category: 'Mobile App', description: 'Health and fitness tracking app with workout plans, nutrition tracking, and progress analytics.', tech: ['Flutter', 'Firebase', 'HealthKit', 'Charts'], demo: '#', github: '#' },
  { title: 'Inventory Management', category: 'CRM', description: 'Enterprise inventory system with barcode scanning, stock alerts, and multi-warehouse support.', tech: ['React', 'Node.js', 'MySQL', 'Redis'], demo: '#', github: '#' },
  { title: 'Face Recognition System', category: 'AI/ML', description: 'Attendance system using facial recognition with real-time detection and reporting.', tech: ['Python', 'OpenCV', 'DeepFace', 'Flask'], demo: '#', github: '#' },
]

export default function Projects() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory)

  return (
    <>
      <Helmet>
        <title>Our Projects | Digital Wave IT Solutions</title>
        <meta name="description" content="Explore our portfolio of successful projects in web development, mobile apps, AI/ML, CRM, and college projects." />
      </Helmet>

      <div className="relative pt-24 pb-16 section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              Portfolio
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Our <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore our diverse portfolio of successful projects across various industries and technologies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={ref}>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-dark-800/50"
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-dark-800/50 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                  <div className="w-full h-full flex items-center justify-center bg-dark-700">
                    <Layers className="w-16 h-16 text-white/10" />
                  </div>
                  <div className="absolute inset-0 bg-dark-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center gap-4">
                    <a href={project.demo} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <a href={project.github} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-purple-500 transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 rounded-md text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t, i) => (
                      <span key={i} className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                        {t}
                      </span>
                    ))}
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
