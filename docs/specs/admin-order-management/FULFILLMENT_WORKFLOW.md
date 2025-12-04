# Order Fulfillment Workflow System

## Overview

The Order Fulfillment Workflow System provides a structured checklist-based approach to managing order fulfillment from picking to shipping. This system helps ensure consistent order processing and tracks progress through each stage.

## Components

### FulfillmentChecklist.vue

Main component that displays and manages fulfillment tasks for an order.

**Location:** `components/admin/Orders/FulfillmentChecklist.vue`

**Features:**
- Displays tasks grouped by stage (Picking, Packing, Shipping, Quality Check)
- Shows completion status with checkboxes
- Tracks completion timestamps and responsible admin
- Displays overall progress percentage
- Supports required and optional tasks
- Automatically updates order fulfillment progress

**Props:**
- `orderId` (number) - The order ID
- `currentStatus` (string) - Current order status
- `fulfillmentTasks` (OrderFulfillmentTask[]) - Array of fulfillment tasks

**Events:**
- `updated` - Emitted when a task is completed or fulfillment progress changes

### InitializeFulfillmentButton.vue

Button component to create default fulfillment tasks for an order.

**Location:** `components/admin/Orders/InitializeFulfillmentButton.vue`

**Features:**
- Creates standard fulfillment tasks for an order
- Shows loading state during creation
- Displays success/error notifications

**Props:**
- `orderId` (number) - The order ID

**Events:**
- `initialized` - Emitted when tasks are successfully created

## API Endpoints

### POST /api/admin/orders/:id/fulfillment-tasks

Creates default fulfillment tasks for an order.

**Default Tasks Created:**

**Picking Stage:**
1. Pick all items from inventory (required)
2. Verify item quantities (required)

**Packing Stage:**
3. Select appropriate packaging (required)
4. Pack items securely (required)
5. Include packing slip (required)

**Quality Check Stage:**
6. Verify order accuracy (required)
7. Check package weight (optional)

**Shipping Stage:**
8. Generate shipping label (required)
9. Attach shipping label (required)
10. Hand off to carrier (required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_id": 123,
      "task_type": "picking",
      "task_name": "Pick all items from inventory",
      "description": "Locate and collect all ordered items from warehouse shelves",
      "required": true,
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "created_at": "2025-10-28T10:00:00Z"
    }
    // ... more tasks
  ]
}
```

### PATCH /api/admin/orders/:id/fulfillment-tasks/:taskId

Updates a fulfillment task (mark as completed/incomplete).

**Request Body:**
```json
{
  "completed": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 123,
    "task_type": "picking",
    "task_name": "Pick all items from inventory",
    "description": "Locate and collect all ordered items from warehouse shelves",
    "required": true,
    "completed": true,
    "completed_at": "2025-10-28T10:30:00Z",
    "completed_by": "user-uuid-here",
    "created_at": "2025-10-28T10:00:00Z"
  }
}
```

**Side Effects:**
- When a picking task is marked as completed, inventory is automatically updated
- Order fulfillment progress percentage is recalculated
- Inventory logs are created for audit trail

## Inventory Integration

### Automatic Inventory Updates

When a picking task is marked as completed, the system automatically:

1. **Reduces Product Stock:**
   - Fetches all order items
   - Decreases stock quantity for each product
   - Ensures stock never goes below 0

2. **Creates Inventory Logs:**
   - Records quantity change
   - Links to order ID as reference
   - Marks reason as 'sale'
   - Tracks admin who completed the task

**Example Inventory Log:**
```json
{
  "product_id": 456,
  "quantity_change": -2,
  "quantity_after": 48,
  "reason": "sale",
  "reference_id": 123,
  "created_by": "admin-user-uuid"
}
```

### Inventory Tracking

The system maintains a complete audit trail:
- All inventory changes are logged
- Each log entry includes the admin responsible
- Order ID is stored as reference for traceability
- Timestamps track when changes occurred

## Fulfillment Progress Tracking

### Progress Calculation

The system automatically calculates fulfillment progress:

```
Progress % = (Completed Tasks / Total Tasks) × 100
```

### Progress Updates

Progress is updated:
- When any task is marked as completed
- When any task is marked as incomplete
- Stored in `orders.fulfillment_progress` field
- Displayed in order detail page and order list

### Progress Indicators

**Visual Indicators:**
- 0-49%: Gray progress bar
- 50-74%: Yellow progress bar
- 75-99%: Blue progress bar
- 100%: Green progress bar

**Badge Variants:**
- 0-49%: Outline badge
- 50-99%: Secondary badge
- 100%: Default badge (success)

## Task Types

### Picking
Tasks related to locating and collecting items from inventory.

**Standard Tasks:**
- Pick all items from inventory
- Verify item quantities

**Triggers:**
- Inventory updates when completed

### Packing
Tasks related to packaging items for shipment.

**Standard Tasks:**
- Select appropriate packaging
- Pack items securely
- Include packing slip

### Shipping
Tasks related to preparing and sending the package.

**Standard Tasks:**
- Generate shipping label
- Attach shipping label
- Hand off to carrier

### Quality Check
Tasks to verify order accuracy before shipping.

**Standard Tasks:**
- Verify order accuracy (required)
- Check package weight (optional)

### Custom
Additional tasks specific to certain orders.

**Use Cases:**
- Special handling requirements
- Gift wrapping
- Custom notes or cards
- Additional quality checks

## Usage

### In Order Detail Page

The fulfillment checklist is automatically displayed for orders that are:
- In 'pending' status
- In 'processing' status
- Have existing fulfillment tasks (any status)

**Integration:**
```vue
<AdminOrdersFulfillmentChecklist
  v-if="order.status === 'pending' || order.status === 'processing' || order.fulfillmentTasks && order.fulfillmentTasks.length > 0"
  :order-id="order.id"
  :current-status="order.status"
  :fulfillment-tasks="order.fulfillmentTasks"
  @updated="handleFulfillmentUpdated"
/>
```

### Initializing Tasks

If an order doesn't have fulfillment tasks yet:

1. The checklist shows an empty state
2. An "Initialize Fulfillment Tasks" button is displayed
3. Clicking the button creates default tasks
4. Tasks are immediately displayed in the checklist

### Completing Tasks

1. Admin views the fulfillment checklist
2. Clicks checkbox next to a task
3. Task is marked as completed
4. Completion timestamp and admin ID are recorded
5. If it's a picking task, inventory is updated
6. Overall progress is recalculated
7. Order detail page refreshes to show updated progress

## Database Schema

### order_fulfillment_tasks Table

```sql
CREATE TABLE order_fulfillment_tasks (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('picking', 'packing', 'shipping', 'quality_check', 'custom')),
  task_name TEXT NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT TRUE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Related Order Fields

```sql
ALTER TABLE orders 
  ADD COLUMN fulfillment_progress INTEGER DEFAULT 0 CHECK (fulfillment_progress BETWEEN 0 AND 100);
```

## Requirements Addressed

This implementation addresses the following requirements from the design document:

- **4.1:** Fulfillment checklist with picking, packing, and shipping stages
- **4.2:** Update inventory levels when items are picked
- **4.3:** Integration with existing inventory system
- **4.4:** Track completion timestamps and responsible admin

## Future Enhancements

Potential improvements for future iterations:

1. **Task Dependencies:** Prevent completing packing tasks before picking tasks
2. **Custom Task Creation:** Allow admins to add custom tasks per order
3. **Task Templates:** Create reusable task templates for different order types
4. **Bulk Task Operations:** Complete multiple tasks at once
5. **Task Notifications:** Notify admins when tasks are completed
6. **Task Assignment:** Assign specific tasks to specific admins
7. **Time Tracking:** Track how long each task takes to complete
8. **Task Comments:** Add notes or comments to individual tasks

## Testing

To test the fulfillment workflow:

1. **Create an order** in pending or processing status
2. **Navigate** to the order detail page
3. **Click** "Initialize Fulfillment Tasks" button
4. **Verify** that 10 default tasks are created
5. **Complete** a picking task
6. **Check** that inventory was updated for order items
7. **Verify** that progress percentage updated
8. **Complete** all tasks
9. **Confirm** progress shows 100%

## Troubleshooting

### Tasks Not Appearing

**Issue:** Fulfillment checklist shows empty state even after initialization.

**Solutions:**
- Check browser console for API errors
- Verify order ID is correct
- Ensure database migration was applied
- Check RLS policies allow admin access

### Inventory Not Updating

**Issue:** Completing picking tasks doesn't update inventory.

**Solutions:**
- Verify inventory_logs table exists
- Check that products table has stock_quantity field
- Review server logs for errors
- Ensure admin has proper permissions

### Progress Not Updating

**Issue:** Completing tasks doesn't update progress percentage.

**Solutions:**
- Check that orders.fulfillment_progress field exists
- Verify API endpoint is calculating progress correctly
- Refresh the order detail page
- Check for JavaScript errors in console

## Related Documentation

- [Requirements Document](./requirements.md) - See Requirement 4
- [Design Document](./design.md) - See Fulfillment Workflow section
- [Tasks Document](./tasks.md) - See Task 9
- [Database Migration](../../supabase/sql/supabase-admin-order-management.sql)
