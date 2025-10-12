/**
 * Get email template by type and locale
 * Requirements: 5.1, 5.5
 */

import { getEmailTranslations } from '~/server/utils/emailTemplates/translations'
import { normalizeLocale } from '~/server/utils/emailTemplates/formatters'

export default defineEventHandler(async (event) => {
  // Get query parameters
  const query = getQuery(event)
  const type = query.type as string
  const locale = query.locale as string

  if (!type || !locale) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template type and locale are required'
    })
  }

  // Normalize locale
  const normalizedLocale = normalizeLocale(locale)

  // Get translations for the locale
  const translations = getEmailTranslations(normalizedLocale)

  // Return template data
  return {
    type,
    locale: normalizedLocale,
    translations,
    subject: translations.subject,
    preheader: translations.preheader
  }
})
