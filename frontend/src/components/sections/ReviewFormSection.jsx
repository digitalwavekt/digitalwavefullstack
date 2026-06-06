import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Send, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../../lib/api'
import { useAuthStore } from '../../hooks/useAuthStore'

export default function ReviewFormSection({ onSubmitted }) {
  const { user, token } = useAuthStore()
  const [rating, setRating] = useState(5)
  const [role, setRole] = useState('Digital Wave Client')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.type === 'user') {
      setRole('Digital Wave Client')
    }
  }, [user])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!token || !user) {
      toast.error('Please login first')
      return
    }

    try {
      setSubmitting(true)
      await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ rating, role, comment }),
      })

      setComment('')
      setRating(5)
      toast.success('Review submitted for admin approval')
      onSubmitted?.()
    } catch (error) {
      toast.error(error.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div id="reviews" className="glass rounded-2xl p-6 border border-white/10 mt-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Rate Your Experience</h3>
          <p className="text-gray-400 text-sm">
            Logged-in users can share comments. Admin approval keeps the public page clean.
          </p>
        </div>

        {!user && (
          <Link to="/login" className="btn-secondary inline-flex items-center justify-center">
            Login to Review
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-1 text-yellow-400"
              aria-label={`${value} star rating`}
            >
              <Star className={`w-7 h-7 ${value <= rating ? 'fill-yellow-400' : ''}`} />
            </button>
          ))}
        </div>

        <input
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="input-field"
          placeholder="Your role, course, or company"
        />

        <textarea
          required
          rows={4}
          minLength={10}
          maxLength={600}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="input-field resize-none"
          placeholder="Write your comment..."
        />

        <button
          type="submit"
          disabled={submitting || !user || comment.trim().length < 10}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Review
        </button>
      </form>
    </div>
  )
}
