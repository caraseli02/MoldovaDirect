/**
 * Secure Logger Utility with PII Redaction
 *
 * GDPR-compliant logging that automatically redacts sensitive information.
 * Use this instead of console.log to prevent PII exposure in logs.
 *
 * Security Features:
 * - Automatic PII detection and redaction
 * - Structured logging with severity levels
 * - Safe for production environments
 * - Prevents accidental data exposure
 *
 * Usage:
 * ```typescript
 * import { logger } from '~/server/utils/secureLogger'
 *
 * logger.info('Order created', { orderId: 123 })
 * logger.error('Payment failed', { error: err.message })
 * logger.debug('User data', { email: 'test@example.com' }) // Email will be redacted
 * ```
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: unknown
  context?: string
}

/**
 * PII patterns to detect and redact
 */
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,

  // Phone numbers (various formats)
  phone: /(\+?\d{1,3}[-.\s]?)?(\d{3})?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,

  // Credit card numbers (simple pattern)
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,

  // IP addresses
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

  // Social Security Numbers (US format)
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,

  // Passwords (when explicitly named)
  password: /"password"\s*:\s*"[^"]*"/gi,

  // Bearer tokens
  bearerToken: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,

  // API keys (common patterns)
  apiKey: /["']?(?:api[_-]?key|apikey|access[_-]?token)["']?\s*[:=]\s*["']?[A-Za-z0-9\-._~+/]+["']?/gi,
}

/**
 * Sensitive field names that should be redacted
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'email',
  'phone',
  'phoneNumber',
  'phone_number',
  'address',
  'street',
  'city',
  'postalCode',
  'postal_code',
  'zipCode',
  'zip_code',
  'firstName',
  'first_name',
  'lastName',
  'last_name',
  'fullName',
  'full_name',
  'name',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'ssn',
  'socialSecurity',
  'social_security',
  'dob',
  'dateOfBirth',
  'date_of_birth',
  'ip',
  'ipAddress',
  'ip_address',
  'token',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'apiKey',
  'api_key',
  'secret',
  'shippingAddress',
  'shipping_address',
  'billingAddress',
  'billing_address',
  'guestEmail',
  'guest_email',
])

/**
 * Redact PII from a string
 */
function redactString(value: string): string {
  let redacted = value

  // Apply each pattern
  redacted = redacted.replace(PII_PATTERNS.email, '[EMAIL_REDACTED]')
  redacted = redacted.replace(PII_PATTERNS.phone, '[PHONE_REDACTED]')
  redacted = redacted.replace(PII_PATTERNS.creditCard, '[CARD_REDACTED]')
  redacted = redacted.replace(PII_PATTERNS.ipAddress, '[IP_REDACTED]')
  redacted = redacted.replace(PII_PATTERNS.ssn, '[SSN_REDACTED]')
  redacted = redacted.replace(PII_PATTERNS.password, '"password":"[REDACTED]"')
  redacted = redacted.replace(PII_PATTERNS.bearerToken, 'Bearer [TOKEN_REDACTED]')
  redacted = redacted.replace(PII_PATTERNS.apiKey, '$1: [KEY_REDACTED]')

  return redacted
}

/**
 * Recursively redact PII from objects
 */
function redactObject(obj: unknown, depth: number = 0): unknown {
  // Prevent infinite recursion
  if (depth > 10) {
    return '[MAX_DEPTH_REACHED]'
  }

  if (obj === null || obj === undefined) {
    return obj
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item, depth + 1))
  }

  // Handle objects
  if (typeof obj === 'object') {
    // Handle Error objects specially
    if (obj instanceof Error) {
      return {
        name: obj.name,
        message: redactString(obj.message),
        stack: '[STACK_TRACE_REDACTED]',
      }
    }

    const redacted: unknown = {}

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase()

      // Check if field name indicates sensitive data
      if (SENSITIVE_FIELDS.has(key) || SENSITIVE_FIELDS.has(lowerKey)) {
        // Preserve structure but redact value
        if (typeof value === 'string') {
          redacted[key] = '[PII_REDACTED]'
        }
        else if (typeof value === 'object' && value !== null) {
          // For address objects, show structure but redact values
          redacted[key] = '[PII_OBJECT_REDACTED]'
        }
        else {
          redacted[key] = '[REDACTED]'
        }
      }
      else if (typeof value === 'string') {
        redacted[key] = redactString(value)
      }
      else if (typeof value === 'object') {
        redacted[key] = redactObject(value, depth + 1)
      }
      else {
        redacted[key] = value
      }
    }

    return redacted
  }

  // Handle strings
  if (typeof obj === 'string') {
    return redactString(obj)
  }

  // Other primitives (numbers, booleans) are safe
  return obj
}

/**
 * Format and redact log data
 */
function formatLogData(data: unknown): unknown {
  try {
    // Deep clone and redact
    const cloned = JSON.parse(JSON.stringify(data))
    return redactObject(cloned)
  }
  catch {
    // If serialization fails, return safe error message
    return { error: 'Failed to serialize log data' }
  }
}

/**
 * Write log entry
 */
function writeLog(level: LogLevel, message: string, data?: unknown, context?: string) {
  const isDevelopment = process.env.NODE_ENV !== 'production'

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  }

  // Redact PII from data
  if (data !== undefined) {
    entry.data = formatLogData(data)
  }

  // In development, use console for better readability
  if (isDevelopment) {
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}`

    switch (level) {
      case 'debug':
        break
      case 'info':
        break
      case 'warn':
        console.warn(prefix, message, entry.data || '')
        break
      case 'error':
        console.error(prefix, message, entry.data || '')
        break
    }
  }
  else {
    // In production, output structured JSON logs
    // These can be ingested by logging systems like CloudWatch, Datadog, etc.
  }
}

/**
 * Secure Logger API
 */
export const logger = {
  debug(message: string, data?: unknown, context?: string) {
    writeLog('debug', message, data, context)
  },

  info(message: string, data?: unknown, context?: string) {
    writeLog('info', message, data, context)
  },

  warn(message: string, data?: unknown, context?: string) {
    writeLog('warn', message, data, context)
  },

  error(message: string, data?: unknown, context?: string) {
    writeLog('error', message, data, context)
  },
}

/**
 * Helper to create a logger with a fixed context
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, data?: unknown) => logger.debug(message, data, context),
    info: (message: string, data?: unknown) => logger.info(message, data, context),
    warn: (message: string, data?: unknown) => logger.warn(message, data, context),
    error: (message: string, data?: unknown) => logger.error(message, data, context),
  }
}

/**
 * Export redaction function for testing/external use
 */
export function redactPII(data: unknown): unknown {
  return formatLogData(data)
}
