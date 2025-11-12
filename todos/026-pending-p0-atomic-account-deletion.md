---
status: pending
priority: p0
issue_id: "026"
tags: [security, critical, data-integrity, gdpr, compliance, database]
dependencies: []
github_issue: 225
---

# 🚨 CRITICAL: Non-Atomic Account Deletion Violates GDPR

## Problem Statement

Account deletion performs **7 sequential database operations** without transaction safety. If any step fails mid-process, the user account may be deleted while orphaned PII remains in the database, violating GDPR Article 17 (Right to Erasure).

**Location:** `/server/api/auth/delete-account.delete.ts` (Lines 69-188)

## Findings

**Discovered by:** Data Integrity Guardian + Security Sentinel (multi-agent code review)
**GitHub Issue:** #225
**Review date:** 2025-11-12

**Vulnerable Code Pattern:**
```typescript
// Current implementation - NOT ATOMIC (Lines 69-188)
export default defineEventHandler(async (event) => {
  // ... auth checks ...

  // ❌ Sequential operations without transaction wrapper
  // Step 1
  const { error: addressError } = await supabase
    .from('addresses')
    .delete()
    .eq('user_id', user.id)

  // Step 2
  const { error: cartError } = await supabase
    .from('carts')
    .delete()
    .eq('user_id', user.id)

  // Step 3 - Order anonymization
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      user_id: null,
      customer_notes: body.reason ? `Account deleted: ${body.reason}` : 'Account deleted',
      shipping_address: { deleted: true },
      billing_address: { deleted: true }
    })
    .eq('user_id', user.id)

  // Step 4
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)

  // Step 5
  const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

  // If ANY step fails between steps, partial deletion occurs!
})
```

**Data Corruption Scenario:**

```
Timeline of Account Deletion Failure:

T+0s:  User clicks "Delete My Account"
T+1s:  API receives request, validates user
T+2s:  DELETE FROM addresses ✅ Success (5 addresses deleted)
T+3s:  DELETE FROM carts ✅ Success (1 cart deleted)
T+4s:  UPDATE orders SET user_id = NULL... ❌ NETWORK TIMEOUT
       (Database connection lost, operation fails)
T+5s:  Code continues to next step (no transaction rollback)
T+6s:  DELETE FROM profiles ✅ Success (profile deleted)
T+7s:  DELETE FROM auth.users ✅ Success (auth account deleted)

Result:
  ✅ Addresses: DELETED
  ✅ Carts: DELETED
  ❌ Orders: STILL CONTAIN PII (shipping address, email, phone)
  ✅ Profile: DELETED
  ✅ Auth: DELETED

User cannot retry deletion (account no longer exists)
Orders table contains orphaned PII ← GDPR VIOLATION
```

## Impact

### GDPR Compliance Impact (CRITICAL)

**Article 17 Violation - Right to Erasure:**
- User PII remains in `orders` table:
  - Shipping address (name, street, city, postal code)
  - Billing address
  - Email address
  - Phone number
  - IP address (if logged)

**Regulatory Penalties:**
- **Maximum fine:** €20 million OR 4% of annual global revenue (whichever is higher)
- **Supervisory authority sanctions**
- **Mandatory breach notification** (if PII exposed)

**Example Calculation:**
- Annual revenue: €1M
- 4% of revenue: €40,000
- Typical first-time violation fine: €10,000 - €50,000

### Data Integrity Impact

**Orphaned Data:**
```sql
-- After failed deletion, database contains:

-- ✅ Deleted (good)
SELECT * FROM addresses WHERE user_id = '<deleted-user>';
-- Result: 0 rows

SELECT * FROM carts WHERE user_id = '<deleted-user>';
-- Result: 0 rows

-- ❌ Still exists (PROBLEM)
SELECT * FROM orders WHERE user_id IS NULL
  AND shipping_address->>'firstName' = 'John Doe';
-- Result: 3 orders with full PII
```

**Impossible to Retry:**
- User account deleted from Auth
- User cannot log in to retry
- No programmatic way to identify which failed deletions
- Manual database cleanup required

### Business Impact

**Compliance:**
- Cannot pass GDPR audits
- Risk of customer complaints to data protection authorities
- Potential lawsuit from affected users

**Operational:**
- Manual intervention required for each failure
- Database cleanup complexity
- Support ticket overhead

**Reputational:**
- Trust damage if discovered
- Negative press if reported
- Customer churn

## Proposed Solutions

### Option 1: Database Stored Procedure (RECOMMENDED)

**Pattern:** Use same atomic transaction pattern as `create_order_with_inventory` (which already works correctly)

```sql
-- supabase/sql/migrations/YYYYMMDD_atomic_account_deletion.sql

-- Step 1: Create audit table
CREATE TABLE IF NOT EXISTS account_deletion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  reason TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_by TEXT, -- 'user' or 'admin'
  ip_address TEXT,
  data_snapshot JSONB -- Store anonymized snapshot for audit
);

CREATE INDEX idx_account_deletion_logs_user_id ON account_deletion_logs(user_id);
CREATE INDEX idx_account_deletion_logs_deleted_at ON account_deletion_logs(deleted_at);

-- Step 2: Create atomic deletion function
CREATE OR REPLACE FUNCTION delete_user_account_atomic(
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_deleted_by TEXT DEFAULT 'user',
  p_ip_address TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_profile JSONB;
  v_addresses_count INT;
  v_orders_count INT;
  v_carts_count INT;
BEGIN
  -- Capture data for audit log (before deletion)
  SELECT jsonb_build_object(
    'email', email,
    'role', role,
    'created_at', created_at
  ) INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  -- Get counts for audit
  SELECT COUNT(*) INTO v_addresses_count FROM addresses WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_orders_count FROM orders WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_carts_count FROM carts WHERE user_id = p_user_id;

  -- All operations in single transaction (automatic rollback on error)

  -- 1. Delete addresses
  DELETE FROM addresses WHERE user_id = p_user_id;

  -- 2. Delete carts
  DELETE FROM carts WHERE user_id = p_user_id;

  -- 3. Anonymize orders (keep for accounting/tax compliance)
  UPDATE orders
  SET
    user_id = NULL,
    customer_notes = CASE
      WHEN customer_notes IS NULL THEN '[Account Deleted]'
      ELSE customer_notes || ' [Account Deleted]'
    END,
    -- Anonymize shipping address
    shipping_address = jsonb_build_object(
      'deleted', true,
      'deletedAt', NOW()::text
    ),
    -- Anonymize billing address
    billing_address = jsonb_build_object(
      'deleted', true,
      'deletedAt', NOW()::text
    ),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 4. Delete profile
  DELETE FROM profiles WHERE id = p_user_id;

  -- 5. Create audit log
  INSERT INTO account_deletion_logs (
    user_id,
    reason,
    deleted_by,
    ip_address,
    data_snapshot
  ) VALUES (
    p_user_id,
    p_reason,
    p_deleted_by,
    p_ip_address,
    jsonb_build_object(
      'profile', v_profile,
      'counts', jsonb_build_object(
        'addresses', v_addresses_count,
        'orders', v_orders_count,
        'carts', v_carts_count
      ),
      'deleted_at', NOW()
    )
  );

  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'deleted_records', jsonb_build_object(
      'addresses', v_addresses_count,
      'orders', v_orders_count,
      'carts', v_carts_count,
      'profile', 1
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Automatic rollback on ANY error
    RAISE EXCEPTION 'Account deletion failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_user_account_atomic TO authenticated;
```

**Updated API Endpoint:**
```typescript
// server/api/auth/delete-account.delete.ts
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const supabase = await serverSupabaseServiceRole(event)

  try {
    // ✅ Atomic database cleanup using stored procedure
    const { data, error: dbError } = await supabase.rpc('delete_user_account_atomic', {
      p_user_id: user.id,
      p_reason: body.reason || 'User requested account deletion',
      p_deleted_by: 'user',
      p_ip_address: getRequestIP(event)
    })

    if (dbError) {
      console.error('[Account Deletion] Database cleanup failed:', dbError)
      throw createError({
        statusCode: 500,
        message: 'Account deletion failed. Please try again or contact support.'
      })
    }

    // Only delete from Auth AFTER successful database cleanup
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

    if (authError) {
      // Critical: DB cleaned but Auth deletion failed
      // User can still retry since account exists
      console.error('[Account Deletion] Auth deletion failed after DB cleanup:', authError)
      throw createError({
        statusCode: 500,
        message: 'Account deletion partially completed. Please try again.'
      })
    }

    return {
      success: true,
      message: 'Account successfully deleted',
      deleted: data.deleted_records
    }

  } catch (error) {
    // Log for debugging
    console.error('[Account Deletion] Error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Account deletion failed'
    })
  }
})
```

**Pros:**
- ✅ **All-or-nothing** - No partial deletions possible
- ✅ **Automatic rollback** on ANY error
- ✅ **Audit trail** with deletion logs
- ✅ **Follows existing pattern** (create_order_with_inventory)
- ✅ **GDPR compliant** - Guaranteed PII removal or complete failure
- ✅ **Testable** - Can simulate failures and verify rollback

**Cons:**
- Requires database migration
- Slightly more complex than sequential operations

**Effort:** Medium (4-5 hours)
**Risk:** Very Low (proven pattern already in use)

---

### Option 2: Application-Level Transaction (NOT RECOMMENDED)

Use Supabase transactions in application code:

```typescript
// Not ideal - transactions in app code are less reliable
const { error } = await supabase.rpc('begin_transaction')
try {
  // ... all operations
  await supabase.rpc('commit_transaction')
} catch {
  await supabase.rpc('rollback_transaction')
}
```

**Pros:**
- No database migration needed

**Cons:**
- ❌ Less reliable than database-level transactions
- ❌ Network failures can still cause partial state
- ❌ More complex error handling
- ❌ Not following project's established pattern

**Effort:** Medium (3 hours)
**Risk:** Medium (less reliable)

## Recommended Action

**IMPLEMENT OPTION 1 (Database Stored Procedure)**

### Implementation Plan

**Week 1 - Day 1 (2 hours): Create Migration**

```bash
# 1. Create migration file
cd supabase/sql/migrations
touch $(date +%Y%m%d%H%M%S)_atomic_account_deletion.sql

# 2. Add the SQL from Option 1 above

# 3. Test migration locally
pnpm supabase db reset

# 4. Verify function exists
psql $DATABASE_URL -c "\df delete_user_account_atomic"

# 5. Test function manually
psql $DATABASE_URL -c "SELECT delete_user_account_atomic(
  '<test-user-id>'::uuid,
  'Testing atomic deletion'
)"
```

**Week 1 - Day 1 (1 hour): Update API Endpoint**

```bash
# 1. Update delete-account endpoint with new code

# 2. Test successful deletion
curl -X DELETE http://localhost:3000/api/auth/delete-account \
  -H "Authorization: Bearer <user-token>" \
  -d '{"reason": "Testing"}'

# 3. Verify all data deleted
psql $DATABASE_URL -c "SELECT * FROM addresses WHERE user_id = '<user-id>'"
```

**Week 1 - Day 2 (1 hour): Failure Testing**

```sql
-- Simulate database error to test rollback
CREATE OR REPLACE FUNCTION delete_user_account_atomic_test_failure(...)
RETURNS JSONB AS $$
BEGIN
  DELETE FROM addresses WHERE user_id = p_user_id;
  DELETE FROM carts WHERE user_id = p_user_id;

  -- Simulate failure
  RAISE EXCEPTION 'Simulated failure for testing';

  -- These should NOT execute due to exception
  UPDATE orders SET user_id = NULL WHERE user_id = p_user_id;
  DELETE FROM profiles WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Test: addresses and carts should NOT be deleted (rollback)
SELECT delete_user_account_atomic_test_failure('<test-user-id>'::uuid, 'test');
SELECT COUNT(*) FROM addresses WHERE user_id = '<test-user-id>';
-- Should return original count (rollback worked)
```

**Week 1 - Day 2 (30 min): Documentation**

```markdown
# Account Deletion Process

## GDPR Compliance

Account deletion is handled atomically using database stored procedure.

**Guarantees:**
- All PII removed OR complete rollback
- No partial deletions possible
- Audit trail maintained

**Data Handling:**
- Addresses: DELETED
- Carts: DELETED
- Orders: ANONYMIZED (kept for accounting)
- Profile: DELETED
- Auth: DELETED (only after DB cleanup succeeds)

**Audit:**
All deletions logged in `account_deletion_logs` table.
```

## Technical Details

- **Affected Files:**
  - `/server/api/auth/delete-account.delete.ts` (API endpoint)
  - New migration: `YYYYMMDD_atomic_account_deletion.sql`
  - New table: `account_deletion_logs`
  - New function: `delete_user_account_atomic()`

- **Related Components:**
  - GDPR compliance system
  - User account management
  - Order system (anonymization)
  - Audit logging

- **Database Changes:**
  - New table: `account_deletion_logs`
  - New function: `delete_user_account_atomic`
  - Modified: None (only additions)

- **Pattern:**
  - Similar to: `create_order_with_inventory` (Lines 1-318 in migration)
  - Uses: PostgreSQL ACID transactions
  - Error handling: EXCEPTION block with automatic rollback

## Resources

- GitHub Issue: #225
- GDPR Article 17: Right to Erasure
- Example: `create_order_with_inventory` function (already implemented correctly)
- Supabase Docs: Database Functions
- PostgreSQL Docs: Error Handling in PL/pgSQL

## Acceptance Criteria

- [ ] `account_deletion_logs` table created
- [ ] `delete_user_account_atomic` function created and tested
- [ ] API endpoint updated to use atomic function
- [ ] Successful deletion test passes
- [ ] Failure rollback test passes (all-or-nothing verified)
- [ ] No orphaned PII after deletion
- [ ] Orders properly anonymized
- [ ] Audit log entry created on deletion
- [ ] Auth deletion only after DB cleanup succeeds
- [ ] GDPR compliance documented
- [ ] No regression in deletion functionality

## Work Log

### 2025-11-12 - Issue Discovered & Todo Created
**By:** Data Integrity Guardian + Security Sentinel
**Actions:**
- Comprehensive data integrity audit performed
- Identified non-atomic account deletion vulnerability
- Created GitHub issue #225
- Created local todo #026
- Categorized as P0 critical (GDPR compliance risk)

**Findings:**
- 7 sequential operations without transaction wrapper
- Partial deletion possible on network/database errors
- No rollback mechanism
- User cannot retry after failed deletion
- Orders may retain PII despite deletion request

**Similar Patterns Found:**
- ✅ Order creation uses atomic pattern (good example to follow)
- ❌ Account deletion does not (needs fix)

**Next Steps:**
1. Create database migration with atomic function
2. Update API endpoint to use function
3. Test rollback behavior
4. Document GDPR compliance

**Learnings:**
- Database-level transactions are more reliable than app-level
- GDPR requires guaranteed PII removal
- Existing project already has good pattern to follow
- Audit logging important for compliance

## Notes

**Priority Rationale:**
- P0 because GDPR violations have severe financial penalties
- Data integrity corruption possible (orphaned PII)
- No recovery mechanism for users
- Easy to fix using existing patterns
- High regulatory and reputational risk

**GDPR Context:**
- Article 17 requires "right to erasure"
- Must delete PII "without undue delay"
- Partial deletion = violation
- Audit trail required

**Risk Assessment:**
- **Likelihood:** Medium (deletion is infrequent but happens)
- **Impact:** Critical (€20M fines, data breach, lawsuits)
- **Current State:** Vulnerable
- **After Fix:** Compliant

**Testing Strategy:**
1. Unit test: successful deletion
2. Integration test: rollback on failure
3. Manual test: verify PII removal
4. Audit test: verify logs created

Source: Multi-agent code review 2025-11-12 (Data Integrity Guardian)
Related: GDPR compliance, database patterns, order creation (good example)
