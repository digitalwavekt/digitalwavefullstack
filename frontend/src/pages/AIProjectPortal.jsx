import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { FileText, Loader2, Lock, PackageCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../lib/api'

export default function AIProjectPortal() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const res = await apiFetch('/api/ai-project-delivery/student/my-projects')
      setProjects(res.data || [])
    } catch (error) {
      toast.error(error.message || 'Login required to view AI projects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>My AI Projects | Digital Wave IT Solutions</title>
      </Helmet>

      <main className="min-h-screen pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold gradient-text mb-3">My AI Project Portal</h1>
          <p className="text-gray-400 mb-8">
            Track your project status, program-specific deliverables, review progress and final delivery unlock.
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : projects.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center border border-white/10">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No AI projects found</h2>
              <p className="text-gray-400">Place an AI project order to see it here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {projects.map((project) => (
                <div key={project.id} className="glass rounded-3xl p-6 border border-white/10">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-blue-300">{project.orderNumber}</p>
                      <h2 className="text-xl font-semibold text-white">{project.title}</h2>
                      <p className="text-sm text-gray-400">{project.category || project.internshipProgramType}</p>
                    </div>
                    {project.status === 'delivery_unlocked' || project.status === 'delivered' ? (
                      <PackageCheck className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <Lock className="w-7 h-7 text-yellow-400" />
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className="text-white">{project.progressLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment</span>
                      <span className="text-white">{project.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deadline</span>
                      <span className="text-white">{project.deadline || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-gray-300">
                      Final files will unlock only after Digital Wave admin quality approval.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
