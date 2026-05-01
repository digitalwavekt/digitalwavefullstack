import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, Image, MapPin, Phone, Mail, Globe, Upload,
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)

  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Digital Wave IT Solutions Pvt Ltd',
    tagline: 'Transforming Ideas into Digital Reality',
    description: 'Leading IT solutions provider offering website development, mobile apps, CRM solutions, college projects, and industry internship programs.',
    logo: '',
    favicon: '',
  })

  const [contactSettings, setContactSettings] = useState({
    email: 'info@digitalwaveit.com',
    supportEmail: 'support@digitalwaveit.com',
    phone: '+91 98765 43210',
    alternatePhone: '+91 98765 43211',
    address: '123 Tech Park, Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    country: 'India',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.1234567890123!2d77.3616!3d28.6139',
  })

  const [socialSettings, setSocialSettings] = useState({
    facebook: 'https://facebook.com/digitalwaveit',
    twitter: 'https://twitter.com/digitalwaveit',
    instagram: 'https://instagram.com/digitalwaveit',
    linkedin: 'https://linkedin.com/company/digitalwaveit',
    youtube: 'https://youtube.com/digitalwaveit',
    github: 'https://github.com/digitalwaveit',
  })

  const [paymentSettings, setPaymentSettings] = useState({
    payuKey: '',
    payuSalt: '',
    payuMode: 'test',
    currency: 'INR',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'contact', label: 'Contact Info', icon: MapPin },
    { id: 'social', label: 'Social Links', icon: Facebook },
    { id: 'payment', label: 'Payment', icon: Mail },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm">Manage website configuration and preferences</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/10"
      >
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-white font-semibold mb-4">General Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                <input
                  type="text"
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tagline</label>
                <input
                  type="text"
                  value={generalSettings.tagline}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, tagline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Meta Description</label>
              <textarea
                rows={3}
                value={generalSettings.description}
                onChange={(e) => setGeneralSettings({ ...generalSettings, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Logo URL</label>
                <div className="relative">
                  <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={generalSettings.logo}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, logo: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Favicon URL</label>
                <div className="relative">
                  <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={generalSettings.favicon}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, favicon: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h3 className="text-white font-semibold mb-4">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Primary Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={contactSettings.email}
                    onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Support Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={contactSettings.supportEmail}
                    onChange={(e) => setContactSettings({ ...contactSettings, supportEmail: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Primary Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    value={contactSettings.phone}
                    onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Alternate Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    value={contactSettings.alternatePhone}
                    onChange={(e) => setContactSettings({ ...contactSettings, alternatePhone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={contactSettings.address}
                    onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">City</label>
                <input
                  type="text"
                  value={contactSettings.city}
                  onChange={(e) => setContactSettings({ ...contactSettings, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">State</label>
                <input
                  type="text"
                  value={contactSettings.state}
                  onChange={(e) => setContactSettings({ ...contactSettings, state: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Pincode</label>
                <input
                  type="text"
                  value={contactSettings.pincode}
                  onChange={(e) => setContactSettings({ ...contactSettings, pincode: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Google Maps Embed URL</label>
              <textarea
                rows={3}
                value={contactSettings.mapUrl}
                onChange={(e) => setContactSettings({ ...contactSettings, mapUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 resize-none"
                placeholder="Paste Google Maps embed URL here..."
              />
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <h3 className="text-white font-semibold mb-4">Social Media Links</h3>

            <div className="space-y-4">
              {[
                { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
                { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/...' },
                { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
                { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/...' },
                { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/...' },
                { key: 'github', label: 'GitHub', icon: Globe, placeholder: 'https://github.com/...' },
              ].map((social) => (
                <div key={social.key}>
                  <label className="block text-sm text-gray-400 mb-2">{social.label}</label>
                  <div className="relative">
                    <social.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="url"
                      value={socialSettings[social.key]}
                      onChange={(e) => setSocialSettings({ ...socialSettings, [social.key]: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                      placeholder={social.placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h3 className="text-white font-semibold mb-4">Payment Gateway Settings</h3>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-sm font-medium">Sensitive Information</p>
                <p className="text-gray-400 text-xs mt-1">These credentials are encrypted and stored securely. Only update if you have new PayU credentials.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">PayU Merchant Key</label>
                <input
                  type="password"
                  value={paymentSettings.payuKey}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, payuKey: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="Enter PayU Key"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">PayU Salt</label>
                <input
                  type="password"
                  value={paymentSettings.payuSalt}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, payuSalt: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="Enter PayU Salt"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Payment Mode</label>
                <select
                  value={paymentSettings.payuMode}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, payuMode: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="test" className="bg-dark-800">Test Mode</option>
                  <option value="live" className="bg-dark-800">Live Mode</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Currency</label>
                <select
                  value={paymentSettings.currency}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="INR" className="bg-dark-800">INR (₹)</option>
                  <option value="USD" className="bg-dark-800">USD ($)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
