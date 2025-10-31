#!/usr/bin/env node

/**
 * Script to create GitHub issues from code review
 *
 * Usage:
 *   GITHUB_TOKEN=your_token node .github/scripts/create-issues-from-review.js
 *
 * Requirements:
 *   - GitHub Personal Access Token with 'repo' scope
 *   - Node.js v18+
 */

const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'caraseli02';
const REPO_NAME = 'MoldovaDirect';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  console.error('   Get a token from: https://github.com/settings/tokens');
  process.exit(1);
}

// Issue definitions extracted from ISSUES_FROM_REVIEW.md
const issues = [
  {
    title: '[CRITICAL SECURITY] Re-enable Authentication Middleware',
    labels: ['security', 'critical', 'bug', 'admin'],
    milestone: 'Security Hardening Sprint',
    priority: 'P0',
    body: `**Priority:** P0 - Critical

**Description:**
The authentication middleware for admin routes is currently completely bypassed for testing purposes, leaving the entire admin dashboard accessible without authentication.

**Location:**
- File: \`middleware/admin.ts:16-20\`

**Current Code:**
\`\`\`typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  // TESTING MODE: Temporarily disabled for E2E testing
  // TODO: Re-enable after testing is complete
  console.log('Admin middleware: BYPASSED FOR TESTING')
  return
\`\`\`

**Security Impact:**
- **Severity:** CRITICAL
- Anyone can access admin dashboard without credentials
- Potential data breach, unauthorized modifications
- Financial loss risk
- Compliance violations (GDPR, PCI-DSS)

**Acceptance Criteria:**
- [ ] Remove test bypass code
- [ ] Re-enable full authentication check
- [ ] Verify admin role checking works
- [ ] Enforce MFA (AAL2) for admin users
- [ ] Add session timeout (30 minutes)
- [ ] Test with E2E tests
- [ ] Add monitoring/alerts for unauthorized access attempts

**References:**
- Code Review: \`/CODE_REVIEW_2025.md\` - Section 2.1
- Related: #2 (MFA Enforcement), #5 (API Authorization)

**Estimated Effort:** 1 day`
  },
  {
    title: '[CRITICAL SECURITY] Enforce MFA for Admin Users',
    labels: ['security', 'critical', 'enhancement', 'admin', 'mfa'],
    milestone: 'Security Hardening Sprint',
    priority: 'P0',
    body: `**Priority:** P0 - Critical

**Description:**
Multi-Factor Authentication (MFA) enforcement for admin users is currently commented out in the admin middleware, leaving admin accounts vulnerable to credential theft.

**Location:**
- File: \`middleware/admin.ts:46-87\`

**Security Impact:**
- Admin accounts vulnerable without 2FA
- Single point of failure (password only)
- Increased risk of unauthorized access

**Acceptance Criteria:**
- [ ] Uncomment MFA enforcement code
- [ ] Verify AAL2 check works correctly
- [ ] Redirect to MFA setup if not configured
- [ ] Test MFA verification flow
- [ ] Add grace period for existing admins (7 days)
- [ ] Send email notification to admins requiring MFA setup
- [ ] Update admin documentation

**References:**
- Code Review: \`/CODE_REVIEW_2025.md\` - Section 2.1
- Related: #1 (Auth Middleware), #10 (Auth Store Split)

**Estimated Effort:** 2 days`
  },
  {
    title: '[CRITICAL SECURITY] Implement Rate Limiting on Auth Endpoints',
    labels: ['security', 'critical', 'enhancement', 'authentication'],
    milestone: 'Security Hardening Sprint',
    priority: 'P0',
    body: `**Priority:** P0 - Critical

**Description:**
Authentication endpoints lack rate limiting, making them vulnerable to brute force attacks and credential stuffing.

**Security Risk:**
- Brute force password attacks
- Credential stuffing attacks
- Account takeover risk
- DDoS potential

**Proposed Solution:**
Implement rate limiting middleware using Upstash Redis:
- **Auth endpoints:** 5 attempts per 15 minutes per IP
- **API endpoints:** 100 requests per minute per IP
- **Checkout endpoints:** 10 attempts per hour per session

**Acceptance Criteria:**
- [ ] Create rate limiting middleware
- [ ] Implement Redis/Upstash KV storage
- [ ] Add IP-based throttling
- [ ] Return proper 429 responses with Retry-After header
- [ ] Log rate limit violations
- [ ] Add monitoring/alerting
- [ ] Update API documentation

**References:**
- Code Review: \`/CODE_REVIEW_2025.md\` - Section 1.2

**Estimated Effort:** 2 days`
  },
  {
    title: '[CRITICAL SECURITY] Add Server-Side Price Verification',
    labels: ['security', 'critical', 'bug', 'checkout', 'payments'],
    milestone: 'Security Hardening Sprint',
    priority: 'P0',
    body: `**Priority:** P0 - Critical

**Description:**
Cart prices are calculated client-side without server-side verification, allowing potential price manipulation.

**Location:**
- File: \`stores/cart/core.ts\`

**Security Risk:**
- Price manipulation via DevTools
- Financial loss
- Revenue leakage

**Proposed Solution:**
Create \`/api/checkout/verify-cart\` endpoint to:
1. Fetch current prices from database
2. Recalculate total server-side
3. Compare with client-submitted total
4. Reject if mismatch > €0.01

**Acceptance Criteria:**
- [ ] Create server-side verification endpoint
- [ ] Verify all prices from database
- [ ] Check for price changes since cart was loaded
- [ ] Validate product availability
- [ ] Calculate tax server-side
- [ ] Add error handling for price mismatches
- [ ] Test with various scenarios

**References:**
- Code Review: \`/CODE_REVIEW_2025.md\` - Section 1.2

**Estimated Effort:** 2 days`
  },
  {
    title: '[CRITICAL SECURITY] Add API-Level Authorization Checks',
    labels: ['security', 'critical', 'bug', 'api', 'admin'],
    milestone: 'Security Hardening Sprint',
    priority: 'P0',
    body: `**Priority:** P0 - Critical

**Description:**
Admin API routes lack secondary authorization checks and rely solely on middleware (currently disabled).

**Location:**
- Directory: \`server/api/admin/**/*.ts\` (47+ endpoints)

**Security Risk:**
- Direct API access without authentication
- Unauthorized data access
- Privilege escalation

**Proposed Solution:**
Create \`requireAdminUser()\` helper and add to ALL admin API routes.

**Acceptance Criteria:**
- [ ] Create authorization helper
- [ ] Add to ALL admin API routes (47 endpoints)
- [ ] Verify role checking works
- [ ] Enforce AAL2 (MFA) at API level
- [ ] Add request logging
- [ ] Test each endpoint
- [ ] Update API documentation

**References:**
- Code Review: \`/CODE_REVIEW_2025.md\` - Section 2.2

**Estimated Effort:** 3 days`
  },
  {
    title: 'Refactor Products Page - Split into Smaller Components',
    labels: ['tech-debt', 'refactoring', 'high-priority', 'user-facing'],
    milestone: 'Technical Debt Sprint',
    priority: 'P1',
    body: `**Priority:** P1 - High

**Description:**
Products page is 915 lines long with mixed concerns, making it difficult to maintain and test.

**Location:**
- File: \`pages/products/index.vue:1-914\`

**Issues:**
- 915 lines (recommended: <400)
- 40+ reactive refs/computed
- Mixed UI, logic, and API calls
- Hard to test

**Proposed Solution:**
Split into focused components:
- \`components/product/Filters.vue\` (<150 lines)
- \`components/product/SearchBar.vue\` (<100 lines)
- \`components/product/Grid.vue\` (<120 lines)
- \`composables/useProductFilters.ts\`
- \`composables/useProductSearch.ts\`

**Acceptance Criteria:**
- [ ] Create component structure
- [ ] Extract filter logic to composable
- [ ] Extract search logic to composable
- [ ] Main page <200 lines
- [ ] All tests passing

**References:**
- Code Review: \`/CODE_REVIEW_2025.md\` - Section 1.1

**Estimated Effort:** 4 days`
  },
  {
    title: 'Implement Cart Data Encryption in LocalStorage',
    labels: ['security', 'enhancement', 'high-priority', 'user-facing'],
    milestone: 'Security Hardening Sprint',
    priority: 'P1',
    body: `**Priority:** P1 - High

**Description:**
Cart data stored unencrypted in localStorage allows tampering.

**Security Risk:**
- Price manipulation
- Quantity manipulation
- Product substitution

**Proposed Solution:**
Implement encryption using Web Crypto API (AES-GCM).

**Acceptance Criteria:**
- [ ] Create \`lib/cartSecurity.ts\`
- [ ] Use Web Crypto API
- [ ] Encrypt before localStorage write
- [ ] Decrypt on read
- [ ] Add integrity checks (HMAC)
- [ ] Test cross-browser

**References:**
- Code Review: \`/CODE_REVIEW_2025.md\` - Section 1.2

**Estimated Effort:** 3 days`
  },
  {
    title: 'Add Global Error Boundary Component',
    labels: ['bug', 'enhancement', 'high-priority', 'user-facing'],
    milestone: 'UX Improvements Sprint',
    priority: 'P1',
    body: `**Priority:** P1 - High

**Description:**
No global error boundary causes crashes and poor UX.

**Issues:**
- Unhandled errors crash page
- No fallback UI
- Users see blank screen
- No error reporting

**Proposed Solution:**
Implement error boundary with fallback UI and error tracking integration.

**Acceptance Criteria:**
- [ ] Create \`CommonErrorBoundary\` component
- [ ] Create \`ErrorFallback\` component
- [ ] Integrate with Sentry/LogRocket
- [ ] Add different fallbacks for error types
- [ ] Implement error recovery
- [ ] Test various scenarios

**References:**
- Code Review: \`/CODE_REVIEW_2025.md\` - Section 1.3

**Estimated Effort:** 2 days`
  },
  {
    title: 'Improve Mobile User Experience',
    labels: ['enhancement', 'mobile', 'high-priority', 'user-facing', 'ux'],
    milestone: 'Mobile UX Sprint',
    priority: 'P1',
    body: `**Priority:** P1 - High

**Description:**
Mobile UX is inconsistent with missing gestures and poor touch targets.

**Issues:**
- Pull-to-refresh only on products page
- No swipe-to-delete on cart
- Missing bottom navigation
- Touch targets <44px

**Proposed Improvements:**
1. Swipe-to-remove for cart items
2. Bottom navigation for mobile
3. Pull-to-refresh everywhere
4. Touch target optimization (min 44x44px)

**Acceptance Criteria:**
- [ ] Implement swipe-to-remove
- [ ] Create mobile bottom nav
- [ ] Add pull-to-refresh to all pages
- [ ] Fix touch target sizes
- [ ] Add haptic feedback
- [ ] Test on iOS and Android

**References:**
- Code Review: \`/CODE_REVIEW_2025.md\` - Section 1.3

**Estimated Effort:** 5 days`
  },
  {
    title: 'Split Auth Store into Smaller Modules',
    labels: ['tech-debt', 'refactoring', 'high-priority', 'admin'],
    milestone: 'Technical Debt Sprint',
    priority: 'P1',
    body: `**Priority:** P1 - High

**Description:**
Auth store is 1,172 lines with mixed concerns.

**Location:**
- File: \`stores/auth.ts:1-1172\`

**Proposed Structure:**
\`\`\`
stores/auth/
├── index.ts (coordinator)
├── core.ts (login, logout, session)
├── mfa.ts (MFA enrollment/verification)
├── profile.ts (profile management)
└── lockout.ts (account locking)
\`\`\`

**Acceptance Criteria:**
- [ ] Create module structure
- [ ] Split into focused files (<500 lines each)
- [ ] Update all imports
- [ ] Add module-specific tests
- [ ] Update documentation

**References:**
- Code Review: \`/CODE_REVIEW_2025.md\` - Section 2.5

**Estimated Effort:** 4 days`
  }
];

async function createGitHubIssue(issue) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: issue.title,
      body: issue.body,
      labels: issue.labels
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create issue: ${response.status} ${error}`);
  }

  return await response.json();
}

async function main() {
  console.log('🚀 Creating GitHub issues from code review...\n');
  console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log(`Total issues to create: ${issues.length}\n`);

  const results = {
    success: [],
    failed: []
  };

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    console.log(`[${i + 1}/${issues.length}] Creating: ${issue.title}`);

    try {
      const created = await createGitHubIssue(issue);
      results.success.push({ title: issue.title, number: created.number, url: created.html_url });
      console.log(`   ✅ Created issue #${created.number}`);
    } catch (error) {
      results.failed.push({ title: issue.title, error: error.message });
      console.log(`   ❌ Failed: ${error.message}`);
    }

    // Rate limiting: wait 1 second between requests
    if (i < issues.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.success.length > 0) {
    console.log('\n✅ Successfully Created Issues:');
    results.success.forEach(issue => {
      console.log(`   #${issue.number}: ${issue.title}`);
      console.log(`   ${issue.url}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Issues:');
    results.failed.forEach(issue => {
      console.log(`   - ${issue.title}`);
      console.log(`     Error: ${issue.error}`);
    });
  }

  console.log('\n✨ Done!');

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
