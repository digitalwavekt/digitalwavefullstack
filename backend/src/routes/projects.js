import express from 'express'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db
  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database is not configured')
  }
  return db.connection
}

const formatProject = (project) => ({
  id: project.id,
  title: project.title,
  slug: project.slug,
  description: project.description,
  category: project.category,
  status: project.status,
  imageUrl: project.image_url,
  projectUrl: project.project_url,
  isActive: project.is_active,
  displayOrder: project.display_order,
  createdAt: project.created_at,
  updatedAt: project.updated_at,
})

// PUBLIC: Get all active projects
router.get('/', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const { data, error } = await supabase
      .from('company_projects')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: (data || []).map(formatProject),
    })
  } catch (error) {
    console.error('Fetch public projects error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch projects' })
  }
})

export default router
