/**
 * Get email template by type and locale
 * Requirements: 5.1, 5.5
 */

import { formatters, translations } from '~/server/utils/emailTemplates'
import { requireAdminRole } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdminRole(event)

  // Get query parameters
  const query = getQuery(event)
  const type = query.type as string
  const locale = query.locale as string

  if (!type || !locale) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template type and locale are required',
    })
  }

  // Normalize locale
  const normalizedLocale = formatters.normalizeLocale(locale)

  // Get translations for the locale
  const templateTranslations = translations.getEmailTranslations(normalizedLocale)

  // Return template data
  return {
    type,
    locale: normalizedLocale,
    translations: templateTranslations,
    subject: templateTranslations.subject,
    preheader: templateTranslations.preheader,
  }
})
