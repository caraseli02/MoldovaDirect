/**
 * Email Templates Module
 * Centralized exports for order confirmation email system
 */

// Template generation
export {
  generateOrderConfirmationTemplate,
  getOrderConfirmationSubject,
  type OrderEmailData,
  type OrderItemData,
  type AddressData,
} from './orderConfirmation'

// Translations
export {
  getEmailTranslations,
  replaceTranslationPlaceholders,
  emailTranslations,
  type EmailTranslations,
} from './translations'

// Formatters
export {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentage,
  getOrderStatusLabel,
  normalizeLocale,
  getCurrencySymbol,
  formatAddress,
  type SupportedLocale,
} from './formatters'

// Data transformation
export {
  transformOrderToEmailData,
  transformOrderToEmailDataWithLocale,
  transformOrderItemsWithLocale,
  getLocalizedProductName,
} from './dataTransformer'

// Validation
export {
  validateOrderEmailData,
  validateAndSanitizeOrderData,
  hasRequiredFields,
  getMissingFields,
} from './validator'

// Types
export type {
  DatabaseOrder,
  DatabaseOrderItem,
  UserProfile,
  GuestCheckoutData,
  ValidationResult,
  EmailTemplateContext,
} from './types'
