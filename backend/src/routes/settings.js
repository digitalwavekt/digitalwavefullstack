import express from 'express'

const router = express.Router()

const defaultSettings = {
  general: {
    companyName: 'Digital Wave IT Solutions Pvt Ltd',
    tagline: 'Transforming Ideas into Digital Reality',
    description:
      'Leading IT solutions provider offering website development, mobile apps, CRM solutions, college projects, and industry internship programs.',
    logo: '',
    favicon: '',
  },
  contact: {
    email: 'info@digitalwaveit.com',
    supportEmail: 'support@digitalwaveit.com',
    phone: '+91 95491 45596',
    alternatePhone: '',
    address: 'Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '',
    country: 'India',
    mapUrl: '',
  },
  social: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: 'https://www.linkedin.com/in/yogesh-kumar-saini-030bbb1bb',
    youtube: '',
    github: 'https://github.com/digitalwavekt',
  },
  payment: {
    payuMode: 'test',
    currency: 'INR',
  },
  team: [],
}

const getSupabase = (req) => {
  const db = req.app.locals.db

  if (!db || db.type !== 'supabase' || !db.connection) {
    throw new Error('Supabase database is not configured')
  }

  return db.connection
}

const getAllSettings = async (supabase) => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key,value')

  if (error) throw error

  const settings = { ...defaultSettings }

  for (const item of data || []) {
    settings[item.key] = item.value
  }

  return settings
}

const upsertSetting = async (supabase, key, value) => {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )
    .select()
    .single()

  if (error) throw error
  return data.value
}

// Get all settings
router.get('/', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const settings = await getAllSettings(supabase)

    res.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error('Fetch settings error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
    })
  }
})

// Get specific section
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params
    const supabase = getSupabase(req)

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', section)
      .maybeSingle()

    if (error) throw error

    const value = data?.value || defaultSettings[section]

    if (!value) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      })
    }

    res.json({
      success: true,
      data: value,
    })
  } catch (error) {
    console.error('Fetch section settings error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
    })
  }
})

// Update all settings
router.put('/', async (req, res) => {
  try {
    const supabase = getSupabase(req)
    const currentSettings = await getAllSettings(supabase)
    const updatedSettings = {
      ...currentSettings,
      ...req.body,
    }

    for (const [key, value] of Object.entries(updatedSettings)) {
      await upsertSetting(supabase, key, value)
    }

    res.json({
      success: true,
      message: 'Settings updated',
      data: updatedSettings,
    })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({
      success: false,
      message: 'Update failed',
    })
  }
})

// Update specific section
router.put('/:section', async (req, res) => {
  try {
    const { section } = req.params
    const supabase = getSupabase(req)

    const { data: existing } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', section)
      .maybeSingle()

    const baseValue = existing?.value || defaultSettings[section]

    if (!baseValue) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      })
    }

    const updatedValue = Array.isArray(baseValue)
      ? req.body
      : { ...baseValue, ...req.body }

    const savedValue = await upsertSetting(supabase, section, updatedValue)

    res.json({
      success: true,
      message: 'Section updated',
      data: savedValue,
    })
  } catch (error) {
    console.error('Update section error:', error)
    res.status(500).json({
      success: false,
      message: 'Update failed',
    })
  }
})

// Add team member
router.post('/team', async (req, res) => {
  try {
    const supabase = getSupabase(req)

    const { data: existing } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'team')
      .maybeSingle()

    const team = existing?.value || defaultSettings.team || []

    const newMember = {
      ...req.body,
      id: Date.now(),
    }

    const updatedTeam = [...team, newMember]
    await upsertSetting(supabase, 'team', updatedTeam)

    res.json({
      success: true,
      message: 'Team member added',
      data: newMember,
    })
  } catch (error) {
    console.error('Add team member error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add member',
    })
  }
})

// Remove team member
router.delete('/team/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase(req)

    const { data: existing } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'team')
      .maybeSingle()

    const team = existing?.value || defaultSettings.team || []
    const updatedTeam = team.filter((m) => String(m.id) !== String(id))

    await upsertSetting(supabase, 'team', updatedTeam)

    res.json({
      success: true,
      message: 'Team member removed',
    })
  } catch (error) {
    console.error('Remove team member error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
    })
  }
})

export default router