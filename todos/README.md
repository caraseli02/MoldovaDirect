# E2E Test Infrastructure Review - Todo Items

**Review Date:** 2025-11-01
**Review Command:** `/compounding-engineering:review e2e tests setup files`
**Total Findings:** 6 critical issues

## Overview

Comprehensive review of the e2e test infrastructure revealed significant issues with the test setup, including critical security vulnerabilities, over-engineering, and anti-patterns.

**Key Discovery:** Extensive test infrastructure exists (1,300+ lines) but **ZERO actual e2e test spec files** have been written.

---

## Priority Breakdown

### 🔴 P0 - Critical (Fix Immediately)

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| [001](001-pending-p0-rotate-exposed-supabase-service-key.md) | Exposed Supabase Service Key | **CRITICAL SECURITY RISK** - Full database access exposed | 30 min |
| [002](002-pending-p0-remove-hardcoded-test-credentials.md) | Hardcoded Test Credentials | **HIGH SECURITY RISK** - Potential backdoor accounts | 1 hour |

**Total P0 Effort:** ~1.5 hours
**Action Required:** Address today before any other work

---

### 🟠 P1 - High Priority (Fix This Week)

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| [003](003-pending-p1-fix-global-setup-authentication.md) | No Actual Authentication in Global Setup | Tests using empty auth states, defeats purpose | 2-3 hours |
| [004](004-pending-p1-remove-hardcoded-spanish-text.md) | Hardcoded Spanish Text | Multi-locale testing completely broken | 2-3 hours |
| [005](005-pending-p1-eliminate-waitfortimeout-antipattern.md) | waitForTimeout Anti-Pattern (7 instances) | Slow, flaky tests - 60-70% slower than needed | 4-5 hours |

**Total P1 Effort:** ~10-11 hours (2-3 days)
**Impact:** Fixes functionality and performance issues

---

### 🟡 P2 - Medium Priority (Fix Next Week)

| ID | Issue | Impact | Effort |
|----|-------|--------|--------|
| [006](006-pending-p2-simplify-test-infrastructure.md) | Over-Engineered Infrastructure | 1,300+ lines of unused code, high maintenance burden | 1-2 hours to delete,<br>ongoing to rebuild |

**Total P2 Effort:** Varies by approach chosen
**Impact:** Simplification and maintainability

---

## Quick Start Workflow

### Day 1: Security (P0)
```bash
# 1. Rotate Supabase key (001)
# 2. Remove hardcoded credentials (002)
# 3. Verify no test accounts in production
git commit -m "security: fix exposed credentials"
```

### Day 2-3: Functionality (P1)
```bash
# 4. Fix global setup authentication (003)
# 5. Remove hardcoded Spanish text (004)
git commit -m "fix: test infrastructure issues"
```

### Day 4: Performance (P1)
```bash
# 6. Eliminate waitForTimeout anti-patterns (005)
git commit -m "perf: replace arbitrary waits with assertions"
```

### Day 5: Simplification (P2)
```bash
# 7. Simplify infrastructure (006)
# 8. Write first 3 actual tests
git commit -m "refactor: simplify test infrastructure"
```

---

## Metrics

### Before Fix
- **Security Issues:** 2 critical
- **Functionality Issues:** 3 high priority
- **Test Speed:** 60-70% slower than optimal
- **Code Complexity:** 1,300+ unused lines
- **Test Files:** 0 e2e spec files

### After Fix (Target)
- **Security Issues:** 0
- **Functionality Issues:** 0
- **Test Speed:** Optimal
- **Code Complexity:** ~100 lines infrastructure
- **Test Files:** 3-5 working e2e specs

---

## Dependencies

```
001 (P0) ──┐
           ├──> 003 (P1) ──┐
002 (P0) ──┘               ├──> 006 (P2)
                           │
004 (P1) ──────────────────┤
005 (P1) ──────────────────┘
```

**Recommendation:** Fix in order 001 → 002 → 003 → 004 → 005 → 006

---

## Test Infrastructure Issues Summary

### What Works ✅
- Vitest unit tests (4 composable tests pass)
- Good TypeScript type safety
- Consistent data-testid strategy (80%)
- Well-organized file structure

### What's Broken ❌
- Zero e2e test spec files exist
- Global setup doesn't authenticate
- Multi-locale testing broken (hardcoded Spanish)
- 7 waitForTimeout anti-patterns
- 1,300+ lines of unused infrastructure

### Security Risks 🔴
- Exposed Supabase service key (full DB access)
- Hardcoded test credentials
- Unprotected test API endpoints (if implemented)

---

## Recommended Approach

**Option 1: Radical Simplification (Recommended)**
1. Fix P0 security issues immediately
2. Create backup branch of current infrastructure
3. Delete ~95% of infrastructure
4. Simplify playwright.config.ts to ~50 lines
5. Write 3-5 simple test specs
6. Extract helpers only when duplicating code 3+ times

**Benefits:**
- 95% LOC reduction
- Faster to write first tests
- Build correct abstractions from actual usage
- Immediate clarity on what's needed

**Option 2: Incremental Cleanup**
1. Fix all P0 and P1 issues
2. Keep existing infrastructure
3. Write tests to use existing helpers
4. Delete unused parts gradually

**Benefits:**
- Less disruptive
- Preserves some work
- Gradual learning curve

**We recommend Option 1** for this project.

---

## Next Steps

1. **Read** each todo file in priority order
2. **Fix** P0 issues today (001, 002)
3. **Fix** P1 issues this week (003, 004, 005)
4. **Decide** on simplification approach (006)
5. **Write** your first 3 e2e tests
6. **Extract** helpers only when you need them

---

## Resources

- Full review report: (parent directory with all agent outputs)
- Playwright docs: https://playwright.dev
- Testing best practices: https://playwright.dev/docs/best-practices
- YAGNI principle: https://martinfowler.com/bliki/Yagni.html

---

## Questions?

Contact the reviewer or read the detailed findings in each todo file.

**Generated by:** Claude Code Review System
**Command:** `/compounding-engineering:review e2e tests setup files`
**Date:** 2025-11-01
