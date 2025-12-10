import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

/**
 * Save email template
 * Requirements: 5.1, 5.4, 5.6
 */

export default defineEventHandler(async (event) => {
  await requireAdminRole(event)

  const body = await readBody(event)
  const { type, locale, translations, subject, preheader } = body

  if (!type || !locale || !translations) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template type, locale, and translations are required',
    })
  }

  const supabase = serverSupabaseServiceRole(event)

  // Check if template exists
  const { data: existing } = await supabase
    .from('email_templates')
    .select('id, version')
    .eq('template_type', type)
    .eq('locale', locale)
    .single()

  if (existing) {
    // Archive current version to history
    await supabase
      .from('email_template_history')
      .insert({
        template_id: existing.id,
        version: existing.version,
        template_type: type,
        locale,
        translations,
        subject,
        preheader,
        archived_at: new Date().toISOString(),
      })

    // Update template with new version
    const { error } = await supabase
      .from('email_templates')
      .update({
        translations,
        subject,
        preheader,
        version: existing.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update template',
        data: error,
      })
    }
  }
  else {
    // Create new template
    const { error } = await supabase
      .from('email_templates')
      .insert({
        template_type: type,
        locale,
        translations,
        subject,
        preheader,
        version: 1,
      })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create template',
        data: error,
      })
    }
  }

  return {
    success: true,
    message: 'Template saved successfully',
  }
})
