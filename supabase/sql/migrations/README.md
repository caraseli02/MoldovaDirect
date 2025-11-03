# Database Migrations

This directory contains SQL migration files for the MoldovaDirect database.

## How to Apply Migrations

### Using Supabase CLI (Recommended)

1. Make sure you have the Supabase CLI installed:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Apply the migration:
   ```bash
   supabase db push
   ```

### Manual Application via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the migration file (e.g., `20251103141318_create_order_with_inventory_function.sql`)
4. Copy the entire SQL content
5. Paste into the SQL Editor
6. Click "Run" to execute

### Manual Application via psql

```bash
psql postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres \
  -f supabase/sql/migrations/20251103141318_create_order_with_inventory_function.sql
```

## Migration: 20251103141318 - Atomic Order Creation with Inventory

**Issue:** #89 - No Transaction for Order Creation + Inventory Update

**Description:**
This migration creates a PostgreSQL function `create_order_with_inventory()` that atomically handles:
- Order creation
- Order items creation
- Inventory deduction
- Inventory log creation

All operations are wrapped in a single database transaction, preventing data corruption from:
- Network failures between API calls
- Race conditions with concurrent orders
- Partial order states

**Breaking Changes:**
- The `/api/checkout/update-inventory` endpoint is now deprecated
- Frontend no longer needs to call inventory update separately
- Order creation now automatically handles inventory

**Testing After Migration:**
```sql
-- Test 1: Verify function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'create_order_with_inventory';

-- Test 2: Check function permissions
SELECT grantor, grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'create_order_with_inventory';
```

## Rollback Instructions

If you need to rollback this migration:

```sql
-- Remove the function
DROP FUNCTION IF EXISTS create_order_with_inventory(JSONB, JSONB[]);
```

**Note:** After rollback, you must:
1. Revert the changes to `server/api/checkout/create-order.post.ts`
2. Restore the `updateInventory()` call in `stores/checkout/payment.ts`
3. Un-deprecate the `update-inventory` endpoint
