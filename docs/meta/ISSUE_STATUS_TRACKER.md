# Issue Status Tracker - MVP Launch Blockers

**Last Updated:** November 6, 2025 (Auto-updated)
**Milestone:** [MVP Launch Blockers](https://github.com/caraseli02/MoldovaDirect/milestone/1)
**Target Launch:** November 17, 2025

> **⚠️ SINGLE SOURCE OF TRUTH**: This document is the authoritative source for issue status.
> All other documents should reference this file for current status.

---

## 📊 Quick Status Overview

| Category | Total | Fixed | In Progress | Pending | % Complete |
|----------|-------|-------|-------------|---------|------------|
| **P0 - Critical** | 9 | 6 | 0 | 3 | 67% |
| **P1 - High** | 3 | 0 | 0 | 3 | 0% |
| **P2 - Medium** | 0 | 0 | 0 | 0 | 0% |
| **TOTAL** | 12 | 6 | 0 | 6 | 50% |

**Launch Readiness:** 🟡 IN PROGRESS - 3 P0 issues remaining (3-5 hours work)

---

## 🚨 P0 - CRITICAL (Must Fix Before Launch)

### ✅ FIXED Issues (6/9 complete)

#### #159 - Re-enable Authentication Middleware
- **Status:** ✅ FIXED
- **Fixed Date:** November 3, 2025
- **Commit:** `2bb7e2b`
- **Effort:** 30 min
- **Location:** `middleware/auth.ts:16`
- **Verification:** docs/features/authentication/AUTH_MIDDLEWARE_TEST_RESULTS.md
- **Impact:** Protected routes now require authentication
- **Remaining Work:** None

---

#### #89 - Atomic Order + Inventory Transactions
- **Status:** ✅ FIXED
- **Fixed Date:** November 3, 2025
- **Commits:** `951a558`, `50dea93`
- **Effort:** 3-4 hours
- **Location:** `supabase/sql/migrations/20251103141318_create_order_with_inventory_function.sql`
- **Verification:** docs/features/cart/ATOMIC_INVENTORY_FIX.md
- **Impact:** Order creation and inventory updates are now atomic (no race conditions)
- **Remaining Work:** None

---

#### #73 - Missing RBAC in Admin Endpoints
- **Status:** ✅ FIXED
- **Fixed Date:** November 3, 2025
- **Commit:** `ba57e07`
- **Effort:** 1-2 hours
- **Location:** `server/utils/adminAuth.ts`, 31 admin endpoints
- **Verification:** docs/security/ISSUES_73_76_VERIFICATION.md
- **Impact:** All admin endpoints now require admin role (403 Forbidden for non-admins)
- **Remaining Work:** None

---

#### #76 - Hardcoded Credentials in Admin Script
- **Status:** ✅ FIXED
- **Fixed Date:** November 4, 2025
- **Commit:** `95694d2`
- **Effort:** 30-60 min
- **Location:** `scripts/create-admin-user.mjs`, `scripts/generateSecurePassword.mjs`
- **Verification:** docs/security/ISSUES_73_76_VERIFICATION.md
- **Impact:** No more hardcoded passwords; auto-generates 20-char secure passwords
- **Remaining Work:** None

---

#### #86 - Email Template Authorization Missing
- **Status:** ✅ FIXED
- **Fixed Date:** November 2, 2025
- **Commit:** `1c778b1`
- **Effort:** 1-2 hours
- **Location:** `server/api/admin/email-templates/*.ts` (7 endpoints)
- **Impact:** All email template endpoints now require admin role
- **Remaining Work:** None

---

#### #59 - Hardcoded Test Credentials
- **Status:** ✅ FIXED
- **Fixed Date:** November 2, 2025
- **Commit:** `ae7a026`
- **Effort:** 2 hours
- **Location:** `tests/fixtures/base.ts`, `tests/utils/generateSecurePassword.ts`
- **Impact:** Test credentials removed from source code; now use env vars
- **Remaining Work:** None

---

### ⚠️ PENDING Issues (3/9 remaining)

#### #160 - Admin Email Template Authorization
- **Status:** ⚠️ NEEDS VERIFICATION
- **Priority:** P0
- **Effort:** 30 minutes
- **Location:** TBD
- **Notes:** Likely duplicate of #86 which was already fixed
- **Action Required:**
  1. Compare issue descriptions of #160 and #86
  2. Test all 7 email template endpoints
  3. Close #160 if confirmed as duplicate
- **Assignee:** TBD
- **Target Date:** November 7, 2025

---

#### #162 - Test Infrastructure Security Vulnerabilities
- **Status:** ⚠️ PARTIALLY FIXED (Code done, ops pending)
- **Priority:** P0
- **Effort:** 2-3 hours (operational tasks)
- **Location:** `.env.example`, Supabase dashboard, Vercel settings
- **Notes:** Code changes complete, but key rotation requires admin access
- **Completed:**
  - ✅ Removed exposed keys from source code (commit `9e475bf`)
  - ✅ Replaced with placeholders in .env.example
- **Action Required:**
  1. Access Supabase dashboard with admin credentials
  2. Generate new service role key
  3. Update Vercel environment variables with new key
  4. Update local .env files (all team members)
  5. Revoke old exposed key in Supabase
  6. Audit Supabase access logs for unauthorized access
  7. Document new key securely (password manager)
- **Assignee:** Requires Supabase + Vercel admin access
- **Target Date:** November 7, 2025
- **Dependencies:** Admin access to Supabase and Vercel

---

#### #81 - Auth Check Uses Wrong Supabase Client
- **Status:** ⚠️ NEEDS INVESTIGATION
- **Priority:** P1 (was P0, downgraded after #159 fix)
- **Effort:** 1-2 hours
- **Location:** `server/api/admin/orders/bulk.post.ts`, possibly others
- **Notes:** May be using service role client instead of user client for auth
- **Action Required:**
  1. Audit all auth-related server endpoints
  2. Search for `serverSupabaseServiceRole` usage in auth contexts
  3. Verify proper client usage (service vs. anon key)
  4. Ensure no Row Level Security bypasses
  5. Document findings
  6. Fix any incorrect usage
- **Assignee:** TBD
- **Target Date:** November 7, 2025

---

## 📋 P1 - HIGH (Important but not blocking)

### #121 - Implement Cart Locking During Checkout
- **Status:** 🔵 PENDING
- **Priority:** P1
- **Effort:** 3-4 hours
- **Impact:** Prevents cart modifications during checkout
- **Action:** Implement cart lock when checkout starts
- **Decision:** DEFER to post-MVP (not critical for launch)
- **Target Date:** Post-launch

---

### #161 - Implement Stripe Webhook Handling
- **Status:** 🔵 PENDING (DEFERRED)
- **Priority:** P1 (was P0, deferred per MVP strategy)
- **Effort:** 2-3 days
- **Impact:** Cannot process credit card payments without webhooks
- **Decision:** Ship MVP with Cash on Delivery only, add Stripe webhooks post-launch
- **Target Date:** Post-launch (Phase 2)

---

### #163 - Order Status Update Emails
- **Status:** 🔵 PENDING (DEFERRED)
- **Priority:** P1 (was P0, deferred per MVP strategy)
- **Effort:** 2-3 days
- **Impact:** Manual order status updates for first customers
- **Decision:** Order confirmation emails work; defer status updates to post-launch
- **Target Date:** Post-launch (Phase 2)

---

## 📈 Progress Tracking

### Completion by Date

| Date | Issues Fixed | Cumulative | Remaining |
|------|--------------|------------|-----------|
| Nov 2, 2025 | #59, #86 | 2 | 10 |
| Nov 3, 2025 | #159, #73, #89 | 5 | 7 |
| Nov 4, 2025 | #76 | 6 | 6 |
| Nov 5, 2025 | - | 6 | 6 |
| Nov 6, 2025 | Verified #73, #76 | 6 | 6 |
| **Target** | #160, #162, #81 | 9 | 3 |

### Time Remaining

| Task | Estimated | Notes |
|------|-----------|-------|
| #160 verification | 30 min | Likely already fixed as #86 |
| #162 ops tasks | 2-3 hours | Requires admin access coordination |
| #81 investigation | 1-2 hours | May uncover additional work |
| **TOTAL P0 Work** | **3.5-5.5 hours** | Plus coordination time |

---

## 🎯 Launch Criteria

### Must Have (P0) - All Required
- [x] #159 - Authentication enabled
- [x] #89 - Atomic transactions
- [x] #73 - Admin RBAC enforced
- [x] #76 - No hardcoded credentials
- [x] #86 - Email templates protected
- [x] #59 - Test credentials secured
- [ ] #160 - Email template auth verified
- [ ] #162 - Keys rotated
- [ ] #81 - Auth client usage audited

**P0 Status:** 6/9 complete (67%)

### Nice to Have (P1) - Can Defer
- [ ] #121 - Cart locking (defer to post-MVP)
- [ ] #161 - Stripe webhooks (ship COD-only for MVP)
- [ ] #163 - Status emails (ship confirmation-only for MVP)

**P1 Status:** 0/3 complete (0% - all deferred)

---

## 🔄 Update Process

### When Fixing an Issue

1. **Before starting work:**
   - Update status to "🔄 IN PROGRESS"
   - Add assignee name
   - Add start date

2. **After completing work:**
   - Update status to "✅ FIXED"
   - Add commit hash
   - Add fixed date
   - Add verification document link
   - Update "Remaining Work" to "None"

3. **Update dependent documents:**
   - Run `npm run sync-issues` (see ISSUE_SYNC_PROCESS.md)
   - OR manually update:
     - docs/getting-started/MVP_QUICK_START.md
     - docs/meta/MVP_PRIORITY_ORDER.md
     - .kiro/PROJECT_STATUS.md
     - todos/STATUS_UPDATE_*.md

### Preventing Stale Documentation

**DO:**
- ✅ Update this file IMMEDIATELY when issue status changes
- ✅ Reference this file from all planning documents
- ✅ Run sync script after updating this file
- ✅ Verify updates across all documents

**DON'T:**
- ❌ Update issue status in multiple places
- ❌ Assume other documents are current
- ❌ Skip the sync process
- ❌ Forget to update commit hashes and dates

---

## 📍 Related Documents

### Primary References (Update When This Changes)
- [MVP Quick Start Guide](../getting-started/MVP_QUICK_START.md) - Update checklist
- [MVP Priority Order](./MVP_PRIORITY_ORDER.md) - Update status sections
- [Project Status](.kiro/PROJECT_STATUS.md) - Update progress metrics
- [Status Updates](../../todos/STATUS_UPDATE_*.md) - Create new update

### Verification Documents (Create When Issue Fixed)
- [Auth Middleware Test Results](../features/authentication/AUTH_MIDDLEWARE_TEST_RESULTS.md)
- [Atomic Inventory Fix](../features/cart/ATOMIC_INVENTORY_FIX.md)
- [Issues #73 & #76 Verification](../security/ISSUES_73_76_VERIFICATION.md)

### Process Documents
- [Issue Sync Process](./ISSUE_SYNC_PROCESS.md) - How to keep docs in sync
- [MVP Status Update (Nov 6)](./MVP_STATUS_UPDATE_2025-11-06.md) - Latest evaluation

---

## 🔍 Quick Reference

### Check if Issue is Fixed
```bash
# Search for commit that fixed the issue
git log --all --grep="#73" --oneline

# Check if files were modified
git log --all --oneline -- middleware/admin.ts server/utils/adminAuth.ts

# Search verification docs
find docs -name "*.md" -exec grep -l "#73.*FIXED\|#73.*fixed" {} \;
```

### Update This Tracker
```bash
# 1. Edit this file
code docs/meta/ISSUE_STATUS_TRACKER.md

# 2. Update status, dates, commits
# 3. Run sync script
npm run sync-issues  # (if available)

# 4. Commit changes
git add docs/meta/ISSUE_STATUS_TRACKER.md
git commit -m "docs: update issue tracker - mark #XX as fixed"
```

---

## 📞 Contacts

**Issue Tracker Maintainer:** Development team
**Supabase Admin Access:** Team lead
**Vercel Admin Access:** Team lead
**GitHub Admin Access:** Repository owner

---

**Last Verified:** November 6, 2025
**Next Review:** November 7, 2025 (after completing #160, #162, #81)

---

## 🏷️ Status Legend

- ✅ **FIXED** - Issue resolved and verified
- 🔄 **IN PROGRESS** - Currently being worked on
- ⚠️ **NEEDS VERIFICATION** - May be fixed, needs confirmation
- ⚠️ **PARTIALLY FIXED** - Some work done, more required
- ⚠️ **NEEDS INVESTIGATION** - Status unknown, requires audit
- 🔵 **PENDING** - Not started yet
- 🔵 **DEFERRED** - Intentionally postponed to post-MVP

---

**END OF ISSUE STATUS TRACKER**
