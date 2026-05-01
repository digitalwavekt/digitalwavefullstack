import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, ArrowUpRight, Linkedin, Twitter, Instagram, Github } from 'lucide-react'

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Projects', path: '/projects' },
  { name: 'Internship', path: '/internship' },
  { name: 'Contact', path: '/contact' },
]

const services = [
  'Website Development',
  'Mobile App Development',
  'CRM Solutions',
  'College Projects',
  'Internship Programs',
  'Digital Marketing',
]

export default function Footer() {
  return (
    <footer className="relative bg-dark-800 border-t border-white/5">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="section-padding max-w-7xl mx-auto pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg rotate-45" />
                <div className="absolute inset-1 bg-dark-800 rounded-md flex items-center justify-center">
                  <span className="text-lg font-bold gradient-text">DW</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold gradient-text">Digital Wave</h3>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase">IT Solutions Pvt Ltd</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Transforming ideas into digital reality. We build cutting-edge web solutions, 
              mobile applications, and provide industry-ready internship programs.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Github, href: '#' },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 text-sm hover:text-blue-400 transition-colors flex items-center gap-1 group"
                  >
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service, i) => (
                <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">info@digitalwaveit.com</p>
                  <p className="text-gray-500 text-xs">support@digitalwaveit.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">+91 98765 43210</p>
                  <p className="text-gray-500 text-xs">Mon-Sat, 9AM-7PM</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                <p className="text-gray-400 text-sm">
                  123 Tech Park, Sector 62<br />
                  Noida, Uttar Pradesh 201301
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Digital Wave IT Solutions Pvt Ltd. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link to="#" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
