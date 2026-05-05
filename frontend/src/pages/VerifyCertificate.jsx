import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Download, ShieldCheck } from 'lucide-react'

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
            } catch (err) {
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
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                    <span>Verifying certificate...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center px-4">
                <div className="max-w-lg w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Invalid Certificate</h1>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <Link to="/" className="inline-block rounded-xl bg-white/10 px-5 py-3 hover:bg-white/20">
                        Go Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full rounded-3xl border border-green-500/30 bg-white/5 p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
                    <h1 className="text-3xl md:text-4xl font-bold">Certificate Verified</h1>
                    <p className="text-gray-400 mt-2">This certificate is valid and issued by Digital Wave IT Solutions.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-400">Student Name</p>
                        <p className="text-xl font-semibold">{certificate.student_name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">Course</p>
                        <p className="text-xl font-semibold">{certificate.course_name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">Issue Date</p>
                        <p className="text-lg">{certificate.issue_date}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">Certificate ID</p>
                        <p className="text-lg font-mono text-orange-400">{certificate.certificate_id}</p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    {certificate.pdf_url ? (
                        <a
                            href={certificate.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold hover:bg-orange-600"
                        >
                            <Download className="w-5 h-5" />
                            Download PDF
                        </a>
                    ) : (
                        <button
                            disabled
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-600 px-5 py-3 font-semibold opacity-60"
                        >
                            <Download className="w-5 h-5" />
                            PDF Not Uploaded Yet
                        </button>
                    )}

                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-semibold hover:bg-white/20"
                    >
                        <ShieldCheck className="w-5 h-5" />
                        Visit Website
                    </Link>
                </div>
            </div>
        </div>
    )
}