/**
 * Email Templates Module
 * Centralized exports for the email pipeline.
 * Expose namespaces to avoid Rollup duplicate-import warnings while keeping a single entry point.
 */

import * as orderConfirmation from './orderConfirmation'
import * as orderStatus from './orderStatusTemplates'
import * as translations from './translations'
import * as formatters from './formatters'
import * as validator from './validator'

export {
  orderConfirmation,
  orderStatus,
  translations,
  formatters,
  validator,
}

export const emailTemplates = {
  orderConfirmation,
  orderStatus,
  translations,
  formatters,
  validator,
}

// Note: Types are auto-imported by Nuxt from ./types.ts
// Do not re-export them here to avoid duplicate import warnings
