import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, RefreshCw, ExternalLink, Globe, Smartphone, Brain, Activity, ShieldCheck, Database, LayoutDashboard } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiFetch } from '../../lib/api'

const CATEGORIES = [
  'AI Platform',
  'Service Marketplace',
  'Agriculture AI',
  'Communication',
  'Lead Marketplace',
  'Farmer Products',
  'FinTech / Trading Research',
  'Health / Emergency',
  'AI Operations',
  'Admin System',
  'Web Development',
  'Mobile App',
  'Uncategorized'
]

const STATUSES = ['Live', 'In Development', 'Planning', 'Internal']

export default function ProjectsManagement() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', category: 'Web Development',
    status: 'Planning', imageUrl: '', projectUrl: '', isActive: true, displayOrder: 0
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/admin/projects')
      setProjects(res.data || [])
    } catch (error) {
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProject) {
        await apiFetch(`/api/admin/projects/${editingProject.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        })
        toast.success('Project updated successfully')
      } else {
        await apiFetch('/api/admin/projects', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
        toast.success('Project created successfully')
      }
      setEditingProject(null)
      fetchProjects()
    } catch (error) {
      toast.error(error.message || 'Failed to save project')
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description || '',
      category: project.category || 'Web Development',
      status: project.status || 'Planning',
      imageUrl: project.imageUrl || '',
      projectUrl: project.projectUrl || '',
      isActive: project.isActive,
      displayOrder: project.displayOrder || 0
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this project?')) return
    try {
      await apiFetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
      toast.success('Project deactivated')
      fetchProjects()
    } catch (error) {
      toast.error('Failed to deactivate project')
    }
  }

  const resetForm = () => {
    setEditingProject(null)
    setFormData({
      title: '', slug: '', description: '', category: 'Web Development',
      status: 'Planning', imageUrl: '', projectUrl: '', isActive: true, displayOrder: 0
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-400" />
            Company Projects
          </h2>
          <p className="text-gray-400 text-sm mt-1">Manage public projects shown on the website.</p>
        </div>
        <button onClick={fetchProjects} className="p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 border border-white/10 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              {editingProject ? <Edit2 className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-green-400" />}
              {editingProject ? 'Edit Project' : 'New Project'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Slug</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="Auto-generated if empty"
                  className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Project URL</label>
                <input type="text" name="projectUrl" value={formData.projectUrl} onChange={handleInputChange} placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Display Order</label>
                  <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/10 bg-dark-800 accent-blue-500" />
                  <label htmlFor="isActive" className="text-sm text-white select-none cursor-pointer">Active</label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
                {editingProject && (
                  <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-sm flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          {projects.map((project) => (
            <div key={project.id} className={`glass rounded-2xl p-5 border transition-all ${!project.isActive ? 'border-red-500/20 opacity-70' : 'border-white/10 hover:border-white/20'}`}>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${project.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {project.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
                      Order: {project.displayOrder}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <Database className="w-3.5 h-3.5 text-blue-400" /> {project.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <Activity className="w-3.5 h-3.5 text-green-400" /> {project.status}
                    </span>
                    {project.projectUrl && (
                      <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300">
                        <ExternalLink className="w-3.5 h-3.5" /> View Site
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-4">
                  <button onClick={() => handleEdit(project)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors tooltip-trigger" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {project.isActive && (
                    <button onClick={() => handleDelete(project.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors tooltip-trigger" title="Deactivate">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!loading && projects.length === 0 && (
            <div className="glass rounded-2xl p-8 border border-white/10 text-center text-gray-400">
              No projects found. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
