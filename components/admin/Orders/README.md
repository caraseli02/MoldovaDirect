# Admin Order Management Components

This directory contains components for the admin order management system.

## Status Management Components

### StatusBadge.vue

A reusable badge component for displaying order status with consistent styling and icons.

**Props:**
- `status` (required): Order status - 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
- `showIcon` (optional, default: true): Whether to show status icon
- `class` (optional): Additional CSS classes

**Usage:**
```vue
<AdminOrdersStatusBadge :status="order.status" />
<AdminOrdersStatusBadge :status="order.status" :show-icon="false" />
```

**Status Variants:**
- `pending`: Secondary badge with clock icon
- `processing`: Default badge with package icon
- `shipped`: Default badge with truck icon
- `delivered`: Default badge with check-circle icon
- `cancelled`: Destructive badge with x-circle icon

### StatusUpdateDialog.vue

A dialog component for updating order status with validation and tracking information.

**Props:**
- `orderId` (required): Order ID
- `orderNumber` (required): Order number for display
- `currentStatus` (required): Current order status

**Events:**
- `@updated`: Emitted when status is successfully updated
  - Payload: `{ status: OrderStatus, trackingNumber?: string, carrier?: string }`

**Usage:**
```vue
<AdminOrdersStatusUpdateDialog
  :order-id="order.id"
  :order-number="order.orderNumber"
  :current-status="order.status"
  @updated="handleStatusUpdated"
/>
```

**Features:**
- Status transition validation (enforces valid workflow)
- Required tracking information for 'shipped' status
- Optional admin notes
- Real-time validation feedback
- Loading states and error handling

## Status Transition Workflow

The system enforces the following status transitions:

```
pending → processing → shipped → delivered
   ↓           ↓          ↓
cancelled   cancelled  cancelled
```

**Valid Transitions:**
- `pending` → `processing`, `cancelled`
- `processing` → `shipped`, `cancelled`
- `shipped` → `delivered`, `cancelled`
- `delivered` → (terminal state, no transitions)
- `cancelled` → (terminal state, no transitions)

**Required Fields by Status:**
- `shipped`: Requires `trackingNumber` and `carrier`
- All other statuses: No additional required fields

## Integration

### In List Views

```vue
<template>
  <TableCell>
    <AdminOrdersStatusBadge :status="order.status" />
  </TableCell>
</template>
```

### In Detail Views

```vue
<template>
  <div class="flex items-center space-x-2">
    <AdminOrdersStatusBadge :status="order.status" />
    <AdminOrdersStatusUpdateDialog
      :order-id="order.id"
      :order-number="order.orderNumber"
      :current-status="order.status"
      @updated="handleStatusUpdated"
    />
  </div>
</template>

<script setup lang="ts">
const handleStatusUpdated = async (data) => {
  // Refresh order data
  await fetchOrder()
}
</script>
```

## API Integration

The StatusUpdateDialog component calls:
- `PATCH /api/admin/orders/[id]/status`

**Request Body:**
```typescript
{
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  adminNotes?: string,
  trackingNumber?: string,  // Required for 'shipped'
  carrier?: string           // Required for 'shipped'
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    orderId: number,
    orderNumber: string,
    status: string,
    trackingNumber?: string,
    carrier?: string,
    shippedAt?: string,
    deliveredAt?: string,
    previousStatus: string
  }
}
```

## Styling

All components use:
- shadcn-vue components (Badge, Dialog, Input, Button)
- Tailwind CSS for styling
- Dark mode support
- Consistent rounded-2xl card styling
- Lucide icons via commonIcon component

## Requirements Addressed

- **Requirement 3.1**: Valid status transition enforcement
- **Requirement 3.2**: Status change confirmation via dialog
- **Requirement 3.3**: Automatic timestamping (handled by API)
- **Requirement 3.5**: Tracking number input for shipped status
