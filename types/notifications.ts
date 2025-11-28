/**
 * Multi-Channel Notification System Types
 * ========================================
 * Supports: Email, WhatsApp, SMS
 * Created: 2025-11-28
 */

// =====================================================
// Notification Channels
// =====================================================

export type NotificationChannel = 'email' | 'whatsapp' | 'sms'

export type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced'
  | 'read'

export type NotificationType =
  | 'order_confirmation'
  | 'order_processing'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_issue'
  | 'support_ticket_customer'
  | 'support_ticket_staff'
  | 'auth_verification'
  | 'auth_password_reset'
  | 'auth_otp'
  | 'marketing_promo'

// =====================================================
// Notification Preferences
// =====================================================

export interface NotificationPreferences {
  id: string
  userId?: string
  guestEmail?: string

  // Contact information
  phoneNumber?: string
  phoneVerified: boolean
  phoneVerifiedAt?: string

  // Email preferences
  emailEnabled: boolean
  emailOrderConfirmation: boolean
  emailOrderUpdates: boolean
  emailShipping: boolean
  emailDelivery: boolean
  emailMarketing: boolean
  emailSupport: boolean

  // WhatsApp preferences
  whatsappEnabled: boolean
  whatsappOrderConfirmation: boolean
  whatsappOrderUpdates: boolean
  whatsappShipping: boolean
  whatsappDelivery: boolean
  whatsappMarketing: boolean
  whatsappSupport: boolean

  // SMS preferences (future)
  smsEnabled: boolean
  smsOrderConfirmation: boolean
  smsOrderUpdates: boolean
  smsShipping: boolean
  smsDelivery: boolean

  // Metadata
  preferredLanguage: 'es' | 'en' | 'ro' | 'ru'
  timezone: string

  // Audit
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationPreferencesInput {
  userId?: string
  guestEmail?: string
  phoneNumber?: string
  whatsappEnabled?: boolean
  emailEnabled?: boolean
  preferredLanguage?: 'es' | 'en' | 'ro' | 'ru'
}

export interface UpdateNotificationPreferencesInput {
  phoneNumber?: string
  whatsappEnabled?: boolean
  emailEnabled?: boolean
  whatsappOrderConfirmation?: boolean
  whatsappOrderUpdates?: boolean
  whatsappShipping?: boolean
  whatsappDelivery?: boolean
  emailOrderConfirmation?: boolean
  emailOrderUpdates?: boolean
  emailShipping?: boolean
  emailDelivery?: boolean
  preferredLanguage?: 'es' | 'en' | 'ro' | 'ru'
}

// =====================================================
// Notification Logs
// =====================================================

export interface NotificationLog {
  id: string
  channel: NotificationChannel
  recipientEmail?: string
  recipientPhone?: string
  userId?: string
  notificationType: NotificationType
  orderId?: string
  subject?: string
  templateId?: string
  templateVersion: number
  status: NotificationStatus
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failedAt?: string
  attemptCount: number
  maxAttempts: number
  nextRetryAt?: string
  lastError?: string
  externalId?: string
  provider?: string
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationLogInput {
  channel: NotificationChannel
  recipientEmail?: string
  recipientPhone?: string
  userId?: string
  notificationType: NotificationType
  orderId?: string
  subject?: string
  templateId?: string
  templateVersion?: number
  metadata?: Record<string, any>
  provider?: string
}

export interface UpdateNotificationLogInput {
  status?: NotificationStatus
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failedAt?: string
  attemptCount?: number
  nextRetryAt?: string
  lastError?: string
  externalId?: string
}

// =====================================================
// WhatsApp Specific Types
// =====================================================

export interface WhatsAppConfig {
  accountSid: string
  authToken: string
  whatsappNumber: string // Format: whatsapp:+1234567890
  provider: 'twilio' | 'messagebird' | 'whatsapp_cloud' | '360dialog'
}

export interface WhatsAppTemplate {
  id: string // Template content SID (Twilio) or template name
  name: string
  language: 'es' | 'en' | 'ro' | 'ru'
  category: 'authentication' | 'utility' | 'marketing'
  status: 'approved' | 'pending' | 'rejected'
  components: WhatsAppTemplateComponent[]
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'footer' | 'buttons'
  text?: string
  parameters?: WhatsAppTemplateParameter[]
}

export interface WhatsAppTemplateParameter {
  type: 'text' | 'currency' | 'date_time'
  value: string
}

export interface WhatsAppMessageParams {
  to: string // E.164 format: +1234567890
  templateId: string // Content SID or template name
  parameters?: string[] // Template variables: ['Order #123', '$49.99', ...]
  language?: 'es' | 'en' | 'ro' | 'ru'
}

export interface WhatsAppSendResult {
  success: boolean
  messageId?: string // External provider message ID
  status?: string
  error?: string
  errorCode?: string
  timestamp: Date
}

// =====================================================
// Multi-Channel Notification Types
// =====================================================

export interface SendNotificationParams {
  channel: NotificationChannel
  notificationType: NotificationType
  recipient: {
    email?: string
    phone?: string
    userId?: string
    name?: string
  }
  orderId?: string
  templateData: Record<string, any>
  locale?: 'es' | 'en' | 'ro' | 'ru'
  metadata?: Record<string, any>
}

export interface SendNotificationResult {
  success: boolean
  channel: NotificationChannel
  logId?: string
  externalId?: string
  error?: string
}

export interface NotificationChannelResult {
  channel: NotificationChannel
  success: boolean
  logId?: string
  externalId?: string
  error?: string
}

export interface MultiChannelSendResult {
  orderId?: string
  userId?: string
  results: NotificationChannelResult[]
  successCount: number
  failureCount: number
  timestamp: Date
}

// =====================================================
// Retry & Stats Types
// =====================================================

export interface NotificationRetryJob {
  id: string
  channel: NotificationChannel
  recipientEmail?: string
  recipientPhone?: string
  notificationType: NotificationType
  templateId?: string
  metadata: Record<string, any>
  attemptCount: number
  lastError?: string
}

export interface NotificationStats {
  channel: NotificationChannel
  notificationType: NotificationType
  totalSent: number
  totalDelivered: number
  totalFailed: number
  totalBounced: number
  totalRead: number
  deliveryRate: number // Percentage
  readRate: number // Percentage (WhatsApp only)
}

export interface ChannelAvailability {
  email: boolean
  whatsapp: boolean
  sms: boolean
  errors: {
    email?: string
    whatsapp?: string
    sms?: string
  }
}

// =====================================================
// Phone Verification Types (for WhatsApp Auth)
// =====================================================

export interface PhoneVerificationRequest {
  phoneNumber: string // E.164 format
  userId?: string
  channel: 'whatsapp' | 'sms'
  locale?: 'es' | 'en' | 'ro' | 'ru'
}

export interface PhoneVerificationResult {
  success: boolean
  verificationId?: string
  expiresAt?: Date
  error?: string
}

export interface PhoneVerificationConfirm {
  phoneNumber: string
  code: string // 6-digit OTP
  verificationId?: string
}

export interface PhoneVerificationConfirmResult {
  success: boolean
  verified: boolean
  error?: string
}

// =====================================================
// Template Management Types
// =====================================================

export interface NotificationTemplate {
  id: string
  name: string
  channel: NotificationChannel
  notificationType: NotificationType
  locale: 'es' | 'en' | 'ro' | 'ru'
  subject?: string // Email only
  body: string
  variables: string[] // ['orderNumber', 'customerName', 'total', ...]
  externalId?: string // Provider template ID
  status: 'active' | 'draft' | 'archived'
  version: number
  createdAt: string
  updatedAt: string
}

export interface CreateTemplateInput {
  name: string
  channel: NotificationChannel
  notificationType: NotificationType
  locale: 'es' | 'en' | 'ro' | 'ru'
  subject?: string
  body: string
  variables: string[]
}

// =====================================================
// User-Facing Types (Frontend)
// =====================================================

export interface NotificationPreferencesForm {
  emailEnabled: boolean
  emailOrderUpdates: boolean
  emailMarketing: boolean

  whatsappEnabled: boolean
  whatsappOrderUpdates: boolean
  whatsappMarketing: boolean
  phoneNumber?: string

  preferredLanguage: 'es' | 'en' | 'ro' | 'ru'
}

export interface NotificationHistoryItem {
  id: string
  channel: NotificationChannel
  type: string
  subject?: string
  sentAt: string
  status: NotificationStatus
  readAt?: string
}

// =====================================================
// Validation Helper Types
// =====================================================

export interface PhoneValidationResult {
  valid: boolean
  formatted?: string // E.164 format
  country?: string
  countryCode?: string
  nationalNumber?: string
  error?: string
}

export interface NotificationEligibility {
  canSendEmail: boolean
  canSendWhatsApp: boolean
  canSendSMS: boolean
  reasons: {
    email?: string
    whatsapp?: string
    sms?: string
  }
}
