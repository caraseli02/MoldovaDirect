# GDPR Compliance Guide

## Prerequisites

- [Add prerequisites here]

## Steps


**Last Updated:** November 16, 2025
**Status:** Active Implementation
**Related PR:** #255

---

## Table of Contents

1. [Overview](#overview)
2. [GDPR Requirements Implemented](#gdpr-requirements-implemented)
3. [Right to Erasure (Article 17)](#right-to-erasure-article-17)
4. [PII Protection (Article 5)](#pii-protection-article-5)
5. [Data Retention Policies (Article 5.1e)](#data-retention-policies-article-51e)
6. [Developer Guidelines](#developer-guidelines)
7. [Testing GDPR Compliance](#testing-gdpr-compliance)
8. [Audit & Compliance](#audit--compliance)

---

## Overview

Moldova Direct implements GDPR (General Data Protection Regulation) compliance measures to protect user privacy and data rights. This guide documents the technical implementation of GDPR requirements and provides guidance for developers on maintaining compliance.

### Implementation Status

| GDPR Requirement | Status | Implementation |
|-----------------|--------|----------------|
| Right to Erasure (Article 17) | ✅ Complete | Atomic account deletion |
| PII Protection (Article 5) | ✅ Complete | Secure logger with auto-redaction |
| Data Minimization (Article 5.1c) | ✅ Complete | Selective PII collection |
| Purpose Limitation (Article 5.1b) | ✅ Complete | Audit logging |
| Storage Limitation (Article 5.1e) | ⚠️ Planned | Data retention policies (pending migration) |
| Security (Article 32) | ✅ Complete | Rate limiting, encryption |

---

## GDPR Requirements Implemented

### Article 17: Right to Erasure ("Right to be Forgotten")

**Requirement:** Users have the right to obtain erasure of personal data without undue delay.

**Implementation:**
- Atomic account deletion via database stored procedure
- All-or-nothing deletion (prevents partial data deletion)
- Order anonymization (preserves for legal/business requirements)
- Profile picture deletion from storage
- Comprehensive audit logging

**Location:** `server/api/auth/delete-account.delete.ts`

### Article 5: Data Protection Principles

**Article 5.1a - Lawfulness, Fairness, and Transparency:**
- Clear privacy policy
- Explicit user consent
- Transparent data processing

**Article 5.1b - Purpose Limitation:**
- Data collected only for specified purposes
- Audit logs track all data access

**Article 5.1c - Data Minimization:**
- Only necessary PII collected
- Secure logger prevents accidental PII exposure

**Article 5.1e - Storage Limitation:**
- Planned data retention policies
- Automatic cleanup of old data

### Article 32: Security of Processing

**Implementation:**
- Auth rate limiting (prevents brute force attacks)
- Secure PII logging (prevents accidental exposure)
- Encrypted data transmission (HTTPS)
- Supabase Row Level Security (RLS)

---

## Right to Erasure (Article 17)

### Atomic Account Deletion

Moldova Direct implements **atomic account deletion** to ensure complete and reliable user data removal. The deletion process is all-or-nothing: either all user data is deleted successfully, or the entire operation is rolled back.

#### How It Works

When a user requests account deletion:

1. **Password Verification**
   - User must re-enter password to confirm
   - Prevents unauthorized deletion

2. **Audit Logging**
   ```typescript
   // Log deletion request BEFORE any deletion
   await supabase.from('auth_events').insert({
     user_id: user.id,
     event_type: 'account_deletion_requested',
     ip_address: getClientIP(event),
     user_agent: getHeader(event, 'user-agent'),
     metadata: { reason: 'user_request', timestamp: new Date() }
   })
   ```

3. **Atomic Deletion via Stored Procedure**
   ```typescript
   // All operations in single database transaction
   const { data, error } = await supabase.rpc('delete_user_account_atomic', {
     target_user_id: user.id,
     deletion_reason: reason || 'not_specified'
   })
   ```

4. **Storage Cleanup** (Non-critical)
   - Profile pictures deleted from Supabase Storage
   - Failure does not block account deletion

5. **Auth User Deletion** (Final Step)
   - Supabase Auth user deleted
   - User immediately logged out

#### What Gets Deleted

| Data Type | Action | Reason |
|-----------|--------|--------|
| User Profile | ✅ Deleted | Contains PII |
| Addresses | ✅ Deleted | Contains PII (shipping/billing) |
| Shopping Carts | ✅ Deleted | Contains user preferences |
| Email Preferences | ✅ Deleted | User data |
| Activity Logs | ✅ Deleted | User behavioral data |
| Newsletter Subscriptions | ✅ Deleted | Marketing data |
| Profile Pictures | ✅ Deleted | User images |
| **Orders** | ⚠️ **Anonymized** | Required for legal/tax compliance |
| **Audit Logs** | ⚠️ **Retained** | Required for compliance audits |

#### Order Anonymization

Orders are **anonymized** (not deleted) because:
- **Legal requirement:** Tax authorities require 7-year retention
- **Business requirement:** Accounting, returns, warranty claims
- **GDPR compliance:** Article 17.3(b) - legal obligations
- **Article 17.3(e):** Public interest, scientific research

**Anonymization process:**
```sql
UPDATE orders
SET
  user_id = NULL,                    -- Remove user link
  customer_email = '[DELETED]',      -- Redact email
  customer_name = 'Anonymous User',  -- Anonymize name
  metadata = jsonb_set(
    metadata,
    '{gdpr_deletion}',
    to_jsonb(now())
  )
WHERE user_id = target_user_id;
```

**What remains in anonymized orders:**
- Order number, date, amount (for accounting)
- Product information (for inventory/analytics)
- Payment status (for reconciliation)
- **All PII removed** (name, email, address)

### Developer Guidelines: Account Deletion

#### API Usage

**Endpoint:** `DELETE /api/auth/delete-account`

**Request:**
```typescript
// Client-side request
const response = await $fetch('/api/auth/delete-account', {
  method: 'DELETE',
  body: {
    password: 'user-password',    // Required
    reason: 'not_satisfied'        // Optional
  }
})
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account deleted successfully",
  "details": {
    "addresses_deleted": 2,
    "carts_deleted": 1,
    "orders_anonymized": 5,
    "profile_deleted": true
  }
}
```

**Response (Error):**
```json
{
  "statusCode": 400,
  "statusMessage": "Invalid password"
}
```

#### Error Handling

The deletion endpoint handles errors gracefully:

```typescript
try {
  // Atomic deletion
  const result = await supabase.rpc('delete_user_account_atomic', {
    target_user_id: user.id,
    deletion_reason: reason
  })
} catch (error) {
  // Database transaction automatically rolled back
  // No partial deletions possible
  logger.error('Account deletion failed', { error })
  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to delete account'
  })
}
```

**Key safeguards:**
- Database transaction ensures atomicity
- Rollback on any error
- Secure logging prevents PII exposure
- Audit trail maintained

---

## PII Protection (Article 5)

### Secure Logger with Auto-Redaction

**Requirement:** Article 5.1f - Data must be processed securely, preventing unauthorized access or accidental loss.

Moldova Direct implements **automatic PII redaction** in all server logs to prevent accidental exposure of sensitive data.

#### What Gets Redacted

| Data Type | Pattern | Replacement |
|-----------|---------|-------------|
| Email addresses | `user@example.com` | `[EMAIL_REDACTED]` |
| Phone numbers | `+1-555-123-4567` | `[PHONE_REDACTED]` |
| Credit card numbers | `4111-1111-1111-1111` | `[CARD_REDACTED]` |
| IP addresses | `192.168.1.1` | `[IP_REDACTED]` |
| SSN/Tax IDs | `123-45-6789` | `[SSN_REDACTED]` |
| Passwords | `"password":"secret"` | `"password":"[REDACTED]"` |
| Bearer tokens | `Bearer abc123xyz` | `Bearer [TOKEN_REDACTED]` |
| API keys | `api_key: sk_live_...` | `api_key: [KEY_REDACTED]` |

#### Sensitive Field Names

The logger automatically redacts values of fields with these names:
```typescript
const SENSITIVE_FIELDS = [
  'password', 'email', 'phone', 'phoneNumber',
  'address', 'street', 'city', 'postalCode',
  'firstName', 'lastName', 'fullName',
  'creditCard', 'cardNumber', 'cvv', 'ssn',
  'token', 'accessToken', 'refreshToken',
  'apiKey', 'secret', 'ip', 'ipAddress',
  // ... and 20+ more
]
```

### Developer Usage

**Location:** `server/utils/secureLogger.ts`

#### Basic Usage

```typescript
import { logger } from '~/server/utils/secureLogger'

// Simple logging (safe for production)
logger.info('User logged in', { userId: 123 })

// PII automatically redacted
logger.debug('User details', {
  email: 'user@example.com',  // Becomes [EMAIL_REDACTED]
  phone: '+1-555-1234',       // Becomes [PHONE_REDACTED]
  userId: 123                 // Safe, not PII
})

// Error logging with auto-redaction
logger.error('Payment failed', {
  error: err.message,
  cardNumber: '4111111111111111'  // Becomes [CARD_REDACTED]
})
```

#### Context Logger

Create a logger with fixed context for better traceability:

```typescript
import { createLogger } from '~/server/utils/secureLogger'

const logger = createLogger('checkout')  // Context: "checkout"

logger.info('Order created', { orderId: 123 })
// Output: [2025-11-16T10:00:00Z] [INFO] [checkout] Order created { orderId: 123 }

logger.warn('Payment retry', {
  email: 'user@example.com',  // Auto-redacted
  amount: 99.99                // Safe
})
```

#### Object Redaction

The logger recursively redacts nested objects:

```typescript
logger.info('Checkout data', {
  order: {
    id: 123,
    customer: {
      email: 'user@example.com',        // Redacted
      phone: '+1-555-1234',              // Redacted
      address: {
        street: '123 Main St',           // Redacted (sensitive field)
        city: 'New York',                // Redacted (sensitive field)
        zip: '10001'                     // Redacted (postalCode)
      }
    },
    items: [
      { productId: 456, quantity: 2 }    // Safe
    ]
  }
})
```

**Output:**
```json
{
  "order": {
    "id": 123,
    "customer": {
      "email": "[EMAIL_REDACTED]",
      "phone": "[PHONE_REDACTED]",
      "address": "[PII_OBJECT_REDACTED]"
    },
    "items": [
      { "productId": 456, "quantity": 2 }
    ]
  }
}
```

### Production vs Development

**Development Mode** (`NODE_ENV !== 'production'`):
- Color-coded console output
- Readable formatting
- PII still redacted (prevents accidental exposure)

```bash
[2025-11-16T10:00:00Z] [INFO] [checkout] Order created { orderId: 123 }
```

**Production Mode**:
- Structured JSON logs (for log aggregation)
- Compatible with CloudWatch, Datadog, Splunk
- PII automatically redacted

```json
{
  "timestamp": "2025-11-16T10:00:00Z",
  "level": "info",
  "context": "checkout",
  "message": "Order created",
  "data": { "orderId": 123 }
}
```

### Migration from console.log

**Before (UNSAFE):**
```typescript
console.log('User details:', {
  email: user.email,  // PII EXPOSED!
  name: user.name,    // PII EXPOSED!
  ip: clientIP        // PII EXPOSED!
})
```

**After (SAFE):**
```typescript
import { logger } from '~/server/utils/secureLogger'

logger.info('User details', {
  email: user.email,  // Auto-redacted
  name: user.name,    // Auto-redacted
  ip: clientIP        // Auto-redacted
})
```

### Testing PII Redaction

```typescript
import { redactPII } from '~/server/utils/secureLogger'

// Test redaction function
const sensitiveData = {
  email: 'user@example.com',
  phone: '+1-555-1234',
  userId: 123
}

const safe = redactPII(sensitiveData)
// { email: '[EMAIL_REDACTED]', phone: '[PHONE_REDACTED]', userId: 123 }
```

---

## Data Retention Policies (Article 5.1e)

**Status:** ⚠️ **Planned** (Database migrations pending)

**Article 5.1e Requirement:** Personal data shall be kept in a form which permits identification of data subjects for no longer than is necessary.

### Planned Retention Periods

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| User Activity Logs | 90 days | Analytics, security monitoring |
| Auth Events | 1 year | Security audits |
| Email Logs | 2 years | Deliverability tracking |
| Audit Logs | 7 years | Legal compliance (tax, accounting) |
| Session Data | 7 days inactive | Security |
| Shopping Carts | 30 days inactive | User convenience vs privacy |

### Automated Cleanup

**Planned Implementation:**
- PostgreSQL `pg_cron` extension for scheduled cleanup
- Daily job to remove expired data
- Admin override for legal holds
- Audit trail of deletions

**Example cleanup job:**
```sql
-- Planned implementation (not yet active)
SELECT cron.schedule(
  'cleanup_expired_data',
  '0 2 * * *',  -- Run at 2 AM daily
  $$
    DELETE FROM user_activity
    WHERE created_at < NOW() - INTERVAL '90 days';

    DELETE FROM auth_events
    WHERE created_at < NOW() - INTERVAL '1 year';
  $$
);
```

### Developer Notes

⚠️ **Important:** Data retention migrations are planned but not yet deployed. Current implementation:
- Manual data cleanup required
- No automated retention enforcement
- Track GitHub issue for status updates

---

## Developer Guidelines

### When to Use Secure Logger

**Always use secure logger for:**
- User data logging (emails, names, addresses)
- Payment processing logs
- Authentication events
- API requests with user data
- Error messages containing user input
- Debug logs in production code

**Safe to use console.log for:**
- System startup messages
- Configuration validation (non-sensitive)
- Public API responses (no user data)
- Development debugging (delete before commit)

### Code Review Checklist

Before merging code, verify:
- [ ] No `console.log` with user data
- [ ] All PII logging uses `secureLogger`
- [ ] Error messages don't expose sensitive info
- [ ] User input sanitized before logging
- [ ] No hardcoded secrets/tokens in code
- [ ] Account deletion tested (rollback works)

### Adding New PII Fields

If you add new fields containing PII:

1. **Add to SENSITIVE_FIELDS list** (`server/utils/secureLogger.ts`):
```typescript
const SENSITIVE_FIELDS = new Set([
  // ... existing fields
  'yourNewPIIField',
  'your_new_pii_field',  // Both camelCase and snake_case
])
```

2. **Test redaction:**
```typescript
import { redactPII } from '~/server/utils/secureLogger'

const data = { yourNewPIIField: 'sensitive value' }
const safe = redactPII(data)
// Should be: { yourNewPIIField: '[PII_REDACTED]' }
```

3. **Update documentation** (this file)

### Security Best Practices

1. **Never log sensitive data**
   ```typescript
   // ❌ WRONG
   console.log('Password reset:', { password: newPassword })

   // ✅ CORRECT
   logger.info('Password reset successful', { userId: user.id })
   ```

2. **Use structured logging**
   ```typescript
   // ❌ WRONG
   console.log(`User ${user.email} logged in`)  // Email exposed

   // ✅ CORRECT
   logger.info('User logged in', { userId: user.id })
   ```

3. **Handle errors safely**
   ```typescript
   // ❌ WRONG
   console.error('Payment failed:', error)  // May contain PII

   // ✅ CORRECT
   logger.error('Payment failed', {
     error: error.message,  // Auto-redacted
     orderId: order.id
   })
   ```

---

## Testing GDPR Compliance

### Account Deletion Testing

**Manual Test:**
1. Create test user account
2. Add addresses, cart items, orders
3. Request account deletion via profile settings
4. Verify all data deleted/anonymized
5. Attempt login (should fail)
6. Check database (no user record)

**Automated Test:**
```typescript
// Example E2E test
describe('Account Deletion (GDPR)', () => {
  it('should delete all user data atomically', async () => {
    // 1. Create test user with data
    const user = await createTestUser()
    await addTestAddress(user.id)
    await createTestCart(user.id)

    // 2. Request deletion
    const response = await $fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` },
      body: { password: 'test-password', reason: 'test' }
    })

    // 3. Verify success
    expect(response.success).toBe(true)
    expect(response.details.addresses_deleted).toBeGreaterThan(0)

    // 4. Verify data deleted
    const userData = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single()

    expect(userData.data).toBeNull()
  })
})
```

### PII Redaction Testing

```typescript
import { redactPII } from '~/server/utils/secureLogger'

describe('PII Redaction', () => {
  it('should redact emails', () => {
    const data = { email: 'user@example.com' }
    const redacted = redactPII(data)
    expect(redacted.email).toBe('[EMAIL_REDACTED]')
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
})
```

### Rate Limiting Testing

```typescript
describe('Auth Rate Limiting (GDPR Security)', () => {
  it('should block after 5 failed login attempts', async () => {
    // Attempt 5 failed logins
    for (let i = 0; i < 5; i++) {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'wrong' }
      }).catch(() => {})
    }

    // 6th attempt should be rate-limited
    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'wrong' }
      })
      fail('Should have thrown rate limit error')
    } catch (error) {
      expect(error.statusCode).toBe(429)
    }
  })
})
```

---

## Audit & Compliance

### Audit Logging

All critical operations are logged to `auth_events` table:

```typescript
// Automatic audit logging
await supabase.from('auth_events').insert({
  user_id: user.id,
  event_type: 'account_deletion_requested',
  ip_address: getClientIP(event),
  user_agent: getHeader(event, 'user-agent'),
  metadata: JSON.stringify({
    reason: 'user_request',
    timestamp: new Date().toISOString()
  })
})
```

**Logged events:**
- Account creation
- Account deletion requests
- Login attempts (successful/failed)
- Password changes
- Email updates
- MFA setup/changes
- Admin actions

### Compliance Reports

**To generate GDPR compliance report:**

```sql
-- User data summary
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_users
FROM auth.users;

-- Account deletion stats
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as deletion_requests
FROM auth_events
WHERE event_type = 'account_deletion_requested'
GROUP BY month
ORDER BY month DESC;

-- PII exposure incidents (should be 0)
SELECT COUNT(*)
FROM audit_logs
WHERE log_message LIKE '%@%'  -- Detect potential email exposure
  AND created_at > NOW() - INTERVAL '30 days';
```

### Regular Compliance Tasks

**Monthly:**
- [ ] Review audit logs for unusual activity
- [ ] Verify PII redaction is working
- [ ] Check rate limiting effectiveness
- [ ] Review account deletion requests

**Quarterly:**
- [ ] Update PII field list if new fields added
- [ ] Review data retention policies
- [ ] Audit third-party data processors
- [ ] Update privacy policy if needed

**Annually:**
- [ ] Full GDPR compliance audit
- [ ] Review and update consent forms
- [ ] Train developers on GDPR requirements
- [ ] Update this documentation

---

## Related Documentation

- [Secure Logger Reference](./SECURE_LOGGER.md)
- [Rate Limiting Guide](./RATE_LIMITING.md)
- [Authentication Guide](/docs/features/authentication/README.md)
- [Privacy Policy](https://moldovadirect.com/privacy)

---

## Resources

**GDPR Reference:**
- [GDPR Official Text](https://gdpr-info.eu/)
- [Article 17 - Right to Erasure](https://gdpr-info.eu/art-17-gdpr/)
- [Article 5 - Data Protection Principles](https://gdpr-info.eu/art-5-gdpr/)
- [Article 32 - Security of Processing](https://gdpr-info.eu/art-32-gdpr/)

**Implementation:**
- PR #255: Security & GDPR Compliance
- Issue #233: CSRF Protection Extension
- Issue #232: Rate Limiting Implementation

---

**Questions or Issues?**
Contact: dev@moldovadirect.com
GitHub Issues: https://github.com/caraseli02/MoldovaDirect/issues

---

*This documentation is maintained as part of Moldova Direct's commitment to user privacy and GDPR compliance.*
