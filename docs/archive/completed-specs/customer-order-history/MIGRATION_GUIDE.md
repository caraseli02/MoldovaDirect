# Order Tracking Migration Guide

This guide explains how to apply the database schema changes for the order tracking feature.

## Database Migration

### Step 1: Apply the Schema Migration

Run the SQL migration file against your Supabase database:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Using Supabase Dashboard
# 1. Go to your Supabase project dashboard
# 2. Navigate to SQL Editor
# 3. Copy and paste the contents of supabase-order-tracking-schema.sql
# 4. Execute the SQL
```

### Step 2: Verify the Migration

After applying the migration, verify that the following changes were made:

#### New Columns in `orders` Table
- `tracking_number` (TEXT, nullable)
- `carrier` (TEXT, nullable)
- `estimated_delivery` (TIMESTAMP WITH TIME ZONE, nullable)

#### New Table: `order_tracking_events`
- `id` (SERIAL PRIMARY KEY)
- `order_id` (INTEGER, references orders)
- `status` (TEXT, with CHECK constraint)
- `location` (TEXT, nullable)
- `description` (TEXT)
- `timestamp` (TIMESTAMP WITH TIME ZONE)
- `created_at` (TIMESTAMP WITH TIME ZONE)

#### New Indexes
- `order_tracking_events_order_id_idx`
- `order_tracking_events_timestamp_idx`
- `order_tracking_events_order_timestamp_idx`
- `order_tracking_events_status_idx`
- `orders_tracking_number_idx`
- `orders_carrier_idx`
- `orders_estimated_delivery_idx`
- `orders_user_status_created_idx`
- `orders_user_order_number_idx`

#### New Functions
- `get_latest_tracking_event(p_order_id INTEGER)`
- `add_tracking_event(...)`

### Step 3: Test the Migration

You can test the migration by running these SQL queries:

```sql
-- Test 1: Verify new columns exist
SELECT tracking_number, carrier, estimated_delivery 
FROM orders 
LIMIT 1;

-- Test 2: Verify tracking events table exists
SELECT * FROM order_tracking_events LIMIT 1;

-- Test 3: Test the helper function
SELECT * FROM get_latest_tracking_event(1);
```

## API Enhancements

### Updated Endpoints

#### 1. GET /api/orders
**Enhanced with:**
- Tracking information in response (tracking_number, carrier, estimated_delivery)
- Search by order number: `?search=MD-2024-001`
- Date range filtering: `?dateFrom=2024-01-01&dateTo=2024-12-31`
- Existing filters still work: `?status=shipped&page=1&limit=10`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_number": "MD-2024-001",
        "status": "shipped",
        "tracking_number": "1Z999AA10123456784",
        "carrier": "UPS",
        "estimated_delivery": "2024-10-10T18:00:00Z",
        "total_eur": 89.99,
        "created_at": "2024-10-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### 2. GET /api/orders/[id]
**Enhanced with:**
- Tracking events array included in response
- All tracking information from orders table

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "MD-2024-001",
    "tracking_number": "1Z999AA10123456784",
    "carrier": "UPS",
    "estimated_delivery": "2024-10-10T18:00:00Z",
    "tracking_events": [
      {
        "id": 1,
        "status": "in_transit",
        "location": "Barcelona, Spain",
        "description": "Package in transit",
        "timestamp": "2024-10-06T14:30:00Z"
      }
    ],
    "order_items": [...]
  }
}
```

### New Endpoints

#### 3. GET /api/orders/[id]/tracking
Get detailed tracking information for a specific order.

**Request:**
```
GET /api/orders/123/tracking
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tracking_number": "1Z999AA10123456784",
    "carrier": "UPS",
    "estimated_delivery": "2024-10-10T18:00:00Z",
    "current_status": "shipped",
    "has_tracking": true,
    "events": [
      {
        "id": 3,
        "status": "in_transit",
        "location": "Barcelona, Spain",
        "description": "Package in transit",
        "timestamp": "2024-10-06T14:30:00Z",
        "created_at": "2024-10-06T14:35:00Z"
      },
      {
        "id": 2,
        "status": "picked_up",
        "location": "Madrid, Spain",
        "description": "Package picked up by carrier",
        "timestamp": "2024-10-05T16:00:00Z",
        "created_at": "2024-10-05T16:05:00Z"
      }
    ]
  }
}
```

#### 4. POST /api/orders/[id]/tracking
Add a tracking event to an order (for admin use or webhook integration).

**Request:**
```
POST /api/orders/123/tracking
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_transit",
  "location": "Barcelona, Spain",
  "description": "Package in transit",
  "timestamp": "2024-10-06T14:30:00Z",
  "tracking_number": "1Z999AA10123456784",
  "carrier": "UPS",
  "estimated_delivery": "2024-10-10T18:00:00Z"
}
```

**Valid Status Values:**
- `label_created`
- `picked_up`
- `in_transit`
- `out_for_delivery`
- `delivered`
- `exception`
- `returned`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "order_id": 123,
    "status": "in_transit",
    "location": "Barcelona, Spain",
    "description": "Package in transit",
    "timestamp": "2024-10-06T14:30:00Z",
    "created_at": "2024-10-06T14:35:00Z"
  }
}
```

**Automatic Order Status Updates:**
The endpoint automatically updates the order status based on tracking events:
- `delivered` → Sets order status to "delivered" and records delivered_at
- `out_for_delivery` → Sets order status to "shipped" (if not already delivered)
- `in_transit` or `picked_up` → Sets order status to "shipped" and records shipped_at (if currently "processing")

## Security Considerations

### Row Level Security (RLS)
- Users can only view tracking events for their own orders
- Admin policies are in place for inserting/updating tracking events
- All queries are filtered by user_id to prevent unauthorized access

### Input Validation
- Tracking status values are validated against allowed values
- Order ownership is verified before allowing access
- All user inputs are sanitized to prevent SQL injection

## Performance Optimizations

### Indexes Created
1. **order_tracking_events_order_id_idx**: Fast lookup of events by order
2. **order_tracking_events_timestamp_idx**: Efficient sorting by time
3. **order_tracking_events_order_timestamp_idx**: Composite index for common queries
4. **orders_tracking_number_idx**: Quick tracking number lookups
5. **orders_user_status_created_idx**: Optimized order list queries with filters

### Query Optimization Tips
- Use pagination for order lists (already implemented)
- Tracking events are sorted by timestamp DESC for most recent first
- Indexes support efficient filtering by status, date range, and search

## Testing the Implementation

### Manual Testing

1. **Test Order List with Tracking:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/orders?page=1&limit=10"
```

2. **Test Order Detail with Tracking Events:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/orders/123"
```

3. **Test Tracking Endpoint:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/orders/123/tracking"
```

4. **Test Adding Tracking Event:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_transit",
    "location": "Barcelona, Spain",
    "description": "Package in transit",
    "tracking_number": "1Z999AA10123456784",
    "carrier": "UPS"
  }' \
  "http://localhost:3000/api/orders/123/tracking"
```

### Sample Data for Testing

You can insert sample tracking events using the SQL function:

```sql
-- Add tracking events for order ID 1
SELECT add_tracking_event(
  1,
  'label_created',
  'Madrid, Spain',
  'Shipping label created',
  NOW() - INTERVAL '3 days'
);

SELECT add_tracking_event(
  1,
  'picked_up',
  'Madrid, Spain',
  'Package picked up by carrier',
  NOW() - INTERVAL '2 days'
);

SELECT add_tracking_event(
  1,
  'in_transit',
  'Barcelona, Spain',
  'Package in transit',
  NOW() - INTERVAL '1 day'
);
```

## Rollback Instructions

If you need to rollback the migration:

```sql
-- Drop new indexes
DROP INDEX IF EXISTS orders_user_order_number_idx;
DROP INDEX IF EXISTS orders_user_status_created_idx;
DROP INDEX IF EXISTS orders_estimated_delivery_idx;
DROP INDEX IF EXISTS orders_carrier_idx;
DROP INDEX IF EXISTS orders_tracking_number_idx;
DROP INDEX IF EXISTS order_tracking_events_status_idx;
DROP INDEX IF EXISTS order_tracking_events_order_timestamp_idx;
DROP INDEX IF EXISTS order_tracking_events_timestamp_idx;
DROP INDEX IF EXISTS order_tracking_events_order_id_idx;

-- Drop functions
DROP FUNCTION IF EXISTS add_tracking_event(INTEGER, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS get_latest_tracking_event(INTEGER);

-- Drop table
DROP TABLE IF EXISTS order_tracking_events;

-- Remove columns from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS estimated_delivery;
ALTER TABLE orders DROP COLUMN IF EXISTS carrier;
ALTER TABLE orders DROP COLUMN IF EXISTS tracking_number;
```

## Next Steps

After applying this migration, you can proceed with:
1. Implementing the frontend composables (Task 2)
2. Creating the UI components (Task 3)
3. Building the order list and detail pages (Tasks 4-5)
4. Setting up real-time notifications (Task 7)
