# Secure Logger Usage Guide

**Last Updated:** November 16, 2025
**Location:** `server/utils/secureLogger.ts`
**Related:** [GDPR Compliance Guide](./GDPR_COMPLIANCE.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [What Gets Redacted](#what-gets-redacted)
4. [API Reference](#api-reference)
5. [Usage Examples](#usage-examples)
6. [Migration Guide](#migration-guide)
7. [Testing](#testing)
8. [Best Practices](#best-practices)

---

## Overview

The Secure Logger is a GDPR-compliant logging utility that **automatically redacts personally identifiable information (PII)** from log messages. This prevents accidental exposure of sensitive data in application logs, server logs, and log aggregation systems.

### Why Use Secure Logger?

**Legal Compliance:**
- GDPR Article 5.1f: Data must be processed securely
- GDPR Article 32: Implement appropriate security measures
- Prevents PII breaches through log exposure

**Security Benefits:**
- Automatic detection and redaction of 8+ PII types
- Prevents credential leaks in error messages
- Safe for production log aggregation (CloudWatch, Datadog)
- Protects against log injection attacks

**Developer Experience:**
- Drop-in replacement for `console.log`
- Structured logging with severity levels
- Context-aware logging
- Zero configuration needed

---

## Quick Start

### Basic Usage

```typescript
import { logger } from '~/server/utils/secureLogger'

// ✅ Safe: PII automatically redacted
logger.info('User logged in', {
  userId: 123,
  email: 'user@example.com',  // → '[EMAIL_REDACTED]'
  ip: '192.168.1.1'            // → '[IP_REDACTED]'
})
```

### Context Logger (Recommended)

```typescript
import { createLogger } from '~/server/utils/secureLogger'

// Create logger with fixed context
const logger = createLogger('checkout')

logger.info('Order created', { orderId: 456 })
// Output: [2025-11-16T10:00:00Z] [INFO] [checkout] Order created { orderId: 456 }
```

###Replace console.log

```typescript
// ❌ UNSAFE - PII exposed in logs
console.log('User data:', {
  email: user.email,
  phone: user.phone
})

// ✅ SAFE - PII automatically redacted
logger.debug('User data', {
  email: user.email,  // → '[EMAIL_REDACTED]'
  phone: user.phone   // → '[PHONE_REDACTED]'
})
```

---

## What Gets Redacted

### Pattern-Based Redaction

The logger detects and redacts PII using regex patterns:

| Type | Pattern Example | Redacted To |
|------|----------------|-------------|
| **Email** | `user@example.com` | `[EMAIL_REDACTED]` |
| **Phone** | `+1-555-123-4567`<br>`(555) 123-4567`<br>`555.123.4567` | `[PHONE_REDACTED]` |
| **Credit Card** | `4111-1111-1111-1111`<br>`4111 1111 1111 1111` | `[CARD_REDACTED]` |
| **IP Address** | `192.168.1.1` | `[IP_REDACTED]` |
| **SSN** | `123-45-6789` | `[SSN_REDACTED]` |
| **Password** | `"password":"secret123"` | `"password":"[REDACTED]"` |
| **Bearer Token** | `Bearer eyJhbG...` | `Bearer [TOKEN_REDACTED]` |
| **API Key** | `api_key: sk_live_...` | `api_key: [KEY_REDACTED]` |

### Field Name-Based Redaction

Values of these field names are **always** redacted (case-insensitive):

```typescript
const SENSITIVE_FIELDS = [
  // Identity
  'firstName', 'first_name', 'lastName', 'last_name',
  'fullName', 'full_name', 'name',

  // Contact
  'email', 'phone', 'phoneNumber', 'phone_number',

  // Location
  'address', 'street', 'city', 'state', 'country',
  'postalCode', 'postal_code', 'zipCode', 'zip_code',
  'shippingAddress', 'shipping_address',
  'billingAddress', 'billing_address',

  // Sensitive IDs
  'ssn', 'socialSecurity', 'social_security',
  'dob', 'dateOfBirth', 'date_of_birth',

  // Financial
  'creditCard', 'credit_card', 'cardNumber', 'card_number',
  'cvv', 'cvc', 'expiryDate', 'expiry_date',

  // Auth
  'password', 'token', 'accessToken', 'access_token',
  'refreshToken', 'refresh_token', 'apiKey', 'api_key',
  'secret', 'secretKey', 'secret_key',

  // Network
  'ip', 'ipAddress', 'ip_address', 'userAgent', 'user_agent',

  // Guest checkout
  'guestEmail', 'guest_email',
]
```

---

## API Reference

### `logger` Object

Global logger instance with severity levels.

#### `logger.debug(message, data?, context?)`

**Use for:** Detailed debugging information (development only).

```typescript
logger.debug('Cart calculation details', {
  subtotal: 99.99,
  tax: 8.50,
  total: 108.49
})
```

#### `logger.info(message, data?, context?)`

**Use for:** General informational messages.

```typescript
logger.info('Order created successfully', {
  orderId: 123,
  total: 108.49
})
```

#### `logger.warn(message, data?, context?)`

**Use for:** Warning messages that don't prevent operation.

```typescript
logger.warn('Payment method deprecated', {
  method: 'bank_transfer_manual',
  userId: 123
})
```

#### `logger.error(message, data?, context?)`

**Use for:** Error conditions and exceptions.

```typescript
logger.error('Payment processing failed', {
  error: error.message,
  orderId: 123,
  amount: 108.49
})
```

**Parameters:**
- `message` (string): Human-readable log message
- `data` (any, optional): Additional context (auto-redacted)
- `context` (string, optional): Logger context (e.g., 'checkout', 'auth')

---

### `createLogger(context)`

Creates a logger with fixed context for better log organization.

```typescript
const checkoutLogger = createLogger('checkout')
const authLogger = createLogger('auth')

checkoutLogger.info('Payment processed')  // [INFO] [checkout] Payment processed
authLogger.info('User logged in')         // [INFO] [auth] User logged in
```

**Parameters:**
- `context` (string): Fixed context for all logs from this logger

**Returns:** Logger object with `debug`, `info`, `warn`, `error` methods

---

### `redactPII(data)`

**Utility function** to manually redact PII from data (useful for testing).

```typescript
import { redactPII } from '~/server/utils/secureLogger'

const unsafe = {
  email: 'user@example.com',
  phone: '+1-555-1234',
  userId: 123
}

const safe = redactPII(unsafe)
// { email: '[EMAIL_REDACTED]', phone: '[PHONE_REDACTED]', userId: 123 }
```

---

## Usage Examples

### Example 1: API Endpoint Logging

```typescript
// server/api/checkout/create-order.post.ts
import { createLogger } from '~/server/utils/secureLogger'

const logger = createLogger('create-order')

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // ✅ Safe: Email/address fields auto-redacted
    logger.info('Creating order', {
      userId: body.userId,
      total: body.total,
      email: body.email,           // → '[EMAIL_REDACTED]'
      address: body.shippingAddress // → '[PII_OBJECT_REDACTED]'
    })

    const order = await createOrder(body)

    logger.info('Order created', {
      orderId: order.id,
      total: order.total
    })

    return { success: true, orderId: order.id }

  } catch (error) {
    // ✅ Safe: Error messages auto-redacted
    logger.error('Order creation failed', {
      error: error.message,  // May contain email → auto-redacted
      userId: body.userId
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create order'
    })
  }
})
```

### Example 2: Authentication Logging

```typescript
// server/api/auth/login.post.ts
import { createLogger } from '~/server/utils/secureLogger'

const logger = createLogger('auth')

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const clientIP = getClientIP(event)

  try {
    const { user, session } = await authenticateUser(email, password)

    // ✅ Safe: Email and IP auto-redacted
    logger.info('Login successful', {
      userId: user.id,
      email: email,      // → '[EMAIL_REDACTED]'
      ip: clientIP       // → '[IP_REDACTED]'
    })

    return { user, session }

  } catch (error) {
    // ✅ Safe: Failed login logged without exposing email
    logger.warn('Login failed', {
      email: email,      // → '[EMAIL_REDACTED]'
      ip: clientIP,      // → '[IP_REDACTED]'
      reason: error.message
    })

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }
})
```

### Example 3: Payment Processing

```typescript
// server/api/checkout/process-payment.post.ts
import { createLogger } from '~/server/utils/secureLogger'

const logger = createLogger('payment')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // ✅ Safe: Credit card details auto-redacted
  logger.info('Processing payment', {
    orderId: body.orderId,
    amount: body.amount,
    cardNumber: body.cardNumber,  // → '[CARD_REDACTED]'
    cvv: body.cvv                  // → '[REDACTED]' (sensitive field)
  })

  try {
    const result = await stripeClient.charges.create({
      amount: body.amount,
      source: body.paymentToken  // Token is safe (not PII)
    })

    logger.info('Payment successful', {
      orderId: body.orderId,
      chargeId: result.id,
      amount: result.amount
    })

    return { success: true }

  } catch (error) {
    // ✅ Safe: Stripe error messages may contain email → auto-redacted
    logger.error('Payment failed', {
      error: error.message,
      orderId: body.orderId,
      stripeCode: error.code
    })

    throw createError({
      statusCode: 402,
      statusMessage: 'Payment failed'
    })
  }
})
```

### Example 4: User Registration

```typescript
// server/api/auth/register.post.ts
import { createLogger } from '~/server/utils/secureLogger'

const logger = createLogger('registration')

export default defineEventHandler(async (event) => {
  const userData = await readBody(event)

  // ✅ Safe: All PII fields auto-redacted
  logger.info('Registration attempt', {
    email: userData.email,            // → '[EMAIL_REDACTED]'
    firstName: userData.firstName,    // → '[PII_REDACTED]'
    lastName: userData.lastName,      // → '[PII_REDACTED]'
    phone: userData.phone              // → '[PHONE_REDACTED]'
  })

  try {
    const user = await createUser(userData)

    logger.info('User registered successfully', {
      userId: user.id,
      // Don't log email again, use userId for tracking
    })

    return { userId: user.id }

  } catch (error) {
    logger.error('Registration failed', {
      error: error.message,
      email: userData.email  // → '[EMAIL_REDACTED]'
    })

    throw createError({
      statusCode: 400,
      statusMessage: 'Registration failed'
    })
  }
})
```

### Example 5: Nested Object Redaction

```typescript
import { logger } from '~/server/utils/secureLogger'

const orderData = {
  orderId: 123,
  customer: {
    userId: 456,
    email: 'user@example.com',
    phone: '+1-555-1234',
    address: {
      street: '123 Main St',
      city: 'New York',
      zip: '10001'
    }
  },
  items: [
    { productId: 789, quantity: 2 }
  ]
}

// ✅ Recursively redacts nested objects
logger.debug('Order details', orderData)

// Output (auto-redacted):
{
  orderId: 123,
  customer: {
    userId: 456,
    email: '[EMAIL_REDACTED]',
    phone: '[PHONE_REDACTED]',
    address: '[PII_OBJECT_REDACTED]'  // Entire address object redacted
  },
  items: [
    { productId: 789, quantity: 2 }   // Safe data preserved
  ]
}
```

---

## Migration Guide

### Step 1: Import Secure Logger

**Before:**
```typescript
// No imports needed for console.log
```

**After:**
```typescript
import { createLogger } from '~/server/utils/secureLogger'

const logger = createLogger('your-context')
```

### Step 2: Replace console.log Calls

**Pattern 1: Simple Logs**
```typescript
// Before
console.log('User created')

// After
logger.info('User created')
```

**Pattern 2: Logs with Data**
```typescript
// Before
console.log('User created:', { userId: 123, email: user.email })

// After
logger.info('User created', { userId: 123, email: user.email })
```

**Pattern 3: Error Logging**
```typescript
// Before
console.error('Payment failed:', error)

// After
logger.error('Payment failed', { error: error.message })
```

### Step 3: Remove String Interpolation

**Before:**
```typescript
console.log(`User ${user.email} logged in`)
```

**After:**
```typescript
logger.info('User logged in', {
  userId: user.id,
  email: user.email  // Auto-redacted
})
```

### Step 4: Test Redaction

```typescript
// Add test to verify PII is redacted
import { redactPII } from '~/server/utils/secureLogger'

const testData = { email: 'test@example.com' }
const redacted = redactPII(testData)
console.assert(redacted.email === '[EMAIL_REDACTED]')
```

---

## Testing

### Unit Tests

```typescript
// tests/unit/secureLogger.test.ts
import { describe, it, expect } from 'vitest'
import { redactPII } from '~/server/utils/secureLogger'

describe('Secure Logger PII Redaction', () => {
  it('should redact email addresses', () => {
    const data = { email: 'user@example.com', userId: 123 }
    const redacted = redactPII(data)

    expect(redacted.email).toBe('[EMAIL_REDACTED]')
    expect(redacted.userId).toBe(123)  // Non-PII preserved
  })

  it('should redact phone numbers', () => {
    const data = { phone: '+1-555-123-4567' }
    const redacted = redactPII(data)

    expect(redacted.phone).toBe('[PHONE_REDACTED]')
  })

  it('should redact credit card numbers', () => {
    const data = { cardNumber: '4111-1111-1111-1111' }
    const redacted = redactPII(data)

    expect(redacted.cardNumber).toBe('[CARD_REDACTED]')
  })

  it('should redact nested objects', () => {
    const data = {
      user: {
        email: 'user@example.com',
        address: { street: '123 Main St' }
      }
    }
    const redacted = redactPII(data)

    expect(redacted.user.email).toBe('[EMAIL_REDACTED]')
    expect(redacted.user.address).toBe('[PII_OBJECT_REDACTED]')
  })

  it('should redact sensitive field names', () => {
    const data = { password: 'secret123', apiKey: 'sk_live_abc123' }
    const redacted = redactPII(data)

    expect(redacted.password).toBe('[REDACTED]')
    expect(redacted.apiKey).toBe('[REDACTED]')
  })

  it('should handle arrays', () => {
    const data = {
      users: [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' }
      ]
    }
    const redacted = redactPII(data)

    expect(redacted.users[0].email).toBe('[EMAIL_REDACTED]')
    expect(redacted.users[1].email).toBe('[EMAIL_REDACTED]')
  })
})
```

### Manual Testing

```typescript
// Test in development console
import { logger } from '~/server/utils/secureLogger'

// Test each PII type
logger.debug('PII Test', {
  email: 'user@example.com',
  phone: '+1-555-1234',
  card: '4111-1111-1111-1111',
  ip: '192.168.1.1',
  ssn: '123-45-6789',
  password: 'secret123'
})

// Check console output - all values should be [REDACTED]
```

---

## Best Practices

### DO's ✅

1. **Use context loggers**
   ```typescript
   const logger = createLogger('checkout')  // Better traceability
   ```

2. **Log structured data**
   ```typescript
   logger.info('Order created', { orderId: 123, total: 99.99 })
   ```

3. **Log errors safely**
   ```typescript
   logger.error('Payment failed', {
     error: error.message,  // Safe, auto-redacted
     orderId: order.id
   })
   ```

4. **Trust automatic redaction**
   ```typescript
   // No need to manually redact
   logger.info('User data', {
     email: user.email  // Auto-redacted
   })
   ```

### DON'Ts ❌

1. **Don't use console.log with user data**
   ```typescript
   // ❌ WRONG - PII exposed
   console.log('User:', user.email)

   // ✅ CORRECT
   logger.info('User data', { email: user.email })
   ```

2. **Don't manually redact** (trust the logger)
   ```typescript
   // ❌ WRONG - Unnecessary manual work
   logger.info('User data', { email: '[REDACTED]' })

   // ✅ CORRECT - Let logger handle it
   logger.info('User data', { email: user.email })
   ```

3. **Don't use string interpolation with PII**
   ```typescript
   // ❌ WRONG - Email in string isn't redacted
   logger.info(`User ${user.email} registered`)

   // ✅ CORRECT - Email in object is redacted
   logger.info('User registered', { userId: user.id })
   ```

4. **Don't log passwords (even with redaction)**
   ```typescript
   // ❌ WRONG - Don't log passwords at all
   logger.debug('Auth attempt', { password: password })

   // ✅ CORRECT - Log success/failure without password
   logger.info('Auth attempt', { userId: user.id })
   ```

### Performance Tips

1. **Use appropriate log levels**
   - `debug`: Development only
   - `info`: Production informational
   - `warn`: Potential issues
   - `error`: Actual errors

2. **Don't log in hot paths**
   ```typescript
   // ❌ WRONG - Logging in loop (10,000x)
   items.forEach(item => {
     logger.debug('Processing item', { id: item.id })
   })

   // ✅ CORRECT - Log once
   logger.debug('Processing items', { count: items.length })
   ```

3. **Limit data size**
   ```typescript
   // ❌ WRONG - Logging huge arrays
   logger.debug('All products', { products: allProducts })  // 1000+ items

   // ✅ CORRECT - Log summary
   logger.debug('Product query', { count: products.length })
   ```

---

## Advanced Usage

### Custom PII Patterns

If you need to add new PII patterns, edit `server/utils/secureLogger.ts`:

```typescript
const PII_PATTERNS = {
  // ... existing patterns

  // Add new pattern
  customID: /CUSTOM-\d{8}/g,  // Matches "CUSTOM-12345678"
}

// Update redaction function
function redactString(value: string): string {
  let redacted = value
  // ... existing redactions
  redacted = redacted.replace(PII_PATTERNS.customID, '[CUSTOM_ID_REDACTED]')
  return redacted
}
```

### Adding Sensitive Fields

To add new field names to auto-redact:

```typescript
const SENSITIVE_FIELDS = new Set([
  // ... existing fields
  'yourNewField',
  'your_new_field',  // Support both naming conventions
])
```

---

## Related Documentation

- [GDPR Compliance Guide](./GDPR_COMPLIANCE.md)
- [Rate Limiting Guide](./RATE_LIMITING.md)
- [Authentication Security](/docs/features/authentication/README.md)

---

## Troubleshooting

**Q: My custom field isn't being redacted**
A: Add it to `SENSITIVE_FIELDS` in `secureLogger.ts`

**Q: IP addresses aren't being redacted**
A: IPv6 addresses may not match the pattern. Update `PII_PATTERNS.ipAddress` to include IPv6.

**Q: Performance issues with logging**
A: Use `logger.debug` for verbose logs (disabled in production) or reduce log frequency.

**Q: How to test redaction?**
A: Use `redactPII()` function in tests:
```typescript
import { redactPII } from '~/server/utils/secureLogger'
const safe = redactPII({ email: 'test@example.com' })
expect(safe.email).toBe('[EMAIL_REDACTED]')
```

---

**Questions or Issues?**
GitHub Issues: https://github.com/caraseli02/MoldovaDirect/issues
Contact: dev@moldovadirect.com

---

*This logger is part of Moldova Direct's GDPR compliance implementation.*
