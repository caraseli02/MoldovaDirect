# Moldova Direct - Comprehensive Codebase Audit Report

**Date:** 2025-12-31
**Branch:** `review/skill-based-codebase-audit`
**Auditors:** 7 Specialized Claude Agents

---

## Executive Summary

This comprehensive audit reviewed the Moldova Direct e-commerce platform against best practices defined in the project's skill files for Vue 3, Nuxt 4, Reka UI, Architecture Patterns, Design Guide, TypeScript, and general code quality.

### Overall Assessment

| Domain | Grade | Critical Issues | Warnings | Recommendations |
|--------|-------|-----------------|----------|-----------------|
| **Vue 3 Patterns** | B+ | 3 | 4 | 4 |
| **Nuxt 4 Patterns** | B | 11 | 22 | 3 |
| **Reka UI/Accessibility** | B- | 6 | 4 | 3 |
| **Architecture** | C- | 5 major | 4 | 7 |
| **Design Guide** | B+ | 1 (93 files) | 2 | 3 |
| **TypeScript** | C+ | 150+ any types | 60+ | 4 |
| **Code Quality** | B | 3 | 47+ TODOs | Multiple |

**Overall Project Grade: B-**

---

## Critical Issues Summary (Must Fix)

### Priority 1: Security & Architecture

1. **Non-timing-safe CSRF comparison** - `server/utils/cartSecurity.ts`
2. **eval() usage in test fixtures** - Security risk if pattern copied
3. **Missing admin user ID in audit logs** - 8+ log entries affected
4. **Fat controllers** - Business logic in API routes (200+ lines each)
5. **No repository abstraction** - Direct Supabase coupling everywhere
6. **Anemic domain model** - No business entities with behavior

### Priority 2: Nuxt 4 Compliance

1. **Deprecated `event.context.params` usage** - 6 server route files
2. **`window.location.origin` usage** - 4 auth pages (breaks SSR)
3. **Generic `[id]` param names** - Should be descriptive (`[orderId]`, `[productId]`)

### Priority 3: Accessibility (WCAG)

1. **Custom modals bypass Reka UI** - `AddressFormModal.vue`, `DeleteAccountModal.vue`
2. **Missing DialogDescription** - 3+ dialog components
3. **Custom tooltip missing ARIA** - `components/custom/Tooltip.vue`
4. **CSS-only tooltips** - `MediaMentions.vue` not keyboard accessible

### Priority 4: Design/TypeScript

1. **93 gradient occurrences** - Violates design guide across 41 files
2. **150+ `: any` types** - Type safety holes throughout codebase
3. **700+ missing i18n keys** - Romanian and Russian locales incomplete

---

## Detailed Findings by Domain

## 1. Vue 3 Patterns Audit

### Critical Issues
- **Incorrect Props Definition Pattern with `withDefaults`** - Components use verbose `props.product` instead of reactive destructuring
- **Missing `readonly()` for Exposed State** - Composables return mutable state
- **Emit Type Definition Inconsistency** - Mix of old/new emit declaration styles

### Warnings
- Large components exceeding 300 lines (PaymentForm: 853 lines, HybridCheckout: 993 lines)
- Missing `defineModel` for v-model components
- Unnecessary Vue imports (Nuxt auto-imports these)

### Files Requiring Attention
- `components/product/Card.vue:363-365`
- `components/checkout/PaymentForm.vue:496-500`
- `composables/useCart.ts` (missing readonly)
- `composables/useProductFilters.ts`

---

## 2. Nuxt 4 Patterns Audit

### Critical Issues (11 total)

**Deprecated `event.context.params` usage:**
```
server/api/admin/orders/[id]/notes.post.ts:30
server/api/admin/orders/[id]/fulfillment-tasks/index.post.ts:22
server/api/admin/orders/[id]/fulfillment-tasks/[taskId].patch.ts:25-26
server/api/admin/email-logs/[id]/retry.post.ts:11
server/api/admin/email-retries/[id].post.ts:13
```

**`window.location.origin` in auth pages:**
```
pages/auth/verification-pending.vue
pages/auth/login.vue
pages/auth/register.vue
pages/auth/verify-email.vue
```
**Fix:** Replace with `useRequestURL().origin`

### Warnings (22 total)
- 9 `index.vue` files should use descriptive names `(name).vue`
- Missing Zod validation in 3+ API routes
- Generic `[id]` params instead of `[orderId]`, `[productId]`, etc.

---

## 3. Reka UI / Accessibility Audit

### Critical Accessibility Issues

| File | Issue |
|------|-------|
| `components/profile/AddressFormModal.vue` | Custom modal bypasses Reka UI - missing focus trap |
| `components/profile/DeleteAccountModal.vue` | Custom modal bypasses Reka UI |
| `components/admin/Email/TemplateHistory.vue:93` | Missing DialogDescription |
| `components/admin/Email/LogsTable.vue:260` | Missing DialogDescription |
| `components/producer/DetailModal.vue` | Missing DialogDescription |
| `components/custom/Tooltip.vue` | Missing ARIA relationships |
| `components/home/MediaMentions.vue:99` | CSS-only tooltip not keyboard accessible |

### Missing App-Level Configuration
- `TooltipProvider` not wrapped at app/layout level

### Good Practices Found
- Base UI components (`components/ui/`) follow Reka UI patterns correctly
- Proper Portal usage for overlays
- Good focus-visible states

---

## 4. Architecture Patterns Audit

### Current State: Transaction Script Pattern

**Grade: C-**

The backend exhibits **significant architectural debt**:

1. **Fat Controllers** - API routes contain 200+ lines of business logic
   - `server/api/orders/create.post.ts:48-246`
   - `server/api/checkout/confirm-payment.post.ts:22-132`

2. **Anemic Domain Model** - No business entities, only TypeScript interfaces
   - `server/utils/orderUtils.ts` - Pure data structures, no behavior

3. **Direct Database Coupling** - Every route hits Supabase directly
   - No repository abstraction
   - Cannot unit test without database

4. **Framework Coupling** - Stripe SDK directly in controllers
   - `server/api/checkout/confirm-payment.post.ts:1-20`

5. **Missing Use Case Layer** - No separation between HTTP and business logic

### Recommended Architecture Refactoring

```
server/
├── domain/
│   ├── entities/        # Rich domain models
│   ├── value-objects/   # Money, OrderId, Email
│   └── repositories/    # Interfaces (ports)
├── application/
│   └── use-cases/       # CreateOrderUseCase, etc.
├── infrastructure/
│   └── repositories/    # SupabaseOrderRepository
└── api/                 # Thin controllers only
```

**Estimated Effort:** 8-12 weeks for full refactoring

---

## 5. Design Guide Compliance Audit

### Grade: B+

**Compliance Score: 13/14 (93%)**

### Critical Issue: Gradients

**93 gradient occurrences across 41 files** violate the design guide.

**Files with most gradients:**
- `pages/wine-story.vue` - 15 occurrences
- `components/home/WineStoryCta.vue` - 9 occurrences
- `components/home/FeaturedProductsSection.vue` - 8 occurrences
- `pages/auth/login.vue` - Background gradient

**Fix:** Replace all decorative gradients with solid colors.

### Positive Findings
- Consistent 8px spacing grid
- Proper neutral gray palette (zinc/slate/gray)
- Minimum 16px body text maintained
- Subtle shadows (no heavy shadow-2xl)
- Complete interactive states (hover, active, disabled, focus)
- Mobile-first responsive design
- Proper accessibility (ARIA, focus rings)

---

## 6. TypeScript Audit

### Grade: C+ (6.5/10)

### Critical Type Safety Issues

| Issue | Count | Impact |
|-------|-------|--------|
| `: any` types | 150+ | Type safety holes |
| `as any` assertions | 60+ | Bypassing checks |
| `Record<string, any>` | 50+ | Loose typing |

### Top Files Requiring Attention
- `composables/useAnalytics.ts` - API responses cast to any
- `stores/cart/persistence.ts` - 12+ any types
- `composables/useTestingDashboard.ts` - 10+ untyped responses
- `types/database.ts:69` - `attributes?: Record<string, any>`

### Positive Findings
- Well-organized types in `/types/` directory
- Good type guards in `types/guards.ts`
- Branded types and discriminated unions used

### Recommended Actions
1. Replace `catch (error: any)` with `catch (error: unknown)` pattern
2. Create typed API response interfaces
3. Define proper `ProductAttributes` interface
4. Add explicit return types to composable functions

---

## 7. Code Quality Audit

### Grade: B

### Security Findings
- **Strong:** CSP headers, Stripe webhook verification, MFA enforcement
- **Concern:** Non-timing-safe CSRF comparison, eval() in test fixtures

### Performance Findings
- **Good:** Bundle splitting, no N+1 queries found, proper caching
- **Good:** Pagination with limits against DoS

### i18n Compliance
| Locale | Keys | Status |
|--------|------|--------|
| English (en) | ~1800 | Complete |
| Spanish (es) | ~1800 | Complete |
| Romanian (ro) | ~1100 | Missing 700+ |
| Russian (ru) | ~1100 | Missing 700+ |

### Technical Debt
- 47+ TODO comments in production code
- Many admin tests excluded from test suite

---

## Action Plan

### Week 1: Critical Security & Accessibility

1. Fix non-timing-safe CSRF comparison
2. Remove eval() from test fixtures
3. Add DialogDescription to all dialogs
4. Refactor custom modals to use Reka UI

### Week 2: Nuxt 4 Compliance

1. Replace `event.context.params` with `getRouterParam()`
2. Replace `window.location.origin` with `useRequestURL().origin`
3. Add Zod validation to API routes
4. Rename generic `[id]` params

### Week 3-4: Type Safety & Design

1. Create typed API response interfaces
2. Replace 150+ `: any` with proper types
3. Remove 93 gradient usages
4. Complete Romanian and Russian translations

### Week 5-12: Architecture Refactoring (Optional)

1. Introduce use case layer
2. Implement repository pattern
3. Create domain entities with business behavior
4. Abstract payment gateway

---

## Files Index

### Critical Priority
```
server/utils/cartSecurity.ts                              # CSRF timing attack
server/api/admin/orders/[id]/notes.post.ts                # Deprecated params
server/api/admin/orders/[id]/fulfillment-tasks/*.ts       # Deprecated params
pages/auth/login.vue                                       # window.origin
pages/auth/register.vue                                    # window.origin
pages/auth/verification-pending.vue                        # window.origin
pages/auth/verify-email.vue                                # window.origin
components/profile/AddressFormModal.vue                    # Custom modal
components/profile/DeleteAccountModal.vue                  # Custom modal
components/custom/Tooltip.vue                              # ARIA missing
```

### High Priority
```
components/checkout/PaymentForm.vue                        # 853 lines, split
components/checkout/HybridCheckout.vue                     # 993 lines, split
server/api/orders/create.post.ts                           # Fat controller
server/api/checkout/confirm-payment.post.ts                # Fat controller
composables/useCart.ts                                      # Missing readonly
composables/useAnalytics.ts                                 # Type safety
pages/wine-story.vue                                        # 15 gradients
i18n/locales/ro.json                                        # 700+ missing keys
i18n/locales/ru.json                                        # 700+ missing keys
```

---

## Conclusion

The Moldova Direct codebase is **functional and well-organized** at the surface level, with good UI component patterns and proper SSR handling. However, it has **significant architectural debt** that will impede future scalability and maintainability.

**Immediate Focus:** Security fixes and accessibility compliance (Weeks 1-2)
**Short Term:** Type safety and design cleanup (Weeks 3-4)
**Long Term:** Consider architectural refactoring if scaling beyond current scope

---

*Report generated by 7 parallel Claude agents using skill-based analysis*
