import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

/**
 * Get email template version history
 * Requirements: 5.6
 */

export default defineEventHandler(async (event) => {
  await requireAdminRole(event)

  const query = getQuery(event)
  const type = query.type as string
  const locale = query.locale as string

  if (!type || !locale) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template type and locale are required'
    })
  }

  const supabase = serverSupabaseServiceRole(event)

  // Get template ID
  const { data: template } = await supabase
    .from('email_templates')
    .select('id')
    .eq('template_type', type)
    .eq('locale', locale)
    .single()

  if (!template) {
    return []
  }

  // Get version history
  const { data: history, error } = await supabase
    .from('email_template_history')
    .select('*')
    .eq('template_id', template.id)
    .order('version', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch template history',
      data: error
    })
  }

  return history || []
})
