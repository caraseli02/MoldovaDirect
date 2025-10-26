/**
 * Email Templates Module
 * Centralized exports for the email pipeline.
 * Expose namespaces to avoid Rollup duplicate-import warnings while keeping a single entry point.
 */

import * as orderConfirmation from './orderConfirmation'
import * as orderStatus from './orderStatusTemplates'
import * as translations from './translations'
import * as formatters from './formatters'
import * as dataTransformer from './dataTransformer'
import * as validator from './validator'

export {
  orderConfirmation,
  orderStatus,
  translations,
  formatters,
  dataTransformer,
  validator,
}

export const emailTemplates = {
  orderConfirmation,
  orderStatus,
  translations,
  formatters,
  dataTransformer,
  validator,
}

// Re-export types for convenience so consumers can import from a single entry point
export type {
  OrderEmailData,
  OrderItemData,
  AddressData,
  DatabaseOrder,
  DatabaseOrderItem,
  UserProfile,
  GuestCheckoutData,
  ValidationResult,
  EmailTemplateContext,
} from './types'
