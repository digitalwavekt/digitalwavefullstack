import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  Linkedin,
  Twitter,
  Instagram,
  Github,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../lib/api'
import useSiteSettings from '../hooks/useSiteSettings'

export default function Contact() {
  const { settings } = useSiteSettings()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      if (!data.success) {
        toast.error(data.message || 'Message submission failed')
        return
      }

      toast.success('Message sent successfully! We will get back to you soon.')

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error('Unable to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactSettings = settings?.contact || {}
  const socialSettings = settings?.social || {}
  const addressParts = [
    contactSettings.address,
    contactSettings.city,
    contactSettings.state,
    contactSettings.pincode,
    contactSettings.country,
  ].filter(Boolean)
  const address = addressParts.join(', ')
  const mapQuery = encodeURIComponent(address || contactSettings.city || contactSettings.state || '')
  const mapSrc = contactSettings.mapUrl || (mapQuery ? `https://www.google.com/maps?q=${mapQuery}&output=embed` : '')

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: contactSettings.phone,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      icon: Mail,
      label: 'Email',
      value: contactSettings.email || contactSettings.supportEmail,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      icon: MapPin,
      label: 'Address',
      value: address,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
    },
    {
      icon: Clock,
      label: 'Working Hours',
      value: contactSettings.workingHours,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  ].filter((item) => item.value)

  const socialLinks = [
    { icon: Linkedin, href: socialSettings.linkedin, color: 'hover:text-blue-400' },
    { icon: Twitter, href: socialSettings.twitter, color: 'hover:text-cyan-400' },
    { icon: Instagram, href: socialSettings.instagram, color: 'hover:text-pink-400' },
    { icon: Github, href: socialSettings.github, color: 'hover:text-purple-400' },
  ].filter((social) => social.href)

  return (
    <>
      <Helmet>
        <title>Contact Us | Digital Wave IT Solutions</title>
        <meta
          name="description"
          content="Get in touch with Digital Wave IT Solutions for web development, app development, CRM solutions, internships, and college projects."
        />
      </Helmet>

      <div className="relative pt-24 pb-16 section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 mb-4">
              Contact Us
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Get In <span className="gradient-text">Touch</span>
            </h1>

            <p className="text-gray-400 max-w-2xl mx-auto">
              Have a project in mind or want to join our internship program?
              We&apos;d love to hear from you. Reach out and let&apos;s discuss
              how we can help.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {contactInfo.map((item, i) => (
                  <div
                    key={i}
                    className={`glass rounded-2xl p-5 border ${item.borderColor} ${item.bgColor}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${item.bgColor} border ${item.borderColor} flex items-center justify-center mb-3`}
                    >
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>

                    <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                    <p className="text-white text-sm font-medium">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {mapSrc && (
                <div className="glass rounded-2xl overflow-hidden border border-white/10 h-64 mb-8">
                  <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Digital Wave Location"
                  />
                </div>
              )}

              {socialLinks.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-4">Follow Us</h3>

                  <div className="flex gap-3">
                    {socialLinks.map((social, i) => (
                      <a
                        key={i}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 ${social.color} hover:bg-white/10 transition-all`}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Send Message
                </h2>

                <p className="text-gray-400 text-sm mb-6">
                  Fill out the form below and we&apos;ll get back to you within
                  24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      >
                        <option value="" className="bg-dark-800">
                          Select Subject
                        </option>
                        <option value="website" className="bg-dark-800">
                          Website Development
                        </option>
                        <option value="app" className="bg-dark-800">
                          Mobile App Development
                        </option>
                        <option value="crm" className="bg-dark-800">
                          CRM Solutions
                        </option>
                        <option value="internship" className="bg-dark-800">
                          Internship Program
                        </option>
                        <option value="college-project" className="bg-dark-800">
                          College Project
                        </option>
                        <option value="other" className="bg-dark-800">
                          Other
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                      placeholder="Tell us about your project or inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
