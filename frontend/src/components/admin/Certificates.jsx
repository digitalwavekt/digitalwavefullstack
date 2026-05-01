import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Award, Download, Eye, CheckCircle2, XCircle, Search,
  Palette, Type, Image as ImageIcon, Save
} from 'lucide-react'
import toast from 'react-hot-toast'

const mockCertificates = [
  { id: 1, studentName: 'Sneha Gupta', course: 'Data Science', issueDate: '2024-02-01', status: 'issued', certificateId: 'DW-2024-001' },
  { id: 2, studentName: 'Rahul Sharma', course: 'MERN Stack', issueDate: null, status: 'pending', certificateId: null },
  { id: 3, studentName: 'Priya Patel', course: 'AI & ML', issueDate: null, status: 'eligible', certificateId: null },
]

export default function Certificates() {
  const [certificates, setCertificates] = useState(mockCertificates)
  const [searchTerm, setSearchTerm] = useState('')
  const [designMode, setDesignMode] = useState(false)
  const [certificateDesign, setCertificateDesign] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Inter',
    logoUrl: '',
    signatureUrl: '',
    template: 'modern',
  })

  const handleIssue = (id) => {
    setCertificates(certificates.map(c => 
      c.id === id ? { ...c, status: 'issued', issueDate: new Date().toISOString().split('T')[0], certificateId: `DW-${new Date().getFullYear()}-${String(id).padStart(3, '0')}` } : c
    ))
    toast.success('Certificate issued successfully')
  }

  const handleRevoke = (id) => {
    setCertificates(certificates.map(c => 
      c.id === id ? { ...c, status: 'eligible', issueDate: null, certificateId: null } : c
    ))
    toast.success('Certificate revoked')
  }

  const filteredCertificates = certificates.filter(c => 
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.course.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveDesign = () => {
    toast.success('Certificate design saved')
    setDesignMode(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates</h1>
          <p className="text-gray-400 text-sm">Manage and design student certificates</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setDesignMode(!designMode)}
            className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            {designMode ? 'Back to List' : 'Design Certificate'}
          </button>
        </div>
      </div>

      {designMode ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-6">Certificate Designer</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Design Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={certificateDesign.primaryColor}
                    onChange={(e) => setCertificateDesign({ ...certificateDesign, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-xl bg-transparent border border-white/10 cursor-pointer"
                  />
                  <span className="text-gray-300 text-sm">{certificateDesign.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={certificateDesign.secondaryColor}
                    onChange={(e) => setCertificateDesign({ ...certificateDesign, secondaryColor: e.target.value })}
                    className="w-12 h-12 rounded-xl bg-transparent border border-white/10 cursor-pointer"
                  />
                  <span className="text-gray-300 text-sm">{certificateDesign.secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Template Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {['modern', 'classic', 'minimal'].map((template) => (
                    <button
                      key={template}
                      onClick={() => setCertificateDesign({ ...certificateDesign, template })}
                      className={`p-4 rounded-xl border text-sm capitalize transition-all ${
                        certificateDesign.template === template
                          ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                          : 'border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Logo URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={certificateDesign.logoUrl}
                    onChange={(e) => setCertificateDesign({ ...certificateDesign, logoUrl: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveDesign}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Design
              </button>
            </div>

            {/* Preview */}
            <div className="glass rounded-2xl p-8 border border-white/10 flex items-center justify-center">
              <div 
                className="w-full max-w-md aspect-[1.4/1] rounded-xl border-2 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
                style={{ 
                  borderColor: certificateDesign.primaryColor,
                  background: `linear-gradient(135deg, ${certificateDesign.primaryColor}10, ${certificateDesign.secondaryColor}10)`
                }}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ background: `linear-gradient(to right, ${certificateDesign.primaryColor}, ${certificateDesign.secondaryColor})` }}
                />
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: certificateDesign.primaryColor }}
                >
                  Certificate of Completion
                </h3>
                <p className="text-gray-400 text-sm mb-4">This is to certify that</p>
                <h4 className="text-xl font-bold text-white mb-2">Student Name</h4>
                <p className="text-gray-400 text-sm mb-4">has successfully completed</p>
                <h5 className="text-lg font-semibold text-white mb-6">Course Name</h5>
                <div className="flex items-center gap-8 mt-auto">
                  <div className="text-center">
                    <div className="w-24 h-px bg-white/20 mb-2" />
                    <p className="text-gray-400 text-xs">Date</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-px bg-white/20 mb-2" />
                    <p className="text-gray-400 text-xs">Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by student name or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Student</th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Course</th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Certificate ID</th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-right text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map((cert) => (
                    <tr key={cert.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-white text-sm font-medium">{cert.studentName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300 text-sm">{cert.course}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300 text-sm font-mono">{cert.certificateId || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cert.status === 'issued' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          cert.status === 'eligible' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {cert.status === 'eligible' && (
                            <button 
                              onClick={() => handleIssue(cert.id)}
                              className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                              title="Issue Certificate"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {cert.status === 'issued' && (
                            <>
                              <button className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors" title="Download">
                                <Download className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleRevoke(cert.id)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Revoke"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
