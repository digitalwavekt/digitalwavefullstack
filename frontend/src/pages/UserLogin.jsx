import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { Loader2, LogIn, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../lib/api'
import { useAuthStore } from '../hooks/useAuthStore'

export default function UserLogin() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)

      const data = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: credentialResponse.credential }),
      })

      setToken(data.token || data.accessToken)
      setUser(data.user)
      localStorage.setItem('token', data.token || data.accessToken)
      toast.success('Login successful')
      navigate('/#reviews')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>User Login | Digital Wave IT Solutions</title>
      </Helmet>

      <div className="min-h-screen pt-28 pb-16 section-padding flex items-center justify-center">
        <div className="glass rounded-2xl p-8 border border-white/10 max-w-md w-full">
          <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
            <Star className="w-7 h-7 text-blue-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">User Login</h1>
          <p className="text-gray-400 text-sm mb-6">
            Login to rate Digital Wave and share your project or internship experience.
          </p>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              theme="filled_black"
              size="large"
              width="100%"
            />
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing you in...
            </div>
          )}

          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="flex items-start gap-2 mt-4 text-yellow-300 text-xs bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <LogIn className="w-4 h-4 shrink-0 mt-0.5" />
              Add VITE_GOOGLE_CLIENT_ID in frontend environment to enable Google login.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
