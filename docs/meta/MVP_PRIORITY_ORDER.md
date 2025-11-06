# MVP Launch Priority Order

**Created:** 2025-11-03
**Last Updated:** 2025-11-06
**Status Tracker:** [ISSUE_STATUS_TRACKER.md](./ISSUE_STATUS_TRACKER.md) ← **Single Source of Truth**
**Milestone:** [MVP Launch Blockers](https://github.com/caraseli02/MoldovaDirect/milestone/1)
**Target Launch:** 2 weeks (November 17, 2025)

## 🎯 MVP Philosophy

**Ship with rock-solid core features, not a hundred half-working features.**

Focus on:
- ✅ Security first - No vulnerabilities
- ✅ Data integrity - No corruption/overselling
- ✅ Core user flow - Browse → Cart → Checkout → Pay → Confirm
- ❌ Advanced features - Defer everything else

---

## 📊 Current Status (Updated Nov 6, 2025)

**Overall Completeness:** 85-90% ✅
**Can Ship Today:** ⚠️ NO - 3 P0 items remaining (3-5 hours work)
**Time to MVP:** 5-7 days with focused effort

### ✅ What Works (Recently Fixed!)
- Product browsing and search ✅
- Shopping cart (feature-complete) ✅
- **Authentication enabled** ✅ (Fixed Nov 3)
- **Admin RBAC enforced** ✅ (Fixed Nov 3)
- **Atomic transactions** ✅ (Fixed Nov 3)
- **No hardcoded credentials** ✅ (Fixed Nov 4)
- Multi-language support ✅
- Dark/light theme ✅
- Admin dashboard ✅
- Order management basics ✅
- Cash on delivery payments ✅

### ⚠️ What Still Blocks Launch (3-5 hours)
- #160 - Email template auth verification (30 min - likely already fixed)
- #162 - Key rotation (2-3 hours - operational task)
- #81 - Supabase client audit (1-2 hours - investigation)

---

## ✅ RECENTLY COMPLETED (Nov 2-4, 2025)

**Great progress! 6 out of 9 P0 issues fixed in 3 days:**

### ✅ Issue #159 - Re-enable Authentication Middleware
- **Status:** FIXED (Nov 3, 2025)
- **Commit:** `2bb7e2b`
- **Verification:** docs/features/authentication/AUTH_MIDDLEWARE_TEST_RESULTS.md
- **Impact:** All protected routes now require authentication ✅

### ✅ Issue #89 - Atomic Order + Inventory Transactions
- **Status:** FIXED (Nov 3, 2025)
- **Commits:** `951a558`, `50dea93`
- **Verification:** docs/features/cart/ATOMIC_INVENTORY_FIX.md
- **Impact:** Prevents race conditions and data corruption ✅

### ✅ Issue #73 - Missing RBAC in Admin Endpoints
- **Status:** FIXED (Nov 3, 2025)
- **Commit:** `ba57e07`
- **Verification:** docs/security/ISSUES_73_76_VERIFICATION.md
- **Impact:** All 31 admin endpoints now require admin role ✅

### ✅ Issue #76 - Hardcoded Credentials in Admin Script
- **Status:** FIXED (Nov 4, 2025)
- **Commit:** `95694d2`
- **Verification:** docs/security/ISSUES_73_76_VERIFICATION.md
- **Impact:** Auto-generated secure passwords (20 chars) ✅

### ✅ Issue #86 - Email Template Authorization Missing
- **Status:** FIXED (Nov 2, 2025)
- **Commit:** `1c778b1`
- **Impact:** All 7 email template endpoints protected ✅

### ✅ Issue #59 - Hardcoded Test Credentials
- **Status:** FIXED (Nov 2, 2025)
- **Commit:** `ae7a026`
- **Impact:** Test credentials secured ✅

---

## ⚠️ REMAINING WORK: Security & Verification (3-5 hours)

**Goal:** Complete final security items and verification

### Issue #160 - Admin Email Template Authorization
- **Priority:** P0 - CRITICAL (needs verification)
- **Effort:** 30 minutes
- **Status:** ⚠️ NEEDS VERIFICATION (likely duplicate of #86)
- **Action Required:**
  1. Compare #160 and #86 issue descriptions
  2. Test all 7 email template endpoints with non-admin user
  3. Close #160 if confirmed as duplicate

---

### Issue #162 - Test Infrastructure Security Vulnerabilities
- **Priority:** P0 - CRITICAL
- **Effort:** 2-3 hours (operational tasks)
- **Status:** ⚠️ PARTIALLY FIXED (code done, ops pending)
- **Completed:**
  - ✅ Removed exposed keys from code (commit `9e475bf`)
  - ✅ Replaced with placeholders
- **Action Required:**
  1. Access Supabase dashboard with admin credentials
  2. Generate new service role key
  3. Update Vercel environment variables
  4. Update local .env files (all team members)
  5. Revoke old exposed key
  6. Audit Supabase access logs
- **Dependencies:** Requires Supabase + Vercel admin access

---

### Issue #81 - Auth Check Uses Wrong Supabase Client
- **Priority:** P1 - HIGH
- **Effort:** 1-2 hours
- **Status:** ⚠️ NEEDS INVESTIGATION
- **Files:** `server/api/admin/orders/bulk.post.ts`, possibly others
- **Action Required:**
  1. Audit all auth-related server endpoints
  2. Search for `serverSupabaseServiceRole` usage in auth contexts
  3. Verify proper client usage (service vs. anon key)
  4. Ensure no Row Level Security bypasses
  5. Document findings and fix any issues

**Total Remaining Work:** ~3-5 hours + coordination time

---

### Day 5: Payment Webhooks (1 issue)

**Issue #161** - Implement Stripe Webhook Handling
- **Priority:** P0 - CRITICAL (or defer for COD-only MVP)
- **Effort:** 2-3 days
- **Why:** Cannot process credit card payments without webhooks
- **Impact:** Payments incomplete, no async handling
- **Action:** Create webhook endpoint, handle success/failure events

**MVP Decision Point:**
- **Option A:** Ship with Cash on Delivery only → Skip this issue for Week 1
- **Option B:** Need credit cards → Implement webhooks (takes 2-3 days)

**Recommendation:** Ship COD-only for MVP, add cards post-launch

**Total Day 5:** Skip if COD-only, or 2-3 days if implementing

---

## ✅ WEEK 2: Polish & Launch Prep (P1 - HIGH)

### Day 6-7: Cart & Checkout Polish (2 issues)

**Issue #121** - Implement Cart Locking During Checkout
- **Priority:** P1 - HIGH
- **Effort:** 3-4 hours
- **Why:** Cart can be modified during checkout
- **Impact:** Order inconsistencies
- **Action:** Lock cart when checkout starts

**Issue #124** - Fix Cart-Checkout Race Conditions
- **Priority:** P1 - HIGH
- **Effort:** 2-3 hours
- **Why:** Rapid cart changes trigger multiple calculations
- **Impact:** Stale totals, race conditions
- **Action:** Add debouncing to cart watchers

**Total Day 6-7:** ~6-7 hours

---

### Day 8: Email Notifications (1 issue)

**Issue #163** - Complete Order Status Update Emails
- **Priority:** P1 - HIGH (but can ship without this)
- **Effort:** 2-3 days
- **Why:** Customer communication incomplete
- **Impact:** Manual email follow-up required
- **Files:** `server/api/orders/[id]/support.post.ts`, `server/utils/orderEmails.ts`

**MVP Decision Point:**
- **Option A:** Order confirmation works → Ship with manual follow-ups
- **Option B:** Complete all status emails → Add 2-3 days

**Recommendation:** Ship with confirmation only, add status emails post-MVP

**Total Day 8:** Skip for MVP or 2-3 days if implementing

---

### Day 9-10: Testing & Deployment

**End-to-End Testing**
- Test complete user flow: Browse → Cart → Checkout → Pay → Email
- Test admin flow: Login → Manage products → View orders
- Security testing: Verify auth, RBAC, data integrity
- Payment testing: Cash on delivery works, Stripe test mode (if implemented)

**Production Deployment**
- Set up production environment variables
- Configure Stripe production keys (if using)
- Set up email sending (Resend production)
- Deploy to Vercel
- Configure custom domain
- Set up error monitoring (Sentry recommended)

**Launch Checklist**
- [ ] All P0 issues resolved
- [ ] Security audit complete
- [ ] End-to-end tests pass
- [ ] Production credentials configured
- [ ] Error monitoring active
- [ ] Backup strategy in place
- [ ] Support email/phone ready

**Total Day 9-10:** 2 days

---

## ❌ EXPLICITLY DEFER (Do NOT Work On These)

These issues are valid but NOT required for MVP launch:

### UX Enhancements (Nice-to-Have)
- #154 - Separate journal/blog section
- #153 - Dark mode accessibility audit
- #152 - Dynamic shipping calculation (use flat rate)
- #151 - Address management page (collect once)
- #150 - Review sorting options
- #149 - Advanced shop filters
- #148 - Skeleton loaders
- #147 - FAQ/shipping pages
- #137 - Order summary snapshots
- #136 - Virtual scrolling
- #135 - Standardize button components
- #122 - Recently viewed products
- #117 - Stock notifications
- #116 - Product image zoom
- #115 - Refactor product listing
- #111 - Structured data/SEO
- #110 - URL state management for filters
- #109 - Request cancellation for search
- #108 - Search performance optimization
- #105 - Wishlist functionality

### Admin Enhancements
- Admin analytics dashboard (#83, #84)
- CSV/Excel exports
- Advanced reporting
- Low stock alerts

### Performance Optimizations
- #128 - Cart performance optimization
- #112 - Debounce price range calls
- #118 - Combine duplicate watchers
- Bundle size optimization
- PWA/offline improvements

### Testing Infrastructure
- #144 - Project Automation Testing
- #143 - Test Project Automation
- #119 - Cart test coverage (nice to have)
- #120 - Checkout test coverage (do after P0 fixes)
- #101 - Product detail test coverage
- #100 - Product listing test coverage

### Code Quality
- #125 - Checkout type safety (P1 but not blocking)
- #114 - Remove TypeScript any
- #134 - Remove mock data
- #133 - Translation keys
- #132 - Component coupling
- #131 - Cart clearing retry
- #130 - Error display component
- #129 - Centralize currency formatting
- #127 - Standardize error handling

### Accessibility
- #153 - Dark mode contrast
- #126 - Checkout accessibility
- #123 - Cart accessibility
- #107 - Product detail a11y
- #106 - Product listing a11y

---

## 📋 MVP Success Criteria

After Week 2, you should be able to:

### Customer Flow (Must Work)
1. ✅ Browse products without login
2. ✅ Add products to cart
3. ✅ Checkout with guest or account
4. ✅ Pay with cash on delivery
5. ✅ Receive order confirmation email
6. ✅ View order status

### Admin Flow (Must Work)
1. ✅ Login with admin credentials
2. ✅ View all orders
3. ✅ Update order status
4. ✅ Manage products
5. ✅ Update inventory
6. ✅ View basic analytics

### Security (Must Be True)
1. ✅ Authentication works on all protected routes
2. ✅ Only admins can access admin pages
3. ✅ No exposed credentials in code
4. ✅ All keys rotated and secure
5. ✅ RBAC properly enforced

### Data Integrity (Must Be True)
1. ✅ Orders and inventory update atomically
2. ✅ No race conditions on concurrent orders
3. ✅ No overselling possible
4. ✅ Transaction rollback works on failure

### Launch Metrics
- **Target:** 10 real orders completed successfully
- **Target:** Zero critical bugs reported
- **Target:** Payment processing reliable (COD)
- **Target:** All customers receive confirmations

---

## 🛠 Work Strategy

### Principles
1. **Fix P0 issues first** - No exceptions
2. **Ship with less features** - Not more
3. **Manual workarounds OK** - For non-core features
4. **Test each fix immediately** - Don't batch testing
5. **One issue at a time** - Complete before starting next

### Daily Workflow
- Morning: Pick highest priority issue
- Implement and test thoroughly
- Commit with clear message
- Update issue status
- Move to next issue

### When Stuck
- Ask for help after 30 minutes
- Document the blocker in issue
- Move to next issue if blocked
- Return when unblocked

---

## 📈 Post-MVP Roadmap

After successful MVP launch with 10+ orders:

### Week 3-4: Based on User Feedback
- Gather actual user feedback
- Prioritize based on real customer needs
- Add most-requested features first

### Likely Next Steps
1. Stripe credit card payments (if needed)
2. Order status update emails
3. Basic analytics for business decisions
4. Search performance (if complaints)
5. Most-requested UX improvements

### Don't Add Unless Requested
- Blog section
- Advanced filters
- Wishlist
- Social features
- Mobile app
- Multiple payment methods

---

## 🎯 Bottom Line

**2 Weeks to MVP:**
- **Week 1:** Fix all security and data integrity issues (P0)
- **Week 2:** Polish checkout, test, deploy

**Ship with:**
- ✅ Secure authentication
- ✅ Safe data handling
- ✅ Cash on delivery payments
- ✅ Basic order management
- ✅ Order confirmation emails

**Ship without:**
- ❌ Credit card payments (add later)
- ❌ Advanced filters
- ❌ Admin analytics
- ❌ Status update emails (manual for now)
- ❌ Perfect UX polish

**The goal is to validate your business idea, not build the perfect e-commerce platform.**

---

## 📞 Questions?

If you're unsure whether to work on something, ask:
1. **Is this blocking launch?** → If no, defer it
2. **Is this a security issue?** → If yes, prioritize it
3. **Can customers still buy products without it?** → If yes, defer it
4. **Can we do this manually for the first 10 orders?** → If yes, defer it

**When in doubt, ship less features with higher quality.**

---

**View Progress:** [MVP Launch Blockers Milestone](https://github.com/caraseli02/MoldovaDirect/milestone/1)
