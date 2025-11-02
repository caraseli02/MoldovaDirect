# E2E and Visual Test Coverage Analysis

**Generated:** 2025-10-31
**Requirement:** At least basic visual check for each page

## Executive Summary

**Total Pages:** 47
**Pages with Visual Tests:** 9 (19%)
**Pages with E2E Tests (no visual):** 15 (32%)
**Pages with NO Tests:** 23 (49%)

## Test Coverage by Page

### ✅ Pages with Visual Tests (Screenshot Coverage)

| Page | Route | Visual Test File | E2E Test File |
|------|-------|-----------------|---------------|
| Homepage | `/` | visual-regression.spec.ts, ui-validation.spec.ts | basic.spec.ts, multiple |
| Product Listing | `/products` | visual-regression.spec.ts, ui-validation.spec.ts | products.spec.ts |
| Product Detail | `/products/[slug]` | visual-regression.spec.ts | products.spec.ts |
| Cart | `/cart` | visual-regression.spec.ts | cart-*.spec.ts (multiple) |
| Checkout | `/checkout` | visual-regression.spec.ts | checkout.spec.ts |
| Order Confirmation | `/checkout/confirmation` | visual-regression.spec.ts | checkout.spec.ts |
| Login | `/auth/login` | visual-regression.spec.ts, ui-validation.spec.ts | auth*.spec.ts (multiple) |
| Register | `/auth/register` | visual-regression.spec.ts, ui-validation.spec.ts | auth*.spec.ts (multiple) |
| About | `/about` | ui-validation.spec.ts | basic.spec.ts |
| Contact | `/contact` | ui-validation.spec.ts | i18n.spec.ts |

### ⚠️ Pages with E2E Tests but NO Visual Checks

| Page | Route | E2E Test File | Has Basic Navigation Test |
|------|-------|---------------|--------------------------|
| Admin Orders List | `/admin/orders` | admin-orders.spec.ts | ✅ Yes |
| Admin Order Detail | `/admin/orders/[id]` | admin-orders.spec.ts | ✅ Yes |
| Account Index | `/account` | middleware-integration.spec.ts | ✅ Yes |
| Account Profile | `/account/profile` | profile-management.spec.ts | ✅ Yes |
| Account Orders | `/account/orders` | middleware-integration.spec.ts | ✅ Yes |
| Auth Verify Email | `/auth/verify-email` | auth-email-workflows.spec.ts | ✅ Yes |
| Auth Verification Pending | `/auth/verification-pending` | auth-email-workflows.spec.ts | ✅ Yes |
| Auth Reset Password | `/auth/reset-password` | auth-email-workflows.spec.ts | ✅ Yes |
| Auth Forgot Password | `/auth/forgot-password` | auth-email-workflows.spec.ts | ✅ Yes |
| Auth MFA Verify | `/auth/mfa-verify` | (referenced in auth tests) | Partial |
| Shipping Info | `/shipping` | i18n.spec.ts | ✅ Yes |

### ❌ Pages with NO Tests (Critical Gaps)

#### Admin Pages (11 pages)
| Page | Route | Priority | Notes |
|------|-------|----------|-------|
| Admin Dashboard | `/admin` | HIGH | Main admin landing page |
| Admin Analytics | `/admin/analytics` | HIGH | Analytics dashboard |
| Admin Email Templates | `/admin/email-templates` | MEDIUM | Email template management |
| Admin Email Logs | `/admin/email-logs` | MEDIUM | Email logging interface |
| Admin Inventory | `/admin/inventory` | HIGH | Inventory management |
| Admin Products List | `/admin/products` | HIGH | Product management list |
| Admin New Product | `/admin/products/new` | HIGH | Create product form |
| Admin Edit Product | `/admin/products/[id]` | HIGH | Edit product form |
| Admin Seed Orders | `/admin/seed-orders` | LOW | Development/testing tool |
| Admin Email Testing | `/admin/tools/email-testing` | LOW | Development/testing tool |
| Admin Users | `/admin/users` | HIGH | User management |
| Admin Order Analytics | `/admin/orders/analytics` | MEDIUM | Order analytics dashboard |

#### Account Pages (2 pages)
| Page | Route | Priority | Notes |
|------|-------|----------|-------|
| Account Order Detail | `/account/orders/[id]` | HIGH | User's order detail view |
| Account Security/MFA | `/account/security/mfa` | HIGH | Security settings |

#### Auth Pages (1 page)
| Page | Route | Priority | Notes |
|------|-------|----------|-------|
| Auth Confirm | `/auth/confirm` | MEDIUM | Email confirmation page |

#### Checkout Pages (2 pages)
| Page | Route | Priority | Notes |
|------|-------|----------|-------|
| Checkout Payment | `/checkout/payment` | HIGH | Payment step |
| Checkout Review | `/checkout/review` | HIGH | Order review step |

#### Informational Pages (4 pages)
| Page | Route | Priority | Notes |
|------|-------|----------|-------|
| Privacy Policy | `/privacy` | MEDIUM | Legal/compliance page |
| Terms of Service | `/terms` | MEDIUM | Legal/compliance page |
| FAQ | `/faq` | MEDIUM | Customer support page |
| Returns | `/returns` | MEDIUM | Returns policy page |
| Track Order | `/track-order` | HIGH | Order tracking interface |

#### Development/Test Pages (3 pages)
| Page | Route | Priority | Notes |
|------|-------|----------|-------|
| Component Showcase | `/component-showcase` | LOW | Development tool |
| Demo Payment | `/demo/payment` | LOW | Demo/testing page |
| Test Admin | `/test-admin` | LOW | Testing page |
| Test API | `/test-api` | LOW | Testing page |

## Detailed Analysis

### Current Visual Test Coverage

#### 1. visual-regression.spec.ts
**Coverage:**
- Homepage (with responsive variants: mobile, tablet)
- Homepage (with i18n variants: es, en, ro, ru)
- Product pages (listing, detail, category, search)
- Cart (empty, with items, mobile)
- Checkout (form, confirmation)
- Auth (login, register, dashboard)
- Navigation, footer, error pages (404)
- Loading states

**Strengths:**
- Comprehensive responsive testing
- Good i18n coverage
- Tests loading states and error states
- Tests interactive components

**Gaps:**
- References `/dashboard` which doesn't exist as a page (should be `/account`)
- Missing admin pages entirely
- Missing account management pages
- Missing checkout sub-steps (payment, review)

#### 2. ui-validation.spec.ts
**Coverage:**
- Homepage (desktop, mobile, tablet)
- About page
- Products page
- Contact page
- Login/Register pages
- Navigation, footer, form elements

**Strengths:**
- Good responsive coverage
- Captures key public-facing pages
- Tests hover states and interactive elements

**Gaps:**
- Limited to public pages
- No authenticated/protected pages

### Current E2E Test Coverage

#### Well-Covered Features:
1. **Authentication** (auth*.spec.ts files)
   - Login, register, email workflows
   - Accessibility, mobile responsive
   - But missing visual checks for many auth flows

2. **Cart System** (cart-*.spec.ts files)
   - Extensive functional testing
   - Validation, persistence, workflows
   - Good integration tests
   - Has visual tests for basic cart page

3. **Products** (products.spec.ts)
   - Browse, search, filter, pagination
   - Has visual tests

4. **Admin Orders** (admin-orders.spec.ts)
   - Comprehensive functional tests
   - **Missing visual checks**

5. **Profile Management** (profile-management.spec.ts)
   - Complete functional coverage
   - **Missing visual checks**

## Priority Recommendations

### HIGH Priority - Add Visual Tests (Critical User Journeys)

1. **Admin Dashboard & Key Admin Pages**
   ```typescript
   // Recommended: tests/visual/admin-pages.spec.ts
   - /admin (dashboard)
   - /admin/inventory
   - /admin/products
   - /admin/products/new
   - /admin/products/[id]
   - /admin/users
   - /admin/analytics
   ```

2. **Account Management Pages**
   ```typescript
   // Recommended: tests/visual/account-pages.spec.ts
   - /account (dashboard)
   - /account/profile
   - /account/orders
   - /account/orders/[id]
   - /account/security/mfa
   ```

3. **Checkout Flow Pages**
   ```typescript
   // Recommended: Add to tests/visual/visual-regression.spec.ts
   - /checkout/payment
   - /checkout/review
   ```

4. **Order Tracking**
   ```typescript
   // Recommended: tests/visual/order-tracking.spec.ts
   - /track-order
   ```

### MEDIUM Priority - Add Visual Tests

5. **Informational Pages**
   ```typescript
   // Recommended: tests/visual/static-pages.spec.ts
   - /privacy
   - /terms
   - /faq
   - /returns
   - /shipping (already has E2E test)
   ```

6. **Remaining Auth Pages**
   ```typescript
   // Recommended: Add to tests/visual/visual-regression.spec.ts
   - /auth/forgot-password
   - /auth/reset-password
   - /auth/verify-email
   - /auth/verification-pending
   - /auth/mfa-verify
   - /auth/confirm
   ```

### LOW Priority

7. **Development/Test Pages**
   - Consider excluding from production visual tests
   - Or create separate test suite for dev tools

## Specific Gaps in Existing Visual Tests

### Issue 1: Dashboard Reference Error
**File:** tests/visual/visual-regression.spec.ts:187-197

```typescript
test('should match user dashboard @visual', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard')  // ❌ This page doesn't exist
  // ...
})
```

**Fix:** Should be `/account` or `/account/profile`

### Issue 2: Admin Orders Coverage
**File:** tests/e2e/admin-orders.spec.ts

- Comprehensive functional tests exist
- **Missing:** Visual screenshot tests
- **Impact:** Admin UI changes could break unnoticed

### Issue 3: Profile Management Coverage
**File:** tests/e2e/profile-management.spec.ts

- 500+ lines of functional tests
- **Missing:** Visual screenshot tests
- **Impact:** Profile UI changes could break unnoticed

## Recommended Test Files to Create

### 1. tests/visual/admin-visual.spec.ts
```typescript
// Cover all admin pages with basic screenshots
- Admin dashboard
- Admin orders (already functionally tested)
- Admin products
- Admin inventory
- Admin users
- Admin analytics
- Admin email management
```

### 2. tests/visual/account-visual.spec.ts
```typescript
// Cover all account pages with basic screenshots
- Account dashboard
- Account profile (already functionally tested)
- Account orders
- Account order detail
- Account security/MFA
```

### 3. tests/visual/checkout-visual.spec.ts
```typescript
// Expand existing checkout tests
- Checkout payment step
- Checkout review step
- Add to existing checkout tests
```

### 4. tests/visual/static-pages-visual.spec.ts
```typescript
// Cover all informational pages
- Privacy policy
- Terms of service
- FAQ
- Returns policy
- Shipping information
- Track order
```

### 5. tests/visual/auth-complete-visual.spec.ts
```typescript
// Complete auth flow coverage
- Forgot password
- Reset password
- Verify email
- Verification pending
- MFA verify
- Confirm email
```

## Implementation Plan

### Phase 1: Critical User Paths (Week 1)
- [ ] Add visual tests for admin dashboard and key admin pages
- [ ] Add visual tests for account management pages
- [ ] Fix `/dashboard` reference in visual-regression.spec.ts
- [ ] Add visual tests for checkout payment and review steps

### Phase 2: Secondary Pages (Week 2)
- [ ] Add visual tests for all auth pages
- [ ] Add visual tests for informational pages (privacy, terms, faq, etc.)
- [ ] Add visual tests for order tracking

### Phase 3: Coverage Verification (Week 3)
- [ ] Run full visual test suite
- [ ] Update baseline screenshots
- [ ] Document any intentionally excluded pages
- [ ] Set up CI/CD integration for visual regression tests

## Testing Standards

### Minimum Visual Test Requirements
Each page should have:

1. **Basic Screenshot Test**
   ```typescript
   test('should match [page-name] layout @visual', async ({ page }) => {
     await page.goto('[route]')
     await page.waitForLoadState('networkidle')

     await expect(page).toHaveScreenshot('[page-name]-full.png', {
       fullPage: true
     })
   })
   ```

2. **For Authenticated Pages**
   ```typescript
   test('should match [page-name] layout @visual', async ({ authenticatedPage }) => {
     await authenticatedPage.goto('[route]')
     await page.waitForLoadState('networkidle')

     await expect(authenticatedPage).toHaveScreenshot('[page-name]-full.png', {
       fullPage: true
     })
   })
   ```

3. **For Admin Pages**
   ```typescript
   test('should match [page-name] layout @visual', async ({ adminPage }) => {
     await adminPage.goto('[route]')
     await page.waitForLoadState('networkidle')

     await expect(adminPage).toHaveScreenshot('[page-name]-full.png', {
       fullPage: true
     })
   })
   ```

## Metrics

### Current State
- **Total Pages:** 47
- **Visual Coverage:** 9 pages (19%)
- **E2E Coverage:** 24 pages (51%)
- **No Coverage:** 23 pages (49%)

### Target State (100% Visual Coverage)
- **Total Pages:** 47 (excluding dev/test pages: 44)
- **Visual Coverage:** 44 pages (100%)
- **E2E Coverage:** 44 pages (100%)

### Estimated Effort
- **High Priority:** ~16 pages × 30 min = 8 hours
- **Medium Priority:** ~7 pages × 20 min = 2.5 hours
- **Total Estimated Effort:** ~10.5 hours

## Conclusion

The application currently has **good functional E2E test coverage (51%)** but **insufficient visual test coverage (19%)**. To meet the requirement of "at least basic visual check for each page," we need to add visual tests for:

1. **23 pages with NO tests** (Critical priority)
2. **15 pages with E2E tests but no visual checks** (High priority)

The recommended approach is to create dedicated visual test files for each major section (admin, account, checkout, static pages, auth) and systematically add screenshot tests for all pages, following the established patterns in the existing visual-regression.spec.ts file.
