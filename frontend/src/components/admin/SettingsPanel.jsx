import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Image, MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram, Linkedin, Youtube, AlertTriangle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [generalSettings, setGeneralSettings] = useState({})
  const [contactSettings, setContactSettings] = useState({})
  const [socialSettings, setSocialSettings] = useState({})
  const [paymentSettings, setPaymentSettings] = useState({ payuMode: 'test', currency: 'INR' })

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'contact', label: 'Contact Info', icon: MapPin },
    { id: 'social', label: 'Social Links', icon: Facebook },
    { id: 'payment', label: 'Payment', icon: Mail },
  ]

  const loadSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/settings`)
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load settings')

      setGeneralSettings(data.data.general || {})
      setContactSettings(data.data.contact || {})
      setSocialSettings(data.data.social || {})
      setPaymentSettings(data.data.payment || { payuMode: 'test', currency: 'INR' })
    } catch (error) {
      toast.error(error.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const getCurrentPayload = () => {
    if (activeTab === 'general') return generalSettings
    if (activeTab === 'contact') return contactSettings
    if (activeTab === 'social') return socialSettings
    if (activeTab === 'payment') {
      return {
        payuMode: paymentSettings.payuMode,
        currency: paymentSettings.currency,
      }
    }
    return {}
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const res = await fetch(`${API_URL}/api/settings/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getCurrentPayload()),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed')

      toast.success('Settings saved successfully')
      await loadSettings()
    } catch (error) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading settings...
      </div>
    )
  }

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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
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
            <h3 className="text-white font-semibold">General Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Company Name" value={generalSettings.companyName} onChange={(v) => setGeneralSettings({ ...generalSettings, companyName: v })} />
              <Input label="Tagline" value={generalSettings.tagline} onChange={(v) => setGeneralSettings({ ...generalSettings, tagline: v })} />
            </div>

            <Textarea label="Meta Description" value={generalSettings.description} onChange={(v) => setGeneralSettings({ ...generalSettings, description: v })} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IconInput icon={Image} label="Logo URL" value={generalSettings.logo} onChange={(v) => setGeneralSettings({ ...generalSettings, logo: v })} />
              <IconInput icon={Image} label="Favicon URL" value={generalSettings.favicon} onChange={(v) => setGeneralSettings({ ...generalSettings, favicon: v })} />
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h3 className="text-white font-semibold">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IconInput icon={Mail} label="Primary Email" value={contactSettings.email} onChange={(v) => setContactSettings({ ...contactSettings, email: v })} />
              <IconInput icon={Mail} label="Support Email" value={contactSettings.supportEmail} onChange={(v) => setContactSettings({ ...contactSettings, supportEmail: v })} />
              <IconInput icon={Phone} label="Primary Phone" value={contactSettings.phone} onChange={(v) => setContactSettings({ ...contactSettings, phone: v })} />
              <IconInput icon={Phone} label="Alternate Phone" value={contactSettings.alternatePhone} onChange={(v) => setContactSettings({ ...contactSettings, alternatePhone: v })} />
              <IconInput icon={MapPin} label="Address" value={contactSettings.address} onChange={(v) => setContactSettings({ ...contactSettings, address: v })} />
              <Input label="City" value={contactSettings.city} onChange={(v) => setContactSettings({ ...contactSettings, city: v })} />
              <Input label="State" value={contactSettings.state} onChange={(v) => setContactSettings({ ...contactSettings, state: v })} />
              <Input label="Pincode" value={contactSettings.pincode} onChange={(v) => setContactSettings({ ...contactSettings, pincode: v })} />
            </div>

            <Textarea label="Google Maps Embed URL" value={contactSettings.mapUrl} onChange={(v) => setContactSettings({ ...contactSettings, mapUrl: v })} />
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Social Media Links</h3>
            {[
              ['facebook', 'Facebook', Facebook],
              ['twitter', 'Twitter / X', Twitter],
              ['instagram', 'Instagram', Instagram],
              ['linkedin', 'LinkedIn', Linkedin],
              ['youtube', 'YouTube', Youtube],
              ['github', 'GitHub', Globe],
            ].map(([key, label, Icon]) => (
              <IconInput
                key={key}
                icon={Icon}
                label={label}
                value={socialSettings[key]}
                onChange={(v) => setSocialSettings({ ...socialSettings, [key]: v })}
              />
            ))}
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h3 className="text-white font-semibold">Payment Gateway Settings</h3>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-sm font-medium">Security Notice</p>
                <p className="text-gray-400 text-xs mt-1">PayU Key/Salt should stay in Render backend env, not frontend settings.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Payment Mode" value={paymentSettings.payuMode} onChange={(v) => setPaymentSettings({ ...paymentSettings, payuMode: v })} options={['test', 'live']} />
              <Select label="Currency" value={paymentSettings.currency} onChange={(v) => setPaymentSettings({ ...paymentSettings, currency: v })} options={['INR', 'USD']} />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Input({ label, value = '', onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50" />
    </div>
  )
}

function IconInput({ icon: Icon, label, value = '', onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50" />
      </div>
    </div>
  )
}

function Textarea({ label, value = '', onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <textarea rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 resize-none" />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50">
        {options.map((opt) => <option key={opt} value={opt} className="bg-dark-800">{opt}</option>)}
      </select>
    </div>
  )
}