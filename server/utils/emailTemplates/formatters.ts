/**
 * Locale-specific formatting utilities for email templates
 * Handles currency, date, and number formatting
 */

export type SupportedLocale = 'es' | 'en' | 'ro' | 'ru'

/**
 * Locale to Intl locale mapping
 */
const localeMap: Record<SupportedLocale, string> = {
  es: 'es-ES',
  en: 'en-US',
  ro: 'ro-RO',
  ru: 'ru-RU',
}

/**
 * Format currency amount according to locale
 * All amounts are in EUR
 */
export function formatCurrency(amount: number, locale: SupportedLocale | string): string {
  const intlLocale = localeMap[locale as SupportedLocale] || localeMap.es

  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  catch (error) {
    // Fallback to simple formatting
    return `€${amount.toFixed(2)}`
  }
}

/**
 * Format date according to locale
 */
export function formatDate(dateString: string, locale: SupportedLocale | string): string {
  const intlLocale = localeMap[locale as SupportedLocale] || localeMap.es

  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString
    }

    return date.toLocaleDateString(intlLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  catch (error) {
    return dateString
  }
}

/**
 * Format date with time according to locale
 */
export function formatDateTime(dateString: string, locale: SupportedLocale | string): string {
  const intlLocale = localeMap[locale as SupportedLocale] || localeMap.es

  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString
    }

    return date.toLocaleString(intlLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  catch (error) {
    return dateString
  }
}

/**
 * Format number according to locale
 */
export function formatNumber(value: number, locale: SupportedLocale | string): string {
  const intlLocale = localeMap[locale as SupportedLocale] || localeMap.es

  try {
    return new Intl.NumberFormat(intlLocale).format(value)
  }
  catch (error) {
    return value.toString()
  }
}

/**
 * Format percentage according to locale
 */
export function formatPercentage(value: number, locale: SupportedLocale | string): string {
  const intlLocale = localeMap[locale as SupportedLocale] || localeMap.es

  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }
  catch (error) {
    return `${value}%`
  }
}

/**
 * Get locale-specific order status translation
 */
export function getOrderStatusLabel(status: string, locale: SupportedLocale | string): string {
  const statusTranslations: Record<string, Record<string, string>> = {
    pending: {
      es: 'Pendiente',
      en: 'Pending',
      ro: 'În așteptare',
      ru: 'В ожидании',
    },
    processing: {
      es: 'Procesando',
      en: 'Processing',
      ro: 'În procesare',
      ru: 'Обработка',
    },
    shipped: {
      es: 'Enviado',
      en: 'Shipped',
      ro: 'Expediat',
      ru: 'Отправлено',
    },
    delivered: {
      es: 'Entregado',
      en: 'Delivered',
      ro: 'Livrat',
      ru: 'Доставлено',
    },
    cancelled: {
      es: 'Cancelado',
      en: 'Cancelled',
      ro: 'Anulat',
      ru: 'Отменено',
    },
  }

  const localeKey = locale as SupportedLocale
  return statusTranslations[status]?.[localeKey] || status
}

/**
 * Validate and normalize locale
 */
export function normalizeLocale(locale: string | undefined): SupportedLocale {
  if (!locale) return 'es'

  const normalized = locale.toLowerCase().split('-')[0] as SupportedLocale

  if (['es', 'en', 'ro', 'ru'].includes(normalized)) {
    return normalized
  }

  return 'es'
}

/**
 * Get locale-specific currency symbol
 */
export function getCurrencySymbol(locale: SupportedLocale | string): string {
  // All prices are in EUR
  return '€'
}

/**
 * Format address for display
 */
export function formatAddress(address: {
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
}): string {
  const parts = [
    address.street,
    `${address.city}, ${address.postalCode}`,
  ]

  if (address.province) {
    parts.push(address.province)
  }

  parts.push(address.country)

  return parts.join('<br>')
}
