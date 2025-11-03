import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

/**
 * Rollback email template to a previous version
 * Requirements: 5.6
 */

export default defineEventHandler(async (event) => {
  await requireAdminRole(event)

  const body = await readBody(event)
  const { historyId, type, locale } = body

  if (!historyId || !type || !locale) {
    throw createError({
      statusCode: 400,
      statusMessage: 'History ID, template type, and locale are required'
    })
  }

  const supabase = serverSupabaseServiceRole(event)

  // Get the historical version
  const { data: historicalVersion, error: historyError } = await supabase
    .from('email_template_history')
    .select('*')
    .eq('id', historyId)
    .single()

  if (historyError || !historicalVersion) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Historical version not found',
      data: historyError
    })
  }

  // Get current template
  const { data: currentTemplate } = await supabase
    .from('email_templates')
    .select('id, version')
    .eq('template_type', type)
    .eq('locale', locale)
    .single()

  if (!currentTemplate) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Current template not found'
    })
  }

  // Archive current version
  await supabase
    .from('email_template_history')
    .insert({
      template_id: currentTemplate.id,
      version: currentTemplate.version,
      template_type: type,
      locale,
      translations: historicalVersion.translations,
      subject: historicalVersion.subject,
      preheader: historicalVersion.preheader,
      archived_at: new Date().toISOString()
    })

  // Update template with historical content
  const { error: updateError } = await supabase
    .from('email_templates')
    .update({
      translations: historicalVersion.translations,
      subject: historicalVersion.subject,
      preheader: historicalVersion.preheader,
      version: currentTemplate.version + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', currentTemplate.id)

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to rollback template',
      data: updateError
    })
  }

  return {
    success: true,
    message: 'Template rolled back successfully'
  }
})
