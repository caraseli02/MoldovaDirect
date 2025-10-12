// =============================================
// EMAIL LOGGING TYPES
// =============================================
// Types and interfaces for email logging system
// Requirements: 4.1, 4.2, 4.3

/**
 * Email types supported by the system
 */
export type EmailType =
  | 'order_confirmation'
  | 'order_processing'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_issue'

/**
 * Email delivery status
 */
export type EmailStatus =
  | 'pending'    // Email queued for sending
  | 'sent'       // Email sent to provider
  | 'delivered'  // Email confirmed delivered
  | 'failed'     // Email failed to send
  | 'bounced'    // Email bounced back

/**
 * Email log record from database
 */
export interface EmailLog {
  id: number
  orderId: number
  emailType: EmailType
  recipientEmail: string
  subject: string
  status: EmailStatus
  attempts: number
  lastAttemptAt?: string
  deliveredAt?: string
  bounceReason?: string
  externalId?: string
  metadata: EmailMetadata
  createdAt: string
  updatedAt: string
}

/**
 * Metadata stored with each email log
 */
export interface EmailMetadata {
  locale?: string
  templateVersion?: string
  orderNumber?: string
  customerName?: string
  [key: string]: any
}

/**
 * Input for creating a new email log entry
 */
export interface CreateEmailLogInput {
  orderId: number
  emailType: EmailType
  recipientEmail: string
  subject: string
  metadata?: EmailMetadata
}

/**
 * Input for updating an email log entry
 */
export interface UpdateEmailLogInput {
  status?: EmailStatus
  attempts?: number
  lastAttemptAt?: string
  deliveredAt?: string
  bounceReason?: string
  externalId?: string
  metadata?: EmailMetadata
}

/**
 * Email log with order information
 */
export interface EmailLogWithOrder extends EmailLog {
  order: {
    orderNumber: string
    status: string
    totalEur: number
    createdAt: string
  }
}

/**
 * Filters for querying email logs
 */
export interface EmailLogFilters {
  orderId?: number
  orderNumber?: string
  recipientEmail?: string
  emailType?: EmailType
  status?: EmailStatus
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

/**
 * Email log query response with pagination
 */
export interface EmailLogListResponse {
  logs: EmailLogWithOrder[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Email delivery statistics
 */
export interface EmailDeliveryStats {
  total: number
  sent: number
  delivered: number
  failed: number
  bounced: number
  deliveryRate: number
  bounceRate: number
}

/**
 * Email retry configuration
 */
export interface EmailRetryConfig {
  maxAttempts: number
  backoffMultiplier: number
  initialDelayMs: number
}

/**
 * Default retry configuration
 */
export const DEFAULT_EMAIL_RETRY_CONFIG: EmailRetryConfig = {
  maxAttempts: 3,
  backoffMultiplier: 2,
  initialDelayMs: 1000, // 1 second
}

/**
 * Calculate next retry delay using exponential backoff
 */
export function calculateRetryDelay(
  attempt: number,
  config: EmailRetryConfig = DEFAULT_EMAIL_RETRY_CONFIG
): number {
  return config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1)
}

/**
 * Check if email should be retried based on attempts
 */
export function shouldRetryEmail(
  attempts: number,
  config: EmailRetryConfig = DEFAULT_EMAIL_RETRY_CONFIG
): boolean {
  return attempts < config.maxAttempts
}
