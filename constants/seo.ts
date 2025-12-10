/**
 * SEO default values and constants used across the application
 */
export const SEO_DEFAULTS = {
  SITE_NAME: 'Moldova Direct',
  DEFAULT_IMAGE: '/icon.svg',
  DEFAULT_ROBOTS: 'index,follow',
  DEFAULT_PAGE_TYPE: 'website',
} as const

/**
 * Placeholder contact information
 *
 * IMPORTANT: This contains placeholder data that must be replaced before production.
 * These values are used in structured data sent to search engines.
 *
 * TODO: Create a GitHub issue to track replacing placeholder contact details:
 * - PHONE: Replace '+34 910 000 000' with actual customer service number
 * - Verify all email addresses are correct and actively monitored
 * - Confirm company name and location are accurate
 */
export const CONTACT_INFO = {
  EMAIL: {
    INFO: 'info@moldovadirect.com',
    SUPPORT: 'support@moldovadirect.com',
  },
  PHONE: '+34 910 000 000', // PLACEHOLDER - Replace with real phone number
  COMPANY_NAME: 'Moldova Direct S.L.',
  LOCATION: 'Madrid, Spain',
} as const
