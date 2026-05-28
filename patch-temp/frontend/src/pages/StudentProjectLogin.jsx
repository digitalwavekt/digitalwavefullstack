import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Lock, Loader2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

export default function StudentProjectLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiFetch('/api/ai-project-delivery/student/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      localStorage.setItem('studentProjectToken', res.data.token)
      localStorage.setItem('studentProjectUser', JSON.stringify(res.data.student))
      toast.success('Student login successful')
      navigate('/student/project-dashboard')
    } catch (error) {
      toast.error(error.message || 'Student login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Student Project Login | Digital Wave</title></Helmet>
      <main className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
        <form onSubmit={submit} className="glass rounded-3xl p-8 border border-white/10 w-full max-w-md space-y-5">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto text-blue-300 mb-3" />
            <h1 className="text-3xl font-bold gradient-text">Student Dashboard Login</h1>
            <p className="text-gray-400 mt-2">Use the email and temporary password sent after payment.</p>
          </div>
          <label className="block">
            <span className="text-sm text-gray-300">Email</span>
            <div className="relative mt-2">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-field pl-10" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-gray-300">Temporary Password</span>
            <input className="input-field mt-2" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <button disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Login
          </button>
        </form>
      </main>
    </>
  )
}
