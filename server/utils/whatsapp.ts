/**
 * WhatsApp Client Wrapper
 * ========================
 * Base utilities for sending WhatsApp messages via Business API
 * Supports: Twilio, WhatsApp Cloud API, MessageBird, 360dialog
 * Created: 2025-11-28
 */

import type {
  WhatsAppConfig,
  WhatsAppMessageParams,
  WhatsAppSendResult,
} from '~/types/notifications'

// =====================================================
// Configuration
// =====================================================

/**
 * Get WhatsApp configuration from environment
 */
export function getWhatsAppConfig(): WhatsAppConfig | null {
  const config = useRuntimeConfig()

  // Check if WhatsApp is configured
  if (!config.whatsappAccountSid || !config.whatsappAuthToken || !config.whatsappNumber) {
    console.warn('[WhatsApp] Not configured - missing environment variables')
    return null
  }

  return {
    accountSid: config.whatsappAccountSid,
    authToken: config.whatsappAuthToken,
    whatsappNumber: config.whatsappNumber,
    provider: (config.whatsappProvider as WhatsAppConfig['provider']) || 'twilio',
  }
}

/**
 * Check if WhatsApp is available and configured
 */
export function isWhatsAppAvailable(): boolean {
  const config = getWhatsAppConfig()
  return config !== null
}

// =====================================================
// Twilio WhatsApp Integration
// =====================================================

/**
 * Send WhatsApp message via Twilio
 * Uses Content Templates (pre-approved by Meta)
 */
async function sendWhatsAppViaTwilio(
  params: WhatsAppMessageParams,
  config: WhatsAppConfig
): Promise<WhatsAppSendResult> {
  try {
    // Lazy-load Twilio SDK (only when needed)
    // Note: You'll need to install: npm install twilio
    // @ts-ignore - Twilio will be installed separately
    const twilio = (await import('twilio')).default
    const client = twilio(config.accountSid, config.authToken)

    // Format phone numbers for WhatsApp
    const from = `whatsapp:${config.whatsappNumber}`
    const to = `whatsapp:${params.to}`

    // Prepare template variables
    const contentVariables: Record<string, string> = {}
    if (params.parameters && params.parameters.length > 0) {
      params.parameters.forEach((value, index) => {
        contentVariables[`${index + 1}`] = value
      })
    }

    // Send message using Content Template
    const message = await client.messages.create({
      from,
      to,
      contentSid: params.templateId, // Pre-approved template ID
      contentVariables: JSON.stringify(contentVariables),
    })

    return {
      success: true,
      messageId: message.sid,
      status: message.status,
      timestamp: new Date(),
    }
  } catch (error: any) {
    console.error('[WhatsApp] Twilio send error:', error)

    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
      errorCode: error.code,
      timestamp: new Date(),
    }
  }
}

// =====================================================
// WhatsApp Cloud API Integration (Direct to Meta)
// =====================================================

/**
 * Send WhatsApp message via WhatsApp Cloud API
 * More cost-effective but requires more setup
 */
async function sendWhatsAppViaCloudAPI(
  params: WhatsAppMessageParams,
  config: WhatsAppConfig
): Promise<WhatsAppSendResult> {
  try {
    const apiVersion = 'v18.0'
    const phoneNumberId = config.accountSid // Phone Number ID from Meta
    const accessToken = config.authToken // Access token from Meta

    // Prepare template message payload
    const payload = {
      messaging_product: 'whatsapp',
      to: params.to.replace(/[^0-9]/g, ''), // Remove + and formatting
      type: 'template',
      template: {
        name: params.templateId,
        language: {
          code: params.language || 'es',
        },
        components: [
          {
            type: 'body',
            parameters: (params.parameters || []).map((value) => ({
              type: 'text',
              text: value,
            })),
          },
        ],
      },
    }

    // Send request to WhatsApp Cloud API
    const response = await $fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      }
    )

    return {
      success: true,
      messageId: (response as any).messages?.[0]?.id,
      status: 'sent',
      timestamp: new Date(),
    }
  } catch (error: any) {
    console.error('[WhatsApp] Cloud API send error:', error)

    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
      errorCode: error.statusCode,
      timestamp: new Date(),
    }
  }
}

// =====================================================
// MessageBird Integration
// =====================================================

/**
 * Send WhatsApp message via MessageBird
 * European provider with competitive pricing
 */
async function sendWhatsAppViaMessageBird(
  params: WhatsAppMessageParams,
  config: WhatsAppConfig
): Promise<WhatsAppSendResult> {
  try {
    const apiKey = config.authToken
    const channelId = config.accountSid

    // Prepare template message
    const payload = {
      to: params.to,
      type: 'hsm', // High-Structured Message (template)
      content: {
        hsm: {
          namespace: 'your_namespace', // Configure this
          templateName: params.templateId,
          language: {
            policy: 'deterministic',
            code: params.language || 'es',
          },
          params: (params.parameters || []).map((value) => ({
            default: value,
          })),
        },
      },
    }

    const response = await $fetch(
      `https://conversations.messagebird.com/v1/conversations/start`,
      {
        method: 'POST',
        headers: {
          'Authorization': `AccessKey ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      }
    )

    return {
      success: true,
      messageId: (response as any).id,
      status: 'sent',
      timestamp: new Date(),
    }
  } catch (error: any) {
    console.error('[WhatsApp] MessageBird send error:', error)

    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
      errorCode: error.statusCode,
      timestamp: new Date(),
    }
  }
}

// =====================================================
// Main Send Function (Provider Agnostic)
// =====================================================

/**
 * Send WhatsApp message (automatically selects provider)
 *
 * @param params - Message parameters (recipient, template, variables)
 * @returns Send result with message ID or error
 *
 * @example
 * ```typescript
 * const result = await sendWhatsAppMessage({
 *   to: '+40123456789',
 *   templateId: 'order_confirmation',
 *   parameters: ['ORD-123', 'John Doe', '$49.99'],
 *   language: 'ro'
 * })
 * ```
 */
export async function sendWhatsAppMessage(
  params: WhatsAppMessageParams
): Promise<WhatsAppSendResult> {
  // Check if WhatsApp is configured
  const config = getWhatsAppConfig()
  if (!config) {
    return {
      success: false,
      error: 'WhatsApp not configured',
      timestamp: new Date(),
    }
  }

  // Validate phone number (E.164 format)
  if (!params.to.match(/^\+[1-9]\d{1,14}$/)) {
    return {
      success: false,
      error: 'Invalid phone number format (use E.164: +1234567890)',
      timestamp: new Date(),
    }
  }

  // Log send attempt (development)
  if (process.env.NODE_ENV === 'development') {
    console.log('[WhatsApp] Sending message:', {
      to: params.to,
      template: params.templateId,
      provider: config.provider,
    })
  }

  // Route to appropriate provider
  switch (config.provider) {
    case 'twilio':
      return await sendWhatsAppViaTwilio(params, config)

    case 'whatsapp_cloud':
      return await sendWhatsAppViaCloudAPI(params, config)

    case 'messagebird':
      return await sendWhatsAppViaMessageBird(params, config)

    case '360dialog':
      // Similar to Cloud API (uses same endpoints)
      return await sendWhatsAppViaCloudAPI(params, config)

    default:
      return {
        success: false,
        error: `Unknown provider: ${config.provider}`,
        timestamp: new Date(),
      }
  }
}

// =====================================================
// Development/Testing Helpers
// =====================================================

/**
 * Send test WhatsApp message (development only)
 */
export async function sendTestWhatsAppMessage(
  phoneNumber: string,
  locale: 'es' | 'en' | 'ro' | 'ru' = 'es'
): Promise<WhatsAppSendResult> {
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'Test messages not allowed in production',
      timestamp: new Date(),
    }
  }

  return await sendWhatsAppMessage({
    to: phoneNumber,
    templateId: 'test_template', // You'll need to create this in WhatsApp
    parameters: ['Test User', new Date().toISOString()],
    language: locale,
  })
}

/**
 * Mock WhatsApp send (for local development without API)
 */
export function mockWhatsAppSend(
  params: WhatsAppMessageParams
): WhatsAppSendResult {
  console.log('[WhatsApp] MOCK SEND:', {
    to: params.to,
    template: params.templateId,
    params: params.parameters,
  })

  return {
    success: true,
    messageId: `mock_${Date.now()}`,
    status: 'sent',
    timestamp: new Date(),
  }
}

// =====================================================
// Phone Number Utilities
// =====================================================

/**
 * Format phone number to E.164 international format
 *
 * @param phone - Raw phone number
 * @param defaultCountryCode - Default country code if not provided (e.g., 'RO' for Romania)
 * @returns Formatted phone number or null if invalid
 *
 * @example
 * formatPhoneNumber('0712345678', 'RO') // Returns: +40712345678
 * formatPhoneNumber('+1 (555) 123-4567') // Returns: +15551234567
 */
export function formatPhoneNumber(
  phone: string,
  defaultCountryCode?: string
): string | null {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // If no + prefix, add country code
  if (!cleaned.startsWith('+')) {
    const countryPrefixes: Record<string, string> = {
      RO: '40', // Romania
      MD: '373', // Moldova
      ES: '34', // Spain
      US: '1', // United States
      RU: '7', // Russia
    }

    const prefix = defaultCountryCode ? countryPrefixes[defaultCountryCode] : null
    if (prefix) {
      // Remove leading 0 if present
      cleaned = cleaned.replace(/^0+/, '')
      cleaned = `+${prefix}${cleaned}`
    }
  }

  // Validate E.164 format
  if (!cleaned.match(/^\+[1-9]\d{1,14}$/)) {
    return null
  }

  return cleaned
}

/**
 * Validate phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  return formatPhoneNumber(phone) !== null
}
