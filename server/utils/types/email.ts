/**
 * Shared Email Types
 *
 * Centralized type definitions for email functionality to avoid duplication
 * and ensure consistency across order and support email utilities.
 */

/**
 * Result of an email sending operation
 * Used by both order and support email utilities
 */
export interface EmailSendResult {
  success: boolean
  /** Email log ID from database (optional for opted-out users) */
  emailLogId?: number
  /** External email service ID (e.g., Resend message ID) */
  externalId?: string
  /** Error message if sending failed */
  error?: string
}

/**
 * Options for email sending operations
 */
export interface EmailSendOptions {
  /** Optional Supabase client to use (for testing or custom contexts) */
  supabaseClient?: any // Import ResolvedSupabaseClient type if needed
}
