import { serverSupabaseServiceRole } from '#supabase/server'

/**
 * Preview template synchronization changes
 * Requirements: 5.5
 */

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, sourceLocale, targetLocales } = body

  if (!type || !sourceLocale || !targetLocales || targetLocales.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template type, source locale, and target locales are required'
    })
  }

  const supabase = serverSupabaseServiceRole(event)

  // Get source template
  const { data: sourceTemplate, error: sourceError } = await supabase
    .from('email_templates')
    .select('translations')
    .eq('template_type', type)
    .eq('locale', sourceLocale)
    .single()

  if (sourceError || !sourceTemplate) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Source template not found',
      data: sourceError
    })
  }

  const sourceKeys = Object.keys(sourceTemplate.translations)
  const preview: Record<string, string[]> = {}

  // Check each target locale
  for (const targetLocale of targetLocales) {
    const { data: targetTemplate } = await supabase
      .from('email_templates')
      .select('translations')
      .eq('template_type', type)
      .eq('locale', targetLocale)
      .single()

    const changes: string[] = []

    if (!targetTemplate) {
      changes.push('Template will be created')
      changes.push(`${sourceKeys.length} keys will be added`)
    } else {
      const targetKeys = Object.keys(targetTemplate.translations)
      const newKeys = sourceKeys.filter(key => !targetKeys.includes(key))
      const removedKeys = targetKeys.filter(key => !sourceKeys.includes(key))

      if (newKeys.length > 0) {
        changes.push(`${newKeys.length} new keys will be added: ${newKeys.slice(0, 3).join(', ')}${newKeys.length > 3 ? '...' : ''}`)
      }

      if (removedKeys.length > 0) {
        changes.push(`${removedKeys.length} keys will be removed: ${removedKeys.slice(0, 3).join(', ')}${removedKeys.length > 3 ? '...' : ''}`)
      }

      if (newKeys.length === 0 && removedKeys.length === 0) {
        changes.push('No structural changes needed')
      }
    }

    preview[targetLocale] = changes
  }

  return preview
})
