# MVP Launch Priority Order

**Created:** 2025-11-03
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

## 📊 Current Status

**Overall Completeness:** 70%
**Can Ship Today:** ❌ NO - Critical security blockers
**Time to MVP:** 2 weeks with focused effort

### What Works
- Product browsing and search
- Shopping cart (feature-complete)
- Multi-language support
- Dark/light theme
- Admin dashboard
- Order management basics
- Cash on delivery payments ✅

### What Blocks Launch
- Authentication disabled (P0)
- Admin authorization missing (P0)
- Payment webhooks missing (P0)
- Transaction safety missing (P0)
- Test credentials exposed (P0)

---

## 🚨 WEEK 1: Security & Data Integrity (P0 - BLOCKING)

**Goal:** Make the app secure and prevent data corruption

### Day 1-2: Authentication & Authorization (4 issues)

**Issue #159** - Re-enable Authentication Middleware
- **Priority:** P0 - CRITICAL
- **Effort:** 30 min - 1 hour
- **Why:** Auth is currently completely disabled
- **Impact:** ALL routes accessible without login
- **File:** `middleware/auth.ts:16`

**Issue #160** - Admin Email Template Authorization
- **Priority:** P0 - CRITICAL
- **Effort:** 1-2 hours
- **Why:** ANY user can modify system email templates
- **Impact:** Security + brand reputation risk
- **Files:** `server/api/admin/email-templates/*.ts` (4 files)

**Issue #73** - Missing RBAC in Admin Endpoints
- **Priority:** P0 - CRITICAL
- **Effort:** 1-2 hours
- **Why:** Any authenticated user can access admin pages
- **Impact:** Customers can view/modify all orders
- **File:** `server/utils/adminAuth.ts:20-47`

**Issue #81** - Auth Check Uses Wrong Supabase Client
- **Priority:** P1 - HIGH
- **Effort:** 1-2 hours
- **Why:** Service role client has no user session
- **Impact:** Auth checks don't work properly
- **File:** `server/api/admin/orders/bulk.post.ts`

**Total Day 1-2:** ~6-8 hours

---

### Day 3: Test Infrastructure Security (2 issues)

**Issue #162** - Test Infrastructure Security Vulnerabilities
- **Priority:** P0 - CRITICAL
- **Effort:** 2-3 hours
- **Why:** Exposed Supabase service key + hardcoded credentials
- **Impact:** Full database access compromised
- **Action:** Rotate keys, remove hardcoded passwords

**Issue #76** - Hardcoded Credentials in Admin Script
- **Priority:** P0 - CRITICAL
- **Effort:** 30 min - 1 hour
- **Why:** Weak passwords hardcoded in scripts
- **Impact:** Known admin credentials in code
- **File:** `scripts/create-admin-user.mjs:122-143`

**Total Day 3:** ~3-4 hours

---

### Day 4: Data Integrity (1 issue)

**Issue #89** - No Transaction for Order + Inventory
- **Priority:** P0 - CRITICAL
- **Effort:** 3-4 hours
- **Why:** Order and inventory are separate API calls
- **Impact:** Data corruption, overselling risk
- **Action:** Implement atomic database transaction
- **Files:** `server/api/checkout/create-order.post.ts`, `server/api/checkout/update-inventory.post.ts`

**Related Issues:**
- #74 - Race Condition in Inventory Updates
- #75 - Duplicate Inventory Deductions
- #77 - Missing Transaction Wrapping

**Total Day 4:** ~4 hours

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
