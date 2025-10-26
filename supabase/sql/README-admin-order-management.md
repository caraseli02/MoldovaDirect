# Admin Order Management Database Migration

This migration adds the necessary database schema for the admin order management feature.

## What This Migration Adds

### Extended Orders Table
Adds admin-specific fields to the existing `orders` table:
- `priority_level` - Order priority (1-5)
- `estimated_ship_date` - Estimated shipping date
- `tracking_number` - Shipping carrier tracking number
- `shipping_carrier` - Name of shipping carrier
- `fulfillment_progress` - Percentage of fulfillment completion (0-100)

### New Tables

#### order_status_history
Tracks all status changes for orders with full audit trail:
- Captures from/to status transitions
- Records which admin made the change
- Timestamps all changes
- Supports both manual and automated changes
- Includes optional notes for each change

#### order_notes
Stores notes related to orders:
- `internal` notes - Only visible to admins
- `customer` notes - Visible to customers
- Full audit trail with creator and timestamps
- Supports updates and deletions by note creator

#### order_fulfillment_tasks
Manages fulfillment workflow tasks:
- Supports different task types (picking, packing, shipping, quality_check, custom)
- Tracks completion status and timestamps
- Records which admin completed each task
- Allows marking tasks as required or optional

### Row Level Security (RLS) Policies

All tables have RLS enabled with appropriate policies:

**Admin Access:**
- Admins can view, insert, update, and delete records
- Currently uses authenticated user check (should be enhanced with role-based access)

**Customer Access:**
- Customers can view status history for their own orders
- Customers can view customer-facing notes for their own orders
- Customers cannot modify any admin data

### Automatic Triggers

**Status Change Logging:**
- Automatically creates a record in `order_status_history` when order status changes
- Captures the admin who made the change (via auth.uid())
- Marks changes as non-automated by default

**Updated At Timestamps:**
- Automatically updates `updated_at` field on `order_notes` table

### Performance Indexes

Indexes added for optimal query performance:
- Order status history: order_id, changed_at, to_status
- Order notes: order_id, created_at, note_type
- Fulfillment tasks: order_id, completed, task_type
- Orders: priority_level, estimated_ship_date, tracking_number, fulfillment_progress

## How to Apply This Migration

### Option 1: Via Supabase Dashboard (Recommended for Development)

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-admin-order-management.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

### Option 2: Via Supabase CLI (Recommended for Production)

```bash
# Make sure you're in the project root
cd /path/to/your/project

# Apply the migration
supabase db push

# Or if using migrations folder
supabase migration new admin_order_management
# Copy the SQL content to the new migration file
supabase db push
```

### Option 3: Direct Database Connection

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration file
\i supabase/sql/supabase-admin-order-management.sql
```

## Verification

After applying the migration, verify it was successful:

```sql
-- Check if new columns exist on orders table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('priority_level', 'estimated_ship_date', 'tracking_number', 'shipping_carrier', 'fulfillment_progress');

-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('order_status_history', 'order_notes', 'order_fulfillment_tasks');

-- Check if indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('order_status_history', 'order_notes', 'order_fulfillment_tasks', 'orders')
AND indexname LIKE '%admin%' OR indexname LIKE '%order_status%' OR indexname LIKE '%order_notes%' OR indexname LIKE '%fulfillment%';

-- Check if RLS policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('order_status_history', 'order_notes', 'order_fulfillment_tasks');
```

## Important Notes

### Admin Role Implementation

The current RLS policies use a simple authenticated user check. For production use, you should implement proper role-based access control:

```sql
-- Example: Add admin role check
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'  -- Add role field to profiles table
    )
  );
```

### Backward Compatibility

This migration is designed to be backward compatible:
- All new columns on `orders` table have default values
- Existing queries will continue to work
- New fields are optional in TypeScript types

### Data Migration

If you have existing orders, you may want to:
1. Set default priority levels based on order age or value
2. Backfill estimated ship dates for pending orders
3. Create initial status history records for existing orders

Example backfill script:

```sql
-- Create initial status history for existing orders
INSERT INTO order_status_history (order_id, to_status, changed_at, automated)
SELECT id, status, created_at, true
FROM orders
WHERE NOT EXISTS (
  SELECT 1 FROM order_status_history 
  WHERE order_status_history.order_id = orders.id
);
```

## TypeScript Types

The corresponding TypeScript types have been added to `types/database.ts`:

- `OrderStatusHistory` - Status change records
- `OrderNote` - Order notes
- `OrderFulfillmentTask` - Fulfillment tasks
- `OrderWithAdminDetails` - Extended order with admin data
- `AdminOrderFilters` - Filtering options for admin order list
- `AdminOrderListResponse` - API response format

The base `Order` interface has been extended with optional admin fields.

## Rollback

If you need to rollback this migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders;
DROP FUNCTION IF EXISTS log_order_status_change();

-- Drop tables
DROP TABLE IF EXISTS order_fulfillment_tasks CASCADE;
DROP TABLE IF EXISTS order_notes CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;

-- Remove columns from orders table
ALTER TABLE orders 
  DROP COLUMN IF EXISTS priority_level,
  DROP COLUMN IF EXISTS estimated_ship_date,
  DROP COLUMN IF EXISTS tracking_number,
  DROP COLUMN IF EXISTS shipping_carrier,
  DROP COLUMN IF EXISTS fulfillment_progress;
```

## Next Steps

After applying this migration:

1. ✅ Database schema is ready
2. ✅ TypeScript types are defined
3. ⏭️ Create admin orders store (Task 2)
4. ⏭️ Build API endpoints (Task 3)
5. ⏭️ Implement UI components (Tasks 4-7)

## Support

For issues or questions about this migration:
- Check the design document: `.kiro/specs/admin-order-management/design.md`
- Review the requirements: `.kiro/specs/admin-order-management/requirements.md`
- See the implementation tasks: `.kiro/specs/admin-order-management/tasks.md`
