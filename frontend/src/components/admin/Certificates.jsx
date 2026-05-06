import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  CheckCircle2,
  Search,
  Palette,
  Image as ImageIcon,
  Save,
  Loader2,
  ExternalLink,
  Upload,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../../lib/api'
import { uploadFile } from '../../lib/uploadFile'

export default function Certificates() {
  const [certificates, setCertificates] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [issuingId, setIssuingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [designMode, setDesignMode] = useState(false)
  const [savingDesign, setSavingDesign] = useState(false)
  const [uploadingField, setUploadingField] = useState(null)

  const [certificateDesign, setCertificateDesign] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Inter',
    logoUrl: '',
    signatureUrl: '',
    backgroundUrl: '',
    template: 'modern',
  })

  const fetchData = async () => {
    try {
      setLoading(true)

      const [certData, studentData] = await Promise.all([
        apiFetch('/api/certificate/all'),
        apiFetch('/api/admin/students'),
      ])

      setCertificates(certData.data || [])
      setStudents(studentData.data || [])

      try {
        const design = await apiFetch('/api/settings/certificate_design')

        if (design?.data) {
          setCertificateDesign((prev) => ({
            ...prev,
            ...design.data,
          }))
        }
      } catch {
        // ignore
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleIssue = async (studentId) => {
    try {
      setIssuingId(studentId)

      await apiFetch(`/api/certificate/issue/${studentId}`, {
        method: 'POST',
      })

      toast.success('Certificate issued successfully')
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Certificate issue failed')
    } finally {
      setIssuingId(null)
    }
  }

  const handleSaveDesign = async () => {
    try {
      setSavingDesign(true)

      await apiFetch('/api/settings/certificate_design', {
        method: 'PUT',
        body: JSON.stringify(certificateDesign),
      })

      toast.success('Certificate design saved')
      setDesignMode(false)
    } catch (error) {
      toast.error(error.message || 'Failed to save design')
    } finally {
      setSavingDesign(false)
    }
  }

  const handleUpload = async (file, field, folder) => {
    if (!file) return

    try {
      setUploadingField(field)

      const uploaded = await uploadFile({
        file,
        bucket: 'uploads',
        folder,
      })

      setCertificateDesign((prev) => ({
        ...prev,
        [field]: uploaded.publicUrl,
      }))

      toast.success(`${field} uploaded`)
    } catch (error) {
      toast.error(error.message || 'Upload failed')
    } finally {
      setUploadingField(null)
    }
  }

  const issuedStudentIds = new Set(certificates.map((c) => Number(c.student_id)))

  const eligibleStudents = students.filter((student) => {
    return !issuedStudentIds.has(Number(student.id))
  })

  const listItems = [
    ...certificates.map((cert) => ({
      id: `cert-${cert.id}`,
      studentId: cert.student_id,
      studentName: cert.student_name,
      course: cert.course_name,
      issueDate: cert.issue_date,
      status: cert.status || 'issued',
      certificateId: cert.certificate_id,
      pdfUrl: cert.pdf_url,
      verificationUrl: cert.verification_url,
      type: 'issued',
    })),
    ...eligibleStudents.map((student) => ({
      id: `student-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      course: student.course_name,
      issueDate: null,
      status:
        student.status === 'completed' || Number(student.progress || 0) >= 80
          ? 'eligible'
          : 'pending',
      certificateId: null,
      pdfUrl: null,
      verificationUrl: null,
      type: 'student',
    })),
  ]

  const filteredCertificates = listItems.filter((item) => {
    return (
      (item.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.course || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.certificateId || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading certificates...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates</h1>
          <p className="text-gray-400 text-sm">
            Manage and design student certificates
          </p>
        </div>

        <button
          onClick={() => setDesignMode(!designMode)}
          className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm flex items-center gap-2"
        >
          <Palette className="w-4 h-4" />
          {designMode ? 'Back to List' : 'Design Certificate'}
        </button>
      </div>

      {designMode ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Certificate Designer
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ColorPicker
                label="Primary Color"
                value={certificateDesign.primaryColor}
                onChange={(value) =>
                  setCertificateDesign({
                    ...certificateDesign,
                    primaryColor: value,
                  })
                }
              />

              <ColorPicker
                label="Secondary Color"
                value={certificateDesign.secondaryColor}
                onChange={(value) =>
                  setCertificateDesign({
                    ...certificateDesign,
                    secondaryColor: value,
                  })
                }
              />

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Template Style
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {['modern', 'classic', 'minimal'].map((template) => (
                    <button
                      key={template}
                      onClick={() =>
                        setCertificateDesign({
                          ...certificateDesign,
                          template,
                        })
                      }
                      className={`p-4 rounded-xl border text-sm capitalize transition-all ${certificateDesign.template === template
                          ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                          : 'border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <UploadField
                label="Logo"
                field="logoUrl"
                folder="certificate-logos"
                value={certificateDesign.logoUrl}
                uploadingField={uploadingField}
                onUpload={handleUpload}
                onChange={(value) =>
                  setCertificateDesign({
                    ...certificateDesign,
                    logoUrl: value,
                  })
                }
              />

              <UploadField
                label="Signature"
                field="signatureUrl"
                folder="certificate-signatures"
                value={certificateDesign.signatureUrl}
                uploadingField={uploadingField}
                onUpload={handleUpload}
                onChange={(value) =>
                  setCertificateDesign({
                    ...certificateDesign,
                    signatureUrl: value,
                  })
                }
              />

              <UploadField
                label="Background"
                field="backgroundUrl"
                folder="certificate-backgrounds"
                value={certificateDesign.backgroundUrl}
                uploadingField={uploadingField}
                onUpload={handleUpload}
                onChange={(value) =>
                  setCertificateDesign({
                    ...certificateDesign,
                    backgroundUrl: value,
                  })
                }
              />

              <button
                onClick={handleSaveDesign}
                disabled={savingDesign}
                className="btn-primary flex items-center gap-2"
              >
                {savingDesign ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Design
              </button>
            </div>

            <div className="glass rounded-2xl p-8 border border-white/10 flex items-center justify-center">
              <div
                className="w-full max-w-md aspect-[1.4/1] rounded-xl border-2 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-cover bg-center"
                style={{
                  borderColor: certificateDesign.primaryColor,
                  backgroundImage: certificateDesign.backgroundUrl
                    ? `url(${certificateDesign.backgroundUrl})`
                    : undefined,
                  backgroundColor: '#111827',
                }}
              >
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    background: `linear-gradient(135deg, ${certificateDesign.primaryColor}20, ${certificateDesign.secondaryColor}20)`,
                  }}
                />

                <div className="relative z-10 flex flex-col items-center w-full h-full">
                  {certificateDesign.logoUrl && (
                    <img
                      src={certificateDesign.logoUrl}
                      alt="Logo"
                      className="h-14 object-contain mb-4"
                    />
                  )}

                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: certificateDesign.primaryColor }}
                  >
                    Certificate of Completion
                  </h3>

                  <p className="text-gray-300 text-sm mb-4">
                    This is to certify that
                  </p>

                  <h4 className="text-xl font-bold text-white mb-2">
                    Student Name
                  </h4>

                  <p className="text-gray-300 text-sm mb-4">
                    has successfully completed
                  </p>

                  <h5 className="text-lg font-semibold text-white mb-6">
                    Course Name
                  </h5>

                  <div className="flex items-center justify-between w-full mt-auto">
                    <div className="text-center">
                      <div className="w-24 h-px bg-white/20 mb-2" />
                      <p className="text-gray-400 text-xs">Date</p>
                    </div>

                    <div className="text-center">
                      {certificateDesign.signatureUrl && (
                        <img
                          src={certificateDesign.signatureUrl}
                          alt="Signature"
                          className="h-10 object-contain mx-auto mb-1"
                        />
                      )}

                      <div className="w-24 h-px bg-white/20 mb-2" />
                      <p className="text-gray-400 text-xs">Signature</p>
                    </div>
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
              placeholder="Search by student name, course, or certificate ID..."
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
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                      Student
                    </th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                      Course
                    </th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                      Certificate ID
                    </th>
                    <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-right text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCertificates.map((cert) => (
                    <tr
                      key={cert.id}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="px-6 py-4">
                        <p className="text-white text-sm font-medium">
                          {cert.studentName}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {cert.course}
                      </td>

                      <td className="px-6 py-4 text-gray-300 text-sm font-mono">
                        {cert.certificateId || '-'}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${cert.status === 'issued'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : cert.status === 'eligible'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}
                        >
                          {cert.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {cert.status === 'eligible' && (
                            <button
                              onClick={() => handleIssue(cert.studentId)}
                              disabled={issuingId === cert.studentId}
                              className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            >
                              {issuingId === cert.studentId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {cert.verificationUrl && (
                            <a
                              href={cert.verificationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          {cert.pdfUrl && (
                            <a
                              href={cert.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                            >
                              <Download className="w-4 h-4" />
                            </a>
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

function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-xl bg-transparent border border-white/10"
        />

        <span className="text-gray-300 text-sm">{value}</span>
      </div>
    </div>
  )
}

function UploadField({
  label,
  value,
  onChange,
  onUpload,
  field,
  folder,
  uploadingField,
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label} URL</label>

      <div className="relative">
        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
          placeholder="https://..."
        />
      </div>

      <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 cursor-pointer text-sm">
        <Upload className="w-4 h-4" />

        {uploadingField === field ? 'Uploading...' : `Upload ${label}`}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onUpload(e.target.files?.[0], field, folder)}
        />
      </label>

      {value && (
        <img
          src={value}
          alt={label}
          className="mt-3 h-20 rounded-xl border border-white/10 object-contain bg-white/5 p-2"
        />
      )}
    </div>
  )
}