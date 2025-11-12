---
status: pending
priority: p0
issue_id: "027"
tags: [security, critical, privacy, gdpr, logging, compliance]
dependencies: []
github_issue: 226
---

# 🚨 CRITICAL: Excessive PII Logging Violates GDPR & Security Best Practices

## Problem Statement

**275+ console.log/warn/error statements** across 100+ files are logging sensitive personal data (PII) in production, including emails, addresses, phone numbers, and payment-related information. This data persists in production logs accessible via Vercel/log aggregation services, violating GDPR Article 5(1)(f) and creating significant security and compliance risks.

**Locations:** Multiple files across server/, stores/, composables/, components/

## Findings

**Discovered by:** Security Sentinel + Data Integrity Guardian (multi-agent code review)
**GitHub Issue:** #226
**Review date:** 2025-11-12

**Scale of Problem:**
```bash
# Console statement count (found via grep)
Total console statements: 275+
Files affected: 100+
High-risk (server-side): 50+ files
Medium-risk (stores/composables): 40+ files
Low-risk (components - client only): 30+ files
```

**Examples of PII Logging:**

### Example 1: Checkout API - Full Customer Data
```typescript
// server/api/checkout/create-order.post.ts:72-79
console.log('[Checkout API] create-order request received', {
  sessionId: body.sessionId,
  guestEmail: body.guestEmail,              // ❌ EMAIL ADDRESS
  hasAuthHeader: !!getHeader(event, 'authorization'),
  shippingAddress: body.shippingAddress,    // ❌ NAME, PHONE, ADDRESS
  billingAddress: body.billingAddress       // ❌ NAME, ADDRESS
})
```

**Logged PII:**
- Customer email
- Full name (first + last)
- Phone number
- Street address, city, postal code
- Potentially payment session IDs

---

### Example 2: Cart Validation - User Session Data
```typescript
// stores/cart/validation.ts:174-208
catch (error: any) {
  console.warn(`Failed to validate product ${productId}:`, error)
  // Error may contain:
  // - User session ID
  // - Product details
  // - Cart contents
}
```

---

### Example 3: Auth Store - User Identifiers
```typescript
// stores/auth.ts:1002-1014
async updateLastLogin() {
  try {
    // ...
  } catch (error) {
    console.warn('Failed to update last login:', error)
    // May log user ID, email, session tokens
  }
}
```

---

### Example 4: Payment Intent - Stripe Data
```typescript
// server/api/checkout/create-payment-intent.post.ts
console.log('Creating payment intent', {
  amount: amount,
  sessionId: sessionId  // May contain user identifiers
})
```

---

## Impact

### GDPR Compliance Impact (CRITICAL)

**Article 5(1)(f) - Security and Confidentiality:**
> Personal data shall be processed in a manner that ensures appropriate security of the personal data, including protection against unauthorised or unlawful processing and against accidental loss, destruction or damage, using appropriate technical or organisational measures.

**Violations:**
1. ❌ PII stored in plain text (no encryption)
2. ❌ No access controls on logged data
3. ❌ Retention period undefined
4. ❌ Third-party services receive PII (Vercel logs, potential log aggregators)
5. ❌ No data processing agreements for log storage
6. ❌ Logs stored outside EU potentially

**Regulatory Consequences:**
- **Fines:** Up to €10 million OR 2% of annual global revenue (whichever higher)
- **Breach notification:** Mandatory if logs compromised (within 72 hours)
- **Supervisory authority:** Investigation and enforcement actions
- **Individual rights:** Users can sue for damages

**Example Scenario:**
```
Company revenue: €500,000/year
2% of revenue: €10,000
Typical first violation: €5,000 - €25,000 fine
+ Legal costs: €10,000 - €50,000
+ Reputational damage: Immeasurable
```

---

### Security Impact

**Data Exposure Vectors:**

**1. Log Aggregation Services**
```
Current Flow:
  Production App → Vercel Logs → ???

Risks:
  - PII sent to third-party infrastructure
  - Stored in unknown locations (possibly non-EU)
  - Accessible by service provider employees
  - No encryption in transit/at rest
  - Retention beyond GDPR limits
```

**2. Developer Access**
```
Who has access to production logs:
  - All developers with Vercel access
  - DevOps team members
  - Support staff
  - Former employees (until access revoked)

Current state:
  - No audit trail of who viewed logs
  - No PII access justification required
  - Logs searchable/downloadable
```

**3. Security Incidents**
```
If Vercel account compromised:
  - Attacker gains access to all production logs
  - Can search for emails, addresses, phone numbers
  - Can correlate user data across logs
  - Permanent record (logs not deleted)
```

**4. Browser Console (Client-side)**
```
User PII visible in:
  - Browser DevTools console
  - Can be captured by malicious extensions
  - Accessible to anyone with physical device access
```

---

### Business Impact

**Operational:**
- Support team sees customer PII unnecessarily
- Difficult to grant log access selectively
- Manual log review exposes PII to more people

**Compliance:**
- Cannot pass GDPR audits
- Privacy impact assessments fail
- Data processing agreements incomplete

**Legal:**
- Lawsuits from privacy-conscious customers
- Class action risk if breach occurs
- Individual compensation claims

**Reputational:**
- Loss of customer trust if discovered
- Negative press coverage
- Competitive disadvantage (privacy-focused competitors)

---

## Affected Files

### High Priority (Server-side - 50+ files)

**Checkout & Orders:**
- `/server/api/checkout/create-order.post.ts` ⚠️
- `/server/api/checkout/create-payment-intent.post.ts` ⚠️
- `/server/api/orders/**/*.ts`

**Cart:**
- `/server/api/cart/validate.post.ts` ⚠️
- `/server/api/cart/add.post.ts`
- `/server/api/cart/lock.post.ts`

**Admin:**
- `/server/api/admin/users/**/*.ts` ⚠️
- `/server/api/admin/orders/**/*.ts`

**Auth:**
- `/server/api/auth/**/*.ts`

### Medium Priority (Stores - 40+ files)

**State Management:**
- `/stores/auth.ts` (1,172 lines - many console statements)
- `/stores/cart/index.ts`
- `/stores/cart/validation.ts` ⚠️
- `/stores/checkout.ts`

### Lower Priority (Client-side - 30+ files)

**Composables:**
- `/composables/useCart.ts`
- `/composables/useAuth.ts`
- `/composables/useCheckout.ts`

**Components:**
- Various Vue components

---

## Proposed Solutions

### RECOMMENDED: Phased Implementation (4-5 days)

---

### Phase 1: Create Logging Utility (Day 1 - 2 hours)

```typescript
// utils/logger.ts

/**
 * Centralized logging utility with PII redaction for GDPR compliance
 */

interface LogData {
  [key: string]: any
}

// PII field patterns to redact
const PII_FIELDS = [
  // Email patterns
  'email', 'guestEmail', 'userEmail', 'customerEmail',
  // Name patterns
  'firstName', 'lastName', 'name', 'fullName',
  // Phone patterns
  'phone', 'phoneNumber', 'mobile', 'telephone',
  // Address patterns
  'address', 'shippingAddress', 'billingAddress',
  'street', 'streetAddress', 'city', 'postalCode', 'zipCode',
  // Payment patterns
  'cardNumber', 'cvv', 'cvc', 'cardholderName',
  // Sensitive identifiers
  'password', 'token', 'apiKey', 'secret', 'sessionId'
]

/**
 * Recursively redact PII from objects
 */
function redactPII(data: any, depth: number = 0): any {
  // Prevent infinite recursion
  if (depth > 5) return '[MAX_DEPTH]'

  // Handle null/undefined
  if (!data) return data

  // Handle primitives
  if (typeof data !== 'object') return data

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => redactPII(item, depth + 1))
  }

  // Handle objects
  const redacted: Record<string, any> = {}

  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue

    // Check if key matches PII pattern
    const isPII = PII_FIELDS.some(field =>
      key.toLowerCase().includes(field.toLowerCase())
    )

    if (isPII) {
      // Redact PII fields
      redacted[key] = '[REDACTED]'
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      // Recursively redact nested objects
      redacted[key] = redactPII(data[key], depth + 1)
    } else {
      // Keep non-PII values
      redacted[key] = data[key]
    }
  }

  return redacted
}

/**
 * Check if running in production
 */
const isProduction = () => process.env.NODE_ENV === 'production'

/**
 * Logging utility with automatic PII redaction
 */
export const logger = {
  /**
   * Info level logging
   * Production: Redacts PII
   * Development: Full data
   */
  info: (message: string, data?: LogData) => {
    if (isProduction()) {
      console.log(message, data ? redactPII(data) : '')
    } else {
      console.log(message, data)
    }
  },

  /**
   * Warning level logging
   * Production: Redacts PII
   * Development: Full data
   */
  warn: (message: string, data?: LogData) => {
    if (isProduction()) {
      console.warn(message, data ? redactPII(data) : '')
    } else {
      console.warn(message, data)
    }
  },

  /**
   * Error level logging
   * Always redacts PII (errors may contain sensitive data)
   */
  error: (message: string, error?: any) => {
    console.error(message, error ? redactPII(error) : '')
  },

  /**
   * Debug level logging
   * Only logs in development (completely disabled in production)
   */
  debug: (message: string, data?: LogData) => {
    if (!isProduction()) {
      console.debug(message, data)
    }
  }
}

// Export for testing
export { redactPII }
```

**Unit Tests:**
```typescript
// utils/logger.test.ts
import { describe, it, expect } from 'vitest'
import { redactPII } from './logger'

describe('logger - PII redaction', () => {
  it('redacts email addresses', () => {
    const input = { email: 'user@example.com', orderId: '123' }
    const output = redactPII(input)
    expect(output.email).toBe('[REDACTED]')
    expect(output.orderId).toBe('123')
  })

  it('redacts nested addresses', () => {
    const input = {
      user: {
        shippingAddress: {
          street: '123 Main St',
          city: 'Madrid'
        }
      }
    }
    const output = redactPII(input)
    expect(output.user.shippingAddress).toBe('[REDACTED]')
  })

  it('handles arrays', () => {
    const input = { emails: ['a@test.com', 'b@test.com'] }
    const output = redactPII(input)
    expect(output.emails).toBe('[REDACTED]')
  })

  it('preserves non-PII data', () => {
    const input = { orderId: '123', status: 'pending', total: 49.99 }
    const output = redactPII(input)
    expect(output).toEqual(input)
  })
})
```

---

### Phase 2: Systematic Replacement (Days 2-4 - 3 days)

**Replacement Strategy:**

**Day 2: Server API Routes (50 files, ~6 hours)**
```bash
# Priority 1: Checkout & Payment endpoints
server/api/checkout/*.ts
server/api/orders/*.ts
server/api/cart/*.ts

# For each file:
# 1. Add import: import { logger } from '~/utils/logger'
# 2. Replace: console.log → logger.info
# 3. Replace: console.warn → logger.warn
# 4. Replace: console.error → logger.error
# 5. Remove: console.debug (use logger.debug)
```

**Day 3: Stores & Composables (40 files, ~6 hours)**
```bash
# State management
stores/auth.ts
stores/cart/*.ts
stores/checkout.ts

# Business logic
composables/useCart.ts
composables/useAuth.ts
composables/useCheckout.ts
```

**Day 4: Components & Cleanup (30 files, ~6 hours)**
```bash
# Vue components
components/**/*.vue

# Final verification
grep -r "console\." --include="*.ts" --include="*.vue" server/ stores/ composables/
```

---

### Phase 3: Prevention & Enforcement (Day 5 - 4 hours)

**1. Add ESLint Rule (1 hour)**
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Prevent console usage - force logger utility
    'no-console': ['error', { allow: [] }]
  }
}
```

**2. Add Pre-commit Hook (1 hour)**
```bash
# .husky/pre-commit

#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for console statements
CONSOLE_FILES=$(git diff --cached --name-only | grep -E '\\.(ts|js|vue)$' | xargs grep -l "console\\." 2>/dev/null || true)

if [ ! -z "$CONSOLE_FILES" ]; then
  echo "❌ ERROR: console statements found in:"
  echo "$CONSOLE_FILES"
  echo ""
  echo "Use logger utility instead:"
  echo "  import { logger } from '~/utils/logger'"
  echo "  logger.info('message', data)"
  exit 1
fi
```

**3. Update Documentation (1 hour)**
```markdown
# docs/logging-guidelines.md

## Logging Best Practices

### DO NOT use console directly
❌ console.log()
❌ console.warn()
❌ console.error()

### DO use logger utility
✅ import { logger } from '~/utils/logger'
✅ logger.info('Order created', { orderId })
✅ logger.error('Payment failed', error)

### PII Protection
Logger automatically redacts:
- Email addresses
- Phone numbers
- Addresses
- Names
- Payment info

Production logs are GDPR compliant.
```

**4. Team Training (1 hour)**
- Document logger usage in README
- Add to onboarding checklist
- Code review checklist item

---

## Technical Details

- **Affected Files:** 100+ files with 275+ console statements
- **New Utility:** `utils/logger.ts` (~150 lines)
- **Tests:** `utils/logger.test.ts` (~100 lines)
- **Documentation:** `docs/logging-guidelines.md`

- **Related Components:**
  - All API routes
  - All stores
  - All composables
  - Many components

- **No Database Changes Required**

## Resources

- GitHub Issue: #226
- GDPR Article 5(1)(f): https://gdpr-info.eu/art-5-gdpr/
- GDPR Fines Database: https://www.enforcementtracker.com/
- Logging Best Practices: OWASP Logging Cheat Sheet

## Acceptance Criteria

- [ ] Logger utility created with PII redaction
- [ ] Unit tests pass (100% coverage for redaction logic)
- [ ] All 275+ console statements replaced
- [ ] Manual log sampling shows NO PII in production
- [ ] ESLint rule prevents new console usage
- [ ] Pre-commit hook enforces logger
- [ ] Documentation updated
- [ ] Team trained on logging practices
- [ ] No regression in application functionality

## Testing Checklist

**Unit Tests:**
- [ ] Logger redacts email fields
- [ ] Logger redacts phone fields
- [ ] Logger redacts address objects
- [ ] Logger redacts nested PII
- [ ] Logger handles arrays
- [ ] Logger preserves non-PII
- [ ] Production mode enables redaction
- [ ] Development mode shows full data

**Integration Tests:**
- [ ] API routes use logger
- [ ] No console statements in codebase
- [ ] Logs don't contain PII sample

**Manual Verification:**
- [ ] Review Vercel production logs (last 7 days)
- [ ] Search for email patterns
- [ ] Search for phone patterns
- [ ] Search for address patterns
- [ ] Confirm all redacted

## Work Log

### 2025-11-12 - Issue Discovered & Todo Created
**By:** Security Sentinel + Data Integrity Guardian
**Actions:**
- Comprehensive security audit performed
- Found 275+ console statements logging PII
- Identified GDPR Article 5(1)(f) violation
- Created GitHub issue #226
- Created local todo #027
- Categorized as P0 critical (GDPR + security risk)

**Findings:**
- PII logged in 100+ files
- Production logs contain customer data
- No redaction mechanism in place
- Vercel logs accessible to all developers
- No retention policy for logs

**Risk Assessment:**
- GDPR fines: €5K - €25K (likely range)
- Security risk: HIGH (log compromise = PII exposure)
- Compliance risk: Cannot pass audit

**Next Steps:**
1. Create logger utility with redaction
2. Systematically replace console statements
3. Add enforcement (ESLint + hooks)
4. Audit existing production logs
5. Document logging policy

**Learnings:**
- Logging is a common GDPR violation
- Easy to accidentally log PII
- Automated enforcement critical
- Must redact before logging, not after

## Notes

**Priority Rationale:**
- P0 because active GDPR violation with severe penalties
- Large scale (275+ instances)
- Production data actively being exposed
- Immediate legal and security risk
- Moderate effort to fix (4-5 days)

**GDPR Context:**
- Article 5(1)(f) requires "appropriate security"
- Plain text PII in logs = violation
- Data processors must protect PII
- Fines based on severity and negligence

**Implementation Strategy:**
- Phased approach to minimize disruption
- Server-side first (highest risk)
- Test thoroughly in staging
- Enable enforcement only after migration complete

**Post-Implementation:**
- Audit existing production logs
- Delete logs containing PII
- Implement log retention policy (30-90 days max)
- Restrict log access to need-to-know basis

Source: Multi-agent code review 2025-11-12 (Security Sentinel)
Related: GDPR compliance, logging best practices, data protection
