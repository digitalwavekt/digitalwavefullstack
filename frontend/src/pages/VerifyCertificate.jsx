import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    CheckCircle,
    XCircle,
    Loader2,
    Download,
    ShieldCheck,
    Award,
    Calendar,
    BadgeCheck,
    ExternalLink,
    Home,
} from 'lucide-react'

export default function VerifyCertificate() {
    const { token } = useParams()
    const [loading, setLoading] = useState(true)
    const [certificate, setCertificate] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        const verifyCertificate = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL
                const res = await fetch(`${apiUrl}/api/certificate/verify/${token}`)
                const data = await res.json()

                if (!res.ok || !data.success) {
                    setError(data.message || 'Certificate not valid')
                    return
                }

                setCertificate(data.data)
            } catch {
                setError('Unable to verify certificate')
            } finally {
                setLoading(false)
            }
        }

        verifyCertificate()
    }, [token])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                    <span className="text-gray-200">Verifying certificate...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center px-4">
                <div className="max-w-lg w-full rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center shadow-2xl">
                    <XCircle className="w-20 h-20 text-red-400 mx-auto mb-5" />
                    <h1 className="text-3xl font-bold mb-2">Invalid Certificate</h1>
                    <p className="text-gray-300 mb-8">{error}</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 hover:bg-white/20"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#070b14] text-white px-4 py-10">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-green-400 text-sm mb-5">
                        <ShieldCheck className="w-4 h-4" />
                        Verified by Digital Wave IT Solutions
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold">
                        Certificate Verified
                    </h1>

                    <p className="text-gray-400 mt-3">
                        This certificate is authentic and recorded in our verification system.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-green-400 to-blue-500" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle className="w-9 h-9 text-green-400" />
                            </div>

                            <div>
                                <p className="text-green-400 text-sm font-medium">
                                    Valid Certificate
                                </p>
                                <h2 className="text-2xl font-bold">
                                    Certificate of Completion
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <InfoRow
                                icon={Award}
                                label="Student Name"
                                value={certificate.student_name}
                            />

                            <InfoRow
                                icon={BadgeCheck}
                                label="Course"
                                value={certificate.course_name}
                            />

                            <InfoRow
                                icon={Calendar}
                                label="Issue Date"
                                value={certificate.issue_date || '-'}
                            />

                            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                                <p className="text-sm text-gray-400 mb-2">Certificate ID</p>
                                <p className="text-xl font-mono text-orange-400 break-all">
                                    {certificate.certificate_id}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
                        <h3 className="text-xl font-bold mb-3">Verification Status</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            The QR code or verification URL confirms this certificate record.
                        </p>

                        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5 mb-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-7 h-7 text-green-400" />
                                <div>
                                    <p className="font-semibold text-green-400">Authentic</p>
                                    <p className="text-sm text-gray-300">
                                        Issued by Digital Wave IT Solutions
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {certificate.pdf_url ? (
                                <a
                                    href={certificate.pdf_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold hover:bg-orange-600 transition"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Certificate PDF
                                </a>
                            ) : (
                                <button
                                    disabled
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-600 px-5 py-3 font-semibold opacity-60"
                                >
                                    <Download className="w-5 h-5" />
                                    PDF Not Uploaded Yet
                                </button>
                            )}

                            {certificate.verification_url && (
                                <a
                                    href={certificate.verification_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-semibold hover:bg-white/20 transition"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Open Verification Link
                                </a>
                            )}

                            <Link
                                to="/"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-semibold text-gray-300 hover:bg-white/10 transition"
                            >
                                <Home className="w-5 h-5" />
                                Visit Website
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-xs mt-8">
                    For verification concerns, contact Digital Wave IT Solutions support.
                </p>
            </div>
        </div>
    )
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 flex gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-orange-400" />
            </div>

            <div>
                <p className="text-sm text-gray-400">{label}</p>
                <p className="text-xl font-semibold text-white mt-1">{value || '-'}</p>
            </div>
        </div>
    )
}