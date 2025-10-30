/**
 * SEO default values and constants used across the application
 */
export const SEO_DEFAULTS = {
  SITE_NAME: 'Moldova Direct',
  DEFAULT_IMAGE: '/icon.svg',
  DEFAULT_ROBOTS: 'index,follow',
  DEFAULT_PAGE_TYPE: 'website'
} as const

/**
 * Placeholder contact information
 * TODO: Replace with actual contact details before production
 */
export const CONTACT_INFO = {
  EMAIL: {
    INFO: 'info@moldovadirect.com',
    SUPPORT: 'support@moldovadirect.com'
  },
  PHONE: '+34 910 000 000', // TODO: Replace with real phone number
  COMPANY_NAME: 'Moldova Direct S.L.',
  LOCATION: 'Madrid, Spain'
} as const
