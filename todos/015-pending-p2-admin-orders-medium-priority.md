---
status: pending
priority: p2
issue_id: "015"
tags: [admin, orders, enhancement, code-quality]
dependencies: []
github_issue: 83
---

# Admin Orders: Medium Priority Improvements

## Problem Statement

Medium-priority improvements from Admin Orders Page review that should be addressed after P0/P1 fixes.

## Findings

**Discovered by:** Admin Orders Page review
**GitHub Issue:** #83

**Issues to Fix:**

### 1. Missing Audit Trail for Bulk Operations
Bulk status updates aren't logged as separate bulk operations (only individual updates logged).

**Fix:** Add `bulk_operations_log` table

### 2. Inefficient Progress Calculation
Fetches all tasks just to count completed ones.

**Fix:** Use SQL COUNT instead of fetching all records

### 3. Missing Database Indexes
```sql
CREATE INDEX idx_order_fulfillment_tasks_order_id ON order_fulfillment_tasks(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### 4. Potential Status Manipulation
Allows transitioning from `shipped` to `cancelled` without additional authorization.

**Fix:** Add status transition validation rules

### 5. Missing Retry Logic for Real-time Subscriptions
When subscription fails, there's no retry logic.

**Fix:** Implement exponential backoff

### 6. Floating Point Arithmetic Issue
`averageOrderValue = totalRevenue / totalOrders` may have precision issues.

**Fix:** Round to 2 decimal places

## Acceptance Criteria

- [ ] All 6 medium-priority improvements completed
- [ ] Database indexes added and verified
- [ ] Performance improvements measurable
- [ ] Tests added for new functionality

## Estimated Effort

3-4 days total

## Resources

- GitHub Issue: #83
- Original PR: #37 (Admin Orders Page)

---
Source: Admin Orders review, synced from GitHub issue #83
