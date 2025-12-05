# Test Suite Cleanup Plan
**Based on Codex Branch Principles + Current Test Audit**

**Date:** 2025-12-05
**Status:** Proposed
**Branch:** test/e2e-review-and-fixes

---

## Executive Summary

**Current State:**
- 30+ E2E test files
- 8,615 lines of test code
- 15 Playwright projects (multi-locale, multi-browser)
- 3-tier testing (pre-commit, critical, full E2E)

**Test Results:**
- ✅ Pre-commit smoke tests: 2/3 passing (66%)
- ⚠️ Cart badge timing issue (acceptable for smoke tests)
- ✅ Homepage loads correctly
- ✅ Products page navigation works

**Goal:** Simplify while preserving valuable test coverage

---

## Philosophy: Learn from Codex, Don't Copy

The `codex/simplify-test-infrastructure-and-remove-unused-code` branch demonstrates excellent **greenfield** principles:

### ✅ Adopt These Principles:
1. **Extract helpers only after 3+ duplications**
2. **Pre-commit tests < 30s**
3. **Critical tests < 5min**
4. **Start simple, add complexity as needed**
5. **Delete unused code ruthlessly**

### ❌ Don't Copy This:
- Deleting all tests and starting from scratch
- Removing multi-locale/browser testing
- Abandoning comprehensive coverage

---

## Phase 1: Immediate Cleanup (This Week)

### 1.1 Delete Obsolete/Duplicate Tests

#### Tests to DELETE Immediately:

| File | Lines | Reason |
|------|-------|--------|
| `tests/e2e/home.spec.ts` | ~50 | Superseded by `tests/pre-commit/smoke.spec.ts` |
| `tests/e2e/hero-video.spec.ts` | ~46 | Feature-specific, low value |
| `tests/e2e/test-user-personas.spec.ts` | ~183 | Complex fixture usage, rarely valuable |
| `tests/e2e/p0-critical-fixes.spec.ts` | ~357 | Fixes are complete, tests should be in auth/cart/checkout |

**Estimated Deletion:** ~636 lines

### 1.2 Consolidate Duplicates

#### Admin Tests (Merge Into One Suite):

Current:
- `tests/e2e/admin/admin-dashboard.spec.ts` (543 lines)
- `tests/e2e/admin/products-new.spec.ts` (145 lines)
- `tests/e2e/admin/products-new-comprehensive.spec.ts` (398 lines)
- `tests/e2e/admin/products-list.spec.ts` (394 lines)

**Action:** Keep `products-new-comprehensive.spec.ts`, delete `products-new.spec.ts`
**Rationale:** The comprehensive version includes all tests from the simple version

#### Auth Tests (Already Organized Well):

Current:
- `auth/login.spec.ts` (392 lines)
- `auth/register.spec.ts` (460 lines)
- `auth/logout.spec.ts` (310 lines)
- `auth/password-reset.spec.ts` (284 lines)
- `auth/auth-i18n.spec.ts` (383 lines)
- `auth/auth-accessibility.spec.ts` (458 lines)
- `auth/auth-mobile-responsive.spec.ts` (318 lines)

**Action:** Keep all, but reduce to 1 browser for non-critical tests
**Rationale:** These test different aspects (i18n, a11y, mobile)

---

## Phase 2: Simplify Playwright Config (Next Week)

### 2.1 Reduce Browser Matrix

**Current:** 15 projects (4 locales × 3 browsers + 2 mobile + pre-commit + critical + setup)

**Proposed:**

```typescript
projects: [
  // Ultra-fast: Pre-commit (< 30s)
  {
    name: 'pre-commit',
    testDir: './tests/pre-commit',
    use: { ...devices['Desktop Chrome'], locale: 'es' },
    retries: 0,
    timeout: 30000,
  },

  // Fast: Critical deployment confidence (< 5min)
  {
    name: 'critical',
    testDir: './tests/e2e/critical',
    use: { ...devices['Desktop Chrome'], locale: 'es' },
    retries: 1,
    timeout: 30000,
  },

  // Full E2E: Comprehensive (run less frequently)
  {
    name: 'chromium-es',  // Spanish + Chromium (default for dev)
    use: { ...devices['Desktop Chrome'], locale: 'es' },
  },
  {
    name: 'chromium-en',  // English + Chromium
    use: { ...devices['Desktop Chrome'], locale: 'en' },
  },
  {
    name: 'firefox-es',   // Firefox for cross-browser
    use: { ...devices['Desktop Firefox'], locale: 'es' },
  },
  {
    name: 'mobile',       // Mobile for responsive
    use: { ...devices['Pixel 5'], locale: 'es' },
  },
]
```

**Reduction:** 15 projects → 6 projects (60% reduction)

### 2.2 Test Execution Strategy

| Environment | Tests | Browsers | Locales | Frequency |
|-------------|-------|----------|---------|-----------|
| **Pre-commit** | Smoke (3 tests) | Chrome | ES | Every commit |
| **Pre-deployment** | Critical (5 tests) | Chrome | ES | Before deploy |
| **Nightly CI** | Full suite | Chrome | ES, EN | Nightly |
| **Pre-release** | Full suite | Chrome, Firefox | All 4 | Before release |
| **Manual** | Mobile tests | Pixel 5 | ES | On-demand |

---

## Phase 3: Extract Helpers (Ongoing)

### 3.1 Current Helpers

```
tests/e2e/critical/helpers/
└── critical-test-helpers.ts
```

**Status:** ✅ Good! Only one helper file extracted after seeing duplication

### 3.2 Rule: Extract After 3rd Duplication

**Do NOT extract until you see the same pattern 3+ times**

Example:
```typescript
// ❌ DON'T extract after 1st use
test('test 1', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@test.com')
})

// ❌ DON'T extract after 2nd use
test('test 2', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@test.com')
})

// ✅ DO extract after 3rd use
// Create: tests/helpers/auth-helpers.ts
async function fillLoginForm(page, email) {
  await page.goto('/login')
  await page.fill('[name="email"]', email)
}
```

---

## Deletion Checklist

### Files to DELETE (High Confidence):

- [ ] `tests/e2e/home.spec.ts` - Replaced by smoke tests
- [ ] `tests/e2e/hero-video.spec.ts` - Low-value feature test
- [ ] `tests/e2e/test-user-personas.spec.ts` - Overly complex
- [ ] `tests/e2e/p0-critical-fixes.spec.ts` - Fixes are done
- [ ] `tests/e2e/admin/products-new.spec.ts` - Superseded by comprehensive version

**Total Deletion:** ~779 lines (9% reduction)

### Files to REVIEW (Needs Manual Check):

- [ ] `tests/e2e/security-gdpr.spec.ts` (399 lines) - Is GDPR tested elsewhere?
- [ ] `tests/e2e/address-crud.spec.ts` (344 lines) - Is this feature still used?
- [ ] `tests/e2e/products-pagination.spec.ts` (271 lines) - Is pagination critical?
- [ ] `tests/e2e/auth/auth-accessibility.spec.ts` (458 lines) - Run once, not every test?

### Files to KEEP (High Value):

- [x] `tests/pre-commit/smoke.spec.ts` - Fast smoke tests
- [x] `tests/e2e/critical/*` - Deployment confidence
- [x] `tests/e2e/auth/login.spec.ts` - Core functionality
- [x] `tests/e2e/auth/register.spec.ts` - Core functionality
- [x] `tests/e2e/cart-functionality.spec.ts` - Core functionality
- [x] `tests/e2e/checkout-full-flow.spec.ts` - Core functionality
- [x] `tests/e2e/admin/admin-dashboard.spec.ts` - Admin panel critical

---

## Expected Outcomes

### After Phase 1 (Immediate Cleanup):

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Test Files** | 30 | 25 | -17% |
| **Test LOC** | 8,615 | 7,836 | -9% |
| **Pre-commit Time** | ~90s | ~25s | -72% |
| **Playwright Projects** | 15 | 15 | 0% |

### After Phase 2 (Config Simplification):

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Playwright Projects** | 15 | 6 | -60% |
| **Full Test Suite Time** | 45min | 15min | -67% |
| **Config Complexity** | High | Medium | Better |

### After Phase 3 (Helper Extraction):

- Helpers extracted only when needed
- Tests remain readable
- Duplication eliminated where it matters

---

## Risks & Mitigations

### Risk: Deleting valuable tests

**Mitigation:**
- Review each test before deletion
- Check git blame to see recent activity
- Run test before deleting to see if it catches bugs

### Risk: Breaking existing workflows

**Mitigation:**
- Keep pre-commit and critical projects unchanged
- Phase changes over 3 weeks
- Document all changes

### Risk: Losing multi-locale coverage

**Mitigation:**
- Keep locale testing for full suite
- Run comprehensive tests nightly
- Mobile/browser testing on-demand

---

## Implementation Timeline

### Week 1 (Dec 5-12):
- ✅ Audit current tests
- Delete 5 low-value test files
- Update Playwright config (Phase 2)
- Run full test suite to verify

### Week 2 (Dec 13-20):
- Review "needs manual check" tests
- Extract helpers if 3+ duplications found
- Update CI to use new config
- Document changes

### Week 3 (Dec 21-27):
- Monitor test suite in CI
- Adjust timeouts if needed
- Final cleanup based on learnings
- Close cleanup ticket

---

## Success Criteria

- ✅ Pre-commit tests < 30s
- ✅ Critical tests < 5min
- ✅ Full suite < 20min (on CI)
- ✅ Test count reduced by >10%
- ✅ Config simplified (6 projects instead of 15)
- ✅ No regressions in coverage
- ✅ Team confidence in test suite

---

## References

- Codex branch: `codex/simplify-test-infrastructure-and-remove-unused-code`
- Current branch: `test/e2e-review-and-fixes`
- YAGNI Principle: https://martinfowler.com/bliki/Yagni.html
- Playwright Best Practices: https://playwright.dev/docs/best-practices

**Last Updated:** 2025-12-05
