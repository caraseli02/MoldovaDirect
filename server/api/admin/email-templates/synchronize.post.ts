import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

/**
 * Synchronize template structure across languages
 * Requirements: 5.5
 */

export default defineEventHandler(async (event) => {
  await requireAdminRole(event)

  const body = await readBody(event)
  const { type, sourceLocale, targetLocales } = body

  if (!type || !sourceLocale || !targetLocales || targetLocales.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Template type, source locale, and target locales are required',
    })
  }

  const supabase = serverSupabaseServiceRole(event)

  // Get source template
  const { data: sourceTemplate, error: sourceError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_type', type)
    .eq('locale', sourceLocale)
    .single()

  if (sourceError || !sourceTemplate) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Source template not found',
      data: sourceError,
    })
  }

  const sourceKeys = Object.keys(sourceTemplate.translations)

  // Synchronize each target locale
  for (const targetLocale of targetLocales) {
    const { data: targetTemplate } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', type)
      .eq('locale', targetLocale)
      .single()

    if (!targetTemplate) {
      // Create new template with source structure but placeholder translations
      const newTranslations: Record<string, any> = {}
      for (const key of sourceKeys) {
        const sourceValue = sourceTemplate.translations[key]
        if (typeof sourceValue === 'object') {
          newTranslations[key] = { ...sourceValue }
        }
        else {
          newTranslations[
            key
          ] = `[${targetLocale.toUpperCase()}] ${sourceValue}`
        }
      }

      await supabase.from('email_templates').insert({
        template_type: type,
        locale: targetLocale,
        translations: newTranslations,
        subject: `[${targetLocale.toUpperCase()}] ${sourceTemplate.subject}`,
        preheader: sourceTemplate.preheader
          ? `[${targetLocale.toUpperCase()}] ${sourceTemplate.preheader}`
          : null,
        version: 1,
      })
    }
    else {
      // Merge structures: keep existing translations, add new keys, remove obsolete keys
      const mergedTranslations: Record<string, any> = {}

      for (const key of sourceKeys) {
        if (targetTemplate.translations[key] !== undefined) {
          // Keep existing translation
          mergedTranslations[key] = targetTemplate.translations[key]
        }
        else {
          // Add new key with placeholder
          const sourceValue = sourceTemplate.translations[key]
          if (typeof sourceValue === 'object') {
            mergedTranslations[key] = { ...sourceValue }
          }
          else {
            mergedTranslations[
              key
            ] = `[${targetLocale.toUpperCase()}] ${sourceValue}`
          }
        }
      }

      // Archive current version
      await supabase.from('email_template_history').insert({
        template_id: targetTemplate.id,
        version: targetTemplate.version,
        template_type: type,
        locale: targetLocale,
        translations: targetTemplate.translations,
        subject: targetTemplate.subject,
        preheader: targetTemplate.preheader,
        archived_at: new Date().toISOString(),
      })

      // Update template
      await supabase
        .from('email_templates')
        .update({
          translations: mergedTranslations,
          version: targetTemplate.version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetTemplate.id)
    }
  }

  return {
    success: true,
    message: 'Templates synchronized successfully',
  }
})
