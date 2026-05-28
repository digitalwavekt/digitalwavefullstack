import express from 'express'
import { adminAuth, requirePermission } from '../middleware/adminAuth.js'

const router = express.Router()

const getSupabase = (req) => {
  const db = req.app.locals.db
  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database is not configured')
  }
  return db.connection
}

const formatTemplate = (template) => ({
  id: template.id,
  name: template.name,
  slug: template.slug,
  description: template.description,
  defaultStack: template.default_stack || {},
  requiredOutputs: template.required_outputs || [],
  promptRules: template.prompt_rules || {},
  vivaFocus: template.viva_focus || [],
  docsStructure: template.docs_structure || [],
  deploymentRules: template.deployment_rules || {},
  isActive: template.is_active,
  createdAt: template.created_at,
  updatedAt: template.updated_at,
})

// PUBLIC: active templates for student order form
router.get('/', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data, error } = await supabase
      .from('internship_program_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) throw error

    res.json({
      success: true,
      data: (data || []).map(formatTemplate),
    })
  } catch (error) {
    console.error('Fetch project templates error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project templates',
    })
  }
})

// ADMIN: all templates
router.get(
  '/admin/all',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)

      const { data, error } = await supabase
        .from('internship_program_templates')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      res.json({
        success: true,
        data: (data || []).map(formatTemplate),
      })
    } catch (error) {
      console.error('Admin fetch templates error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch templates',
      })
    }
  }
)

// ADMIN: create template
router.post(
  '/admin',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)
      const {
        name,
        slug,
        description,
        defaultStack = {},
        requiredOutputs = [],
        promptRules = {},
        vivaFocus = [],
        docsStructure = [],
        deploymentRules = {},
        isActive = true,
      } = req.body

      if (!name || !slug) {
        return res.status(400).json({
          success: false,
          message: 'Template name and slug are required',
        })
      }

      const { data, error } = await supabase
        .from('internship_program_templates')
        .insert({
          name,
          slug,
          description,
          default_stack: defaultStack,
          required_outputs: requiredOutputs,
          prompt_rules: promptRules,
          viva_focus: vivaFocus,
          docs_structure: docsStructure,
          deployment_rules: deploymentRules,
          is_active: isActive,
        })
        .select()
        .single()

      if (error) throw error

      res.json({
        success: true,
        message: 'Template created successfully',
        data: formatTemplate(data),
      })
    } catch (error) {
      console.error('Create template error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create template',
      })
    }
  }
)

// ADMIN: update template
router.put(
  '/admin/:id',
  adminAuth,
  requirePermission('manage_projects'),
  async (req, res) => {
    try {
      const supabase = getSupabase(req)
      const { id } = req.params
      const {
        name,
        slug,
        description,
        defaultStack,
        requiredOutputs,
        promptRules,
        vivaFocus,
        docsStructure,
        deploymentRules,
        isActive,
      } = req.body

      const payload = {
        updated_at: new Date().toISOString(),
      }

      if (name !== undefined) payload.name = name
      if (slug !== undefined) payload.slug = slug
      if (description !== undefined) payload.description = description
      if (defaultStack !== undefined) payload.default_stack = defaultStack
      if (requiredOutputs !== undefined) payload.required_outputs = requiredOutputs
      if (promptRules !== undefined) payload.prompt_rules = promptRules
      if (vivaFocus !== undefined) payload.viva_focus = vivaFocus
      if (docsStructure !== undefined) payload.docs_structure = docsStructure
      if (deploymentRules !== undefined) payload.deployment_rules = deploymentRules
      if (isActive !== undefined) payload.is_active = isActive

      const { data, error } = await supabase
        .from('internship_program_templates')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      res.json({
        success: true,
        message: 'Template updated successfully',
        data: formatTemplate(data),
      })
    } catch (error) {
      console.error('Update template error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update template',
      })
    }
  }
)

export default router
