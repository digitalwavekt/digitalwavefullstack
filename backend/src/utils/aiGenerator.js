import axios from 'axios'

const getGeminiConfig = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  return { apiKey, model }
}

const cleanText = (text) => String(text || '').trim()

const extractJson = (text) => {
  if (!text) return null
  const match = text.match(/\{[\s\S]*\}$/m)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    const jsonLike = match[0]
      .replace(/\n/g, ' ')
      .replace(/,\s*([}\]])/g, '$1')
    try {
      return JSON.parse(jsonLike)
    } catch {
      return null
    }
  }
}

const buildBasePrompt = (order, requirements) => {
  const studentName = cleanText(order.student_name || order.studentEmail || 'Student')
  const selectedProgram = cleanText(order.category || order.internship_program_type || order.tech_stack || 'Academic Project')
  const selectedTechStack = cleanText(order.tech_stack || order.category || order.internship_program_type || 'MERN')
  const projectTitle = cleanText(order.title || 'Academic Project')
  const requiredFeatures = Array.isArray(requirements?.feature_list)
    ? requirements.feature_list.join(', ')
    : cleanText(requirements?.custom_notes || '')
  const deadline = order.deadline ? new Date(order.deadline).toLocaleDateString('en-IN') : 'Flexible'
  const documentationRequired = requirements?.documentation_required ? 'Yes' : 'No'
  const pptRequired = requirements?.ppt_required ? 'Yes' : 'No'
  const deploymentRequired = requirements?.deployment_required ? 'Yes' : 'No'
  const customNotes = cleanText(requirements?.custom_notes || order.project_domain || '')

  return `System:\nYou are an expert software architect, academic project mentor, and production engineer working for Digital Wave IT Solutions. Generate high-quality, practical, student-friendly, industry-level project delivery content. Content must be specific to the selected program, technology stack, and student requirements.\n\nUser input:\nStudent Name: ${studentName}\nProgram: ${selectedProgram}\nTech Stack: ${selectedTechStack}\nProject Title: ${projectTitle}\nRequired Features: ${requiredFeatures || 'Not specified'}\nDeadline: ${deadline}\nDocumentation Required: ${documentationRequired}\nPPT Required: ${pptRequired}\nDeployment Required: ${deploymentRequired}\nCustom Notes: ${customNotes || 'None'}\n\nGenerate structured output with these sections as valid JSON only:\n1. projectOverview\n2. problemStatement\n3. objectives\n4. projectScope\n5. recommendedTechStack\n6. systemArchitecture\n7. userRoles\n8. moduleBreakdown\n9. featureList\n10. databaseDesign\n11. apiPlan\n12. folderStructure\n13. developmentRoadmap\n14. testingPlan\n15. documentation\n16. vivaQuestions\n17. installationGuide\n18. deploymentGuide\n19. pptOutline\n20. finalChecklist\n\nRules:\n- Do not generate generic content.\n- Customize based on selectedProgram and selectedTechStack.\n- Keep output practical for student project delivery.\n- Avoid fictional secret keys or credentials.\n- If a section is not applicable, return a short note instead of leaving it blank.\n- Return only valid JSON with the keys listed above.\n`
}

const toGeminiContents = (messages) => {
  const systemText = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n')

  const userMessages = messages.filter((message) => message.role !== 'system')
  const contents = userMessages.length ? userMessages : [{ role: 'user', content: systemText }]

  return contents.map((message, index) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [
      {
        text: index === 0 && systemText && message.role !== 'system'
          ? `${systemText}\n\n${message.content}`
          : message.content,
      },
    ],
  }))
}

const callGemini = async (messages, options = {}) => {
  const { apiKey, model } = getGeminiConfig()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const response = await axios.post(
    url,
    {
      contents: toGeminiContents(messages),
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxOutputTokens ?? 2200,
        responseMimeType: options.responseMimeType,
      },
    },
    {
      params: { key: apiKey },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000,
    }
  )

  const result = response.data
  const content = result?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim() || ''
  return content
}

export const generateFullProjectBlueprint = async (order, requirements = {}) => {
  const prompt = buildBasePrompt(order, requirements)
  const raw = await callGemini([
    { role: 'system', content: prompt },
  ], { responseMimeType: 'application/json' })

  const parsed = extractJson(raw)
  if (!parsed) {
    throw new Error('AI response could not be parsed as JSON. Raw response: ' + raw)
  }

  return {
    rawOutput: raw,
    ...parsed,
  }
}

export const generateProjectScope = async (order, requirements = {}) => {
  const output = await generateFullProjectBlueprint(order, requirements)
  return output.projectScope || output
}

export const generateArchitecture = async (order, requirements = {}) => {
  const output = await generateFullProjectBlueprint(order, requirements)
  return output.systemArchitecture || output
}

export const generateDocumentation = async (order, requirements = {}) => {
  const output = await generateFullProjectBlueprint(order, requirements)
  return output.documentation || output
}

export const generateVivaQuestions = async (order, requirements = {}) => {
  const output = await generateFullProjectBlueprint(order, requirements)
  return output.vivaQuestions || output
}

export const generateInstallationGuide = async (order, requirements = {}) => {
  const output = await generateFullProjectBlueprint(order, requirements)
  return output.installationGuide || output
}

export const generateDeploymentGuide = async (order, requirements = {}) => {
  const output = await generateFullProjectBlueprint(order, requirements)
  return output.deploymentGuide || output
}

export const generatePPTOutline = async (order, requirements = {}) => {
  const output = await generateFullProjectBlueprint(order, requirements)
  return output.pptOutline || output
}

export const generateStudentChatbotResponse = async (order, question, context = {}) => {
  const studentName = cleanText(order.student_name || order.student_email || 'Student')
  const projectTitle = cleanText(order.title || 'your project')
  const selectedProgram = cleanText(order.category || order.internship_program_type || order.tech_stack || 'Academic Project')
  const requirements = order.project_requirements?.[0] || context.requirements || {}
  const aiOutput = order.ai_projects?.[0]?.ai_output || context.aiOutput || {}
  const assets = context.assets || {}
  const updates = Array.isArray(context.updates) ? context.updates : []

  const messages = [
    {
      role: 'system',
      content: `You are a supportive project assistant for Digital Wave IT Solutions. Answer only about this student's purchased project or internship. Refuse unrelated topics, politics, general internet questions, other student data, admin/internal data, secrets, credentials, or anything outside the supplied context. Keep answers concise and student-friendly.`,
    },
    {
      role: 'user',
      content: `Allowed context:\nStudent Name: ${studentName}\nProject Title: ${projectTitle}\nProgram: ${selectedProgram}\nOrder Type: ${order.order_type || 'project'}\nCurrent Status: ${order.status || 'pending'}\nTech Stack: ${order.tech_stack || selectedProgram}\nRequirements: ${JSON.stringify(requirements)}\nAdmin Notes: ${order.admin_notes || ''}\nAI Output: ${JSON.stringify(aiOutput)}\nDelivery Assets: ${JSON.stringify(assets)}\nInternship Updates: ${JSON.stringify(updates)}\n\nStudent question: ${question}\n\nIf the question is outside the allowed context, say you can only help with this purchased project/internship.`,
    },
  ]

  try {
    const text = await callGemini(messages, { temperature: 0.2, maxOutputTokens: 700 })
    return { answer: cleanText(text) }
  } catch (error) {
    return {
      answer: `Hi ${studentName}, I am reviewing your project details and will respond shortly. Current status: ${order.status || 'pending approval'}.`,
    }
  }
}
