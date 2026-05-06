import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { MessageSquare, ArrowRight, Phone, Mail, MapPin } from 'lucide-react'
import useSiteSettings from '../../hooks/useSiteSettings'

export default function ContactCTA() {
  const { settings } = useSiteSettings()
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <section className="relative py-24 section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 mb-6">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Let's Build Something <br />
              <span className="gradient-text">Amazing Together</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Whether you need a website, mobile app, CRM solution, or want to join our
              internship program — we're here to help. Reach out and let's discuss your project.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  icon: Phone,
                  text: settings?.contact?.phone || '+91 98765 43210',
                },
                {
                  icon: Mail,
                  text: settings?.contact?.email || 'info@digitalwaveit.com',
                },
                {
                  icon: MapPin,
                  text: settings?.contact
                    ? `${settings.contact.city}, ${settings.contact.state}, ${settings.contact.country}`
                    : 'India',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>

            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-3xl p-8"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Response Time', value: '< 2 Hours' },
                { label: 'Projects Delivered', value: '500+' },
                { label: 'Client Satisfaction', value: '99%' },
                { label: 'Support', value: '24/7' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold gradient-text mb-1">{stat.value}</p>
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
