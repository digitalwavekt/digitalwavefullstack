import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

const API = import.meta.env.VITE_API_URL

export default function VerifyCertificate() {
    const { token } = useParams()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(`${API}/api/certificate/verify/${token}`)
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setData(res.data)
                } else {
                    setError("Invalid Certificate")
                }
                setLoading(false)
            })
            .catch(() => {
                setError("Server error")
                setLoading(false)
            })
    }, [token])

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-xl">
                Verifying certificate...
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <h1 className="text-3xl text-red-500">❌ Invalid Certificate</h1>
                <p className="text-gray-500 mt-2">{error}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-xl max-w-xl w-full text-center">

                <h1 className="text-3xl font-bold text-green-400 mb-4">
                    ✅ Certificate Verified
                </h1>

                <div className="space-y-3 text-lg">
                    <p><strong>Name:</strong> {data.student_name}</p>
                    <p><strong>Course:</strong> {data.course_name}</p>
                    <p><strong>Issue Date:</strong> {data.issue_date}</p>
                    <p><strong>Certificate ID:</strong> {data.certificate_id}</p>
                </div>

                <a
                    href={data.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-block bg-orange-500 px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                >
                    Download Certificate
                </a>

            </div>
        </div>
    )
}