# Tests to Delete - Detailed Analysis
**Date:** 2025-12-05
**Auditor:** Test Infrastructure Review
**Branch:** test/e2e-review-and-fixes

---

## Summary

| Category | Files | Lines | Confidence |
|----------|-------|-------|------------|
| **Delete Immediately** | 5 | ~779 | HIGH |
| **Review & Decide** | 4 | ~1,472 | MEDIUM |
| **Keep** | 21 | ~6,364 | HIGH |
| **TOTAL** | 30 | 8,615 | - |

---

## DELETE IMMEDIATELY (High Confidence)

### 1. tests/e2e/home.spec.ts (~50 lines)

**Why Delete:**
- Replaced by `tests/pre-commit/smoke.spec.ts`
- Smoke tests cover homepage loading
- Duplication with no additional value

**Evidence:**
```typescript
// Old: tests/e2e/home.spec.ts
test('homepage has title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Moldova/)
})

// New: tests/pre-commit/smoke.spec.ts (already exists)
test('homepage loads without errors', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveTitle(/Moldova Direct/i)
})
```

**Delete Command:**
```bash
git rm tests/e2e/home.spec.ts
```

---

### 2. tests/e2e/hero-video.spec.ts (~46 lines)

**Why Delete:**
- Feature-specific test for hero video
- Low ROI (Return on Investment)
- Not a critical user path
- If video breaks, users will report it

**Git History:**
```bash
git log --oneline tests/e2e/hero-video.spec.ts
# Check when last modified and by whom
```

**Delete Command:**
```bash
git rm tests/e2e/hero-video.spec.ts
```

---

### 3. tests/e2e/test-user-personas.spec.ts (~183 lines)

**Why Delete:**
- Overly complex fixture usage
- Tests user personas that aren't actively maintained
- Fixtures likely from `testUserPersonas.fixture.ts` which is heavy
- Better to test real user flows, not abstract personas

**Evidence:**
- File relies on complex test fixtures
- Personas approach is academic, not practical
- Real auth/cart/checkout tests cover actual user behavior

**Delete Command:**
```bash
git rm tests/e2e/test-user-personas.spec.ts
```

---

### 4. tests/e2e/p0-critical-fixes.spec.ts (~357 lines)

**Why Delete:**
- P0 fixes are complete (evidence: recent commits show "fix:" messages)
- Tests for fixed bugs should live in their feature test files
- Example: Cart bugs should be in `cart-functionality.spec.ts`
- Keeping this file implies fixes are temporary

**Better Approach:**
- Move cart tests → `cart-functionality.spec.ts`
- Move auth tests → `auth/login.spec.ts` or `auth/register.spec.ts`
- Move checkout tests → `checkout-full-flow.spec.ts`

**Action Required:**
1. Read `p0-critical-fixes.spec.ts`
2. Identify which tests are still valuable
3. Move valuable tests to their feature files
4. Delete `p0-critical-fixes.spec.ts`

**Delete Command (after moving tests):**
```bash
git rm tests/e2e/p0-critical-fixes.spec.ts
```

---

### 5. tests/e2e/admin/products-new.spec.ts (~145 lines)

**Why Delete:**
- Superseded by `products-new-comprehensive.spec.ts` (398 lines)
- The comprehensive version includes all tests from this file
- Duplication with no additional value

**Verification:**
```bash
# Check if comprehensive version covers all cases
diff <(grep "test(" tests/e2e/admin/products-new.spec.ts | sed 's/.*test(//' | cut -d"'" -f2) \
     <(grep "test(" tests/e2e/admin/products-new-comprehensive.spec.ts | sed 's/.*test(//' | cut -d"'" -f2)
```

**Delete Command:**
```bash
git rm tests/e2e/admin/products-new.spec.ts
```

---

## REVIEW & DECIDE (Medium Confidence)

### 1. tests/e2e/security-gdpr.spec.ts (~399 lines)

**Questions to Answer:**
- Is GDPR compliance tested elsewhere?
- Are these tests running green?
- When was this last maintained?

**How to Decide:**
```bash
# Check test status
PLAYWRIGHT_TEST=true npx playwright test tests/e2e/security-gdpr.spec.ts

# Check last modification
git log --oneline tests/e2e/security-gdpr.spec.ts

# Check if GDPR is critical for your business
# If EU customers: KEEP
# If no EU customers: DELETE or move to integration tests
```

**Recommendation:**
- **IF** serving EU customers: **KEEP** but run only in full suite (not pre-commit)
- **IF** no EU customers: **DELETE**

---

### 2. tests/e2e/address-crud.spec.ts (~344 lines)

**Questions to Answer:**
- Is address management a critical feature?
- Do users actively create/edit/delete addresses?
- Is this tested in checkout flow already?

**How to Decide:**
```bash
# Check if checkout tests cover address functionality
grep -r "address" tests/e2e/checkout-full-flow.spec.ts
grep -r "shipping" tests/e2e/checkout-full-flow.spec.ts

# Check test status
PLAYWRIGHT_TEST=true npx playwright test tests/e2e/address-crud.spec.ts
```

**Recommendation:**
- **IF** checkout covers address: **DELETE** or reduce to critical paths
- **IF** standalone address management is important: **KEEP** but simplify

---

### 3. tests/e2e/products-pagination.spec.ts (~271 lines)

**Questions to Answer:**
- Is pagination a critical feature?
- How many products do you have?
- Is pagination ever broken?

**How to Decide:**
```bash
# Check product count in your database
# If < 20 products: pagination not critical
# If > 100 products: pagination critical

# Check test status
PLAYWRIGHT_TEST=true npx playwright test tests/e2e/products-pagination.spec.ts
```

**Recommendation:**
- **IF** < 50 products: **DELETE**
- **IF** > 100 products: **KEEP** and add to critical suite

---

### 4. tests/e2e/auth/auth-accessibility.spec.ts (~458 lines)

**Questions to Answer:**
- Is accessibility a legal requirement?
- Are these tests running green?
- How often do accessibility bugs occur?

**How to Decide:**
```bash
# Check test status
PLAYWRIGHT_TEST=true npx playwright test tests/e2e/auth/auth-accessibility.spec.ts

# Check if accessibility is a requirement
# - Legal requirement (WCAG 2.1 AA): KEEP
# - Nice to have: RUN MANUALLY (not in CI)
```

**Recommendation:**
- **KEEP** the file
- **BUT** run only in full suite, not pre-commit
- **OR** run weekly, not daily

---

## KEEP (High Value)

### Core Functionality Tests (KEEP):

1. ✅ `tests/pre-commit/smoke.spec.ts` - Fast smoke tests
2. ✅ `tests/e2e/critical/auth-critical.spec.ts` - Core auth paths
3. ✅ `tests/e2e/critical/cart-critical.spec.ts` - Core cart paths
4. ✅ `tests/e2e/critical/checkout-critical.spec.ts` - Core checkout paths
5. ✅ `tests/e2e/critical/products-critical.spec.ts` - Core product paths
6. ✅ `tests/e2e/critical/admin-critical.spec.ts` - Core admin paths

### Auth Tests (KEEP):

7. ✅ `tests/e2e/auth/login.spec.ts` (392 lines) - Core functionality
8. ✅ `tests/e2e/auth/register.spec.ts` (460 lines) - Core functionality
9. ✅ `tests/e2e/auth/logout.spec.ts` (310 lines) - Core functionality
10. ✅ `tests/e2e/auth/password-reset.spec.ts` (284 lines) - Core functionality
11. ✅ `tests/e2e/auth/auth-i18n.spec.ts` (383 lines) - Multi-locale critical
12. ✅ `tests/e2e/auth/auth-mobile-responsive.spec.ts` (318 lines) - Mobile critical

### Cart & Checkout (KEEP):

13. ✅ `tests/e2e/cart-functionality.spec.ts` (388 lines) - Core functionality
14. ✅ `tests/e2e/checkout-full-flow.spec.ts` (179 lines) - Core functionality

### Admin Tests (KEEP):

15. ✅ `tests/e2e/admin/admin-dashboard.spec.ts` (543 lines) - Admin critical
16. ✅ `tests/e2e/admin/products-new-comprehensive.spec.ts` (398 lines) - Admin critical
17. ✅ `tests/e2e/admin/products-list.spec.ts` (394 lines) - Admin critical
18. ✅ `tests/e2e/admin/inventory.spec.ts` (358 lines) - Admin critical
19. ✅ `tests/e2e/admin/orders-analytics.spec.ts` (469 lines) - Admin analytics
20. ✅ `tests/e2e/admin/analytics.spec.ts` (291 lines) - Admin analytics
21. ✅ `tests/e2e/admin/email-testing.spec.ts` (431 lines) - Email functionality
22. ✅ `tests/e2e/admin/email-logs.spec.ts` (483 lines) - Email logs

**Total KEEP:** 21 files, ~6,364 lines

---

## Execution Plan

### Step 1: Delete High-Confidence Files (Today)

```bash
#!/bin/bash
# Save as: scripts/delete-obsolete-tests.sh

echo "🗑️  Deleting obsolete test files..."

# Backup first
git checkout -b backup/before-test-deletion-$(date +%Y%m%d)
git push origin backup/before-test-deletion-$(date +%Y%m%d)

# Switch back
git checkout test/e2e-review-and-fixes

# Delete files
git rm tests/e2e/home.spec.ts
git rm tests/e2e/hero-video.spec.ts
git rm tests/e2e/test-user-personas.spec.ts

# Don't delete p0-critical-fixes yet (needs manual review)
echo "⚠️  Manual review needed:"
echo "   - tests/e2e/p0-critical-fixes.spec.ts"
echo "   - tests/e2e/admin/products-new.spec.ts"

# Commit
git commit -m "chore: delete obsolete test files

- Remove tests/e2e/home.spec.ts (superseded by smoke tests)
- Remove tests/e2e/hero-video.spec.ts (low-value feature test)
- Remove tests/e2e/test-user-personas.spec.ts (overly complex)

Rationale: Following test cleanup plan to reduce duplication
and remove low-value tests. See docs/testing/TEST_CLEANUP_PLAN.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "✅ Deleted 3 test files"
echo "📊 Run: git diff --stat HEAD~1"
```

### Step 2: Review Medium-Confidence Files (This Week)

```bash
# For each file, run the test and check results
for file in \
  tests/e2e/security-gdpr.spec.ts \
  tests/e2e/address-crud.spec.ts \
  tests/e2e/products-pagination.spec.ts \
  tests/e2e/auth/auth-accessibility.spec.ts
do
  echo "Testing: $file"
  PLAYWRIGHT_TEST=true npx playwright test "$file" --reporter=list
  read -p "Keep this test? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    git rm "$file"
    echo "Marked for deletion: $file"
  fi
done
```

### Step 3: Manual Review of p0-critical-fixes.spec.ts

```bash
# 1. Read the file
cat tests/e2e/p0-critical-fixes.spec.ts

# 2. Identify valuable tests
grep "test(" tests/e2e/p0-critical-fixes.spec.ts

# 3. Move valuable tests to feature files
# Example: If test is "cart badge shows count"
# Move to: tests/e2e/cart-functionality.spec.ts

# 4. After moving tests, delete the file
git rm tests/e2e/p0-critical-fixes.spec.ts
```

---

## Verification Checklist

After deleting tests:

- [ ] Run pre-commit tests: `pnpm run test:pre-commit`
- [ ] Run critical tests: `PLAYWRIGHT_TEST=true npx playwright test --project=critical`
- [ ] Check no tests reference deleted files: `grep -r "import.*home.spec" tests/`
- [ ] Verify test count reduced: `find tests/e2e -name "*.spec.ts" | wc -l`
- [ ] Verify line count reduced: `wc -l tests/e2e/**/*.spec.ts | tail -1`
- [ ] Push to branch and create PR

---

## Expected Results

### Before Deletion:
- Test files: 30
- Test lines: 8,615
- Pre-commit time: ~90s

### After Immediate Deletion (3 files):
- Test files: 27 (-10%)
- Test lines: ~8,336 (-3%)
- Pre-commit time: ~90s (unchanged, smoke tests separate)

### After Full Cleanup (7-10 files):
- Test files: 20-23 (-23-33%)
- Test lines: ~6,500-7,000 (-19-24%)
- Pre-commit time: ~25s (after config changes)

---

## Risk Mitigation

1. **Backup branch created** before any deletions
2. **Each deletion has clear rationale** documented here
3. **Tests reviewed manually** before deletion
4. **Can be reverted** if needed: `git revert <commit>`
5. **Valuable test logic preserved** by moving to feature files

---

## References

- Test Cleanup Plan: `docs/testing/TEST_CLEANUP_PLAN.md`
- Codex Branch Review: (see branch comparison document)
- YAGNI Principle: https://martinfowler.com/bliki/Yagni.html

**Last Updated:** 2025-12-05
