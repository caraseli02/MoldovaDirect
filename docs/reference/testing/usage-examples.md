# Order Status Email Notifications - Usage Examples


## Overview
This document provides practical examples of how to use the order status email notification system.

## Programmatic Usage

### 1. Send Order Processing Email

```typescript
import { sendOrderStatusEmail, transformOrderToEmailData } from '~/server/utils/orderEmails'

// After order is created and payment confirmed
async function notifyOrderProcessing(orderId: number) {
  const supabase = useSupabaseClient()
  
  // Fetch order with items
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items:order_items(*)')
    .eq('id', orderId)
    .single()
  
  // Get customer info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, preferred_locale')
    .eq('id', order.user_id)
    .single()
  
  // Transform order data
  const emailData = transformOrderToEmailData(
    order,
    profile.full_name,
    profile.email,
    profile.preferred_locale
  )
  
  // Send processing email
  await sendOrderStatusEmail(emailData, 'order_processing')
}
```

### 2. Send Shipping Confirmation with Tracking

```typescript
import { sendOrderStatusEmail, transformOrderToEmailData } from '~/server/utils/orderEmails'

async function notifyOrderShipped(
  orderId: number,
  trackingNumber: string,
  carrier: string,
  estimatedDelivery: string
) {
  const supabase = useSupabaseClient()
  
  // Update order with tracking info
  await supabase
    .from('orders')
    .update({
      status: 'shipped',
      tracking_number: trackingNumber,
      carrier: carrier,
      estimated_delivery: estimatedDelivery,
      shipped_at: new Date().toISOString()
    })
    .eq('id', orderId)
  
  // Fetch updated order
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items:order_items(*)')
    .eq('id', orderId)
    .single()
  
  // Get customer info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, preferred_locale')
    .eq('id', order.user_id)
    .single()
  
  // Transform order data (includes tracking info)
  const emailData = transformOrderToEmailData(
    order,
    profile.full_name,
    profile.email,
    profile.preferred_locale
  )
  
  // Send shipping email
  await sendOrderStatusEmail(emailData, 'order_shipped')
}
```

### 3. Send Delivery Confirmation with Review Request

```typescript
import { sendDeliveryConfirmationEmail, transformOrderToEmailData } from '~/server/utils/orderEmails'

async function notifyOrderDelivered(orderId: number) {
  const supabase = useSupabaseClient()
  
  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString()
    })
    .eq('id', orderId)
  
  // Fetch order
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items:order_items(*)')
    .eq('id', orderId)
    .single()
  
  // Get customer info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, preferred_locale')
    .eq('id', order.user_id)
    .single()
  
  // Transform order data
  const emailData = transformOrderToEmailData(
    order,
    profile.full_name,
    profile.email,
    profile.preferred_locale
  )
  
  // Send delivery confirmation (includes review request)
  await sendDeliveryConfirmationEmail(emailData)
}
```

### 4. Send Cancellation Notification

```typescript
import { sendOrderStatusEmail, transformOrderToEmailData } from '~/server/utils/orderEmails'

async function notifyOrderCancelled(orderId: number, reason?: string) {
  const supabase = useSupabaseClient()
  
  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason
    })
    .eq('id', orderId)
  
  // Fetch order
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items:order_items(*)')
    .eq('id', orderId)
    .single()
  
  // Get customer info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, preferred_locale')
    .eq('id', order.user_id)
    .single()
  
  // Transform order data
  const emailData = transformOrderToEmailData(
    order,
    profile.full_name,
    profile.email,
    profile.preferred_locale
  )
  
  // Send cancellation email
  await sendOrderStatusEmail(emailData, 'order_cancelled')
}
```

### 5. Send Issue Notification

```typescript
import { sendOrderStatusEmail, transformOrderToEmailData } from '~/server/utils/orderEmails'

async function notifyOrderIssue(orderId: number, issueDescription: string) {
  const supabase = useSupabaseClient()
  
  // Fetch order
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items:order_items(*)')
    .eq('id', orderId)
    .single()
  
  // Get customer info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, preferred_locale')
    .eq('id', order.user_id)
    .single()
  
  // Transform order data
  const emailData = transformOrderToEmailData(
    order,
    profile.full_name,
    profile.email,
    profile.preferred_locale
  )
  
  // Send issue email with custom description
  await sendOrderStatusEmail(emailData, 'order_issue', issueDescription)
}
```

## API Usage

### 1. Manually Send Status Email

```bash
# Send processing notification
curl -X POST http://localhost:3000/api/orders/123/send-status-email \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "order_processing"
  }'

# Send shipping notification
curl -X POST http://localhost:3000/api/orders/123/send-status-email \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "order_shipped"
  }'

# Send issue notification with description
curl -X POST http://localhost:3000/api/orders/123/send-status-email \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "order_issue",
    "issueDescription": "Payment verification required. Please contact support."
  }'
```

### 2. Update Status and Send Email

```bash
# Update to processing
curl -X POST http://localhost:3000/api/orders/123/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing",
    "sendEmail": true
  }'

# Update to shipped with tracking
curl -X POST http://localhost:3000/api/orders/123/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "trackingNumber": "1Z999AA10123456784",
    "carrier": "ups",
    "estimatedDelivery": "2025-01-20T00:00:00Z",
    "sendEmail": true
  }'

# Update to delivered
curl -X POST http://localhost:3000/api/orders/123/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered",
    "sendEmail": true
  }'

# Cancel order
curl -X POST http://localhost:3000/api/orders/123/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled",
    "sendEmail": true
  }'

# Update status without sending email
curl -X POST http://localhost:3000/api/orders/123/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing",
    "sendEmail": false
  }'
```

## Admin Dashboard Integration

### Example: Admin Order Management Component

```vue
<template>
  <div class="order-management">
    <h2>Order #{{ order.orderNumber }}</h2>
    
    <div class="status-update">
      <select v-model="newStatus">
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      
      <div v-if="newStatus === 'shipped'" class="tracking-info">
        <input v-model="trackingNumber" placeholder="Tracking Number" />
        <select v-model="carrier">
          <option value="dhl">DHL</option>
          <option value="ups">UPS</option>
          <option value="fedex">FedEx</option>
          <option value="correos">Correos</option>
        </select>
        <input v-model="estimatedDelivery" type="date" />
      </div>
      
      <label>
        <input type="checkbox" v-model="sendEmail" />
        Send notification email to customer
      </label>
      
      <button @click="updateOrderStatus">Update Status</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const order = ref(/* order data */)
const newStatus = ref('processing')
const trackingNumber = ref('')
const carrier = ref('dhl')
const estimatedDelivery = ref('')
const sendEmail = ref(true)

async function updateOrderStatus() {
  try {
    const response = await $fetch(`/api/orders/${order.value.id}/update-status`, {
      method: 'POST',
      body: {
        status: newStatus.value,
        trackingNumber: trackingNumber.value || undefined,
        carrier: carrier.value || undefined,
        estimatedDelivery: estimatedDelivery.value || undefined,
        sendEmail: sendEmail.value
      }
    })
    
    if (response.success) {
      // Show success message
      console.log('Order status updated successfully')
      if (response.email?.sent) {
        console.log('Email notification sent to customer')
      }
    }
  } catch (error) {
    console.error('Failed to update order status:', error)
  }
}
</script>
```

## Automated Workflows

### Example: Carrier Webhook Handler

```typescript
// server/api/webhooks/carrier-tracking.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Parse carrier webhook data
  const { trackingNumber, status, estimatedDelivery } = body
  
  // Find order by tracking number
  const supabase = await serverSupabaseClient(event)
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items:order_items(*)')
    .eq('tracking_number', trackingNumber)
    .single()
  
  if (!order) {
    return { error: 'Order not found' }
  }
  
  // Update order status based on carrier status
  let orderStatus = order.status
  let emailType: EmailType | null = null
  
  if (status === 'in_transit' && order.status === 'processing') {
    orderStatus = 'shipped'
    emailType = 'order_shipped'
  } else if (status === 'delivered') {
    orderStatus = 'delivered'
    emailType = 'order_delivered'
  }
  
  // Update order
  await supabase
    .from('orders')
    .update({
      status: orderStatus,
      estimated_delivery: estimatedDelivery
    })
    .eq('id', order.id)
  
  // Send email notification if status changed
  if (emailType) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, preferred_locale')
      .eq('id', order.user_id)
      .single()
    
    const emailData = transformOrderToEmailData(
      order,
      profile.full_name,
      profile.email,
      profile.preferred_locale
    )
    
    await sendOrderStatusEmail(emailData, emailType)
  }
  
  return { success: true }
})
```

## Testing Examples

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { sendOrderStatusEmail } from '~/server/utils/orderEmails'

describe('Order Status Emails', () => {
  it('should send processing email', async () => {
    const emailData = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      orderNumber: 'ORD-12345',
      orderDate: '2025-01-10T10:00:00Z',
      orderItems: [],
      shippingAddress: { /* ... */ },
      subtotal: 100,
      shippingCost: 10,
      tax: 21,
      total: 131,
      paymentMethod: 'credit_card',
      locale: 'en'
    }
    
    const result = await sendOrderStatusEmail(emailData, 'order_processing')
    
    expect(result.success).toBe(true)
    expect(result.emailLogId).toBeDefined()
  })
  
  it('should include tracking info in shipped email', async () => {
    const emailData = {
      // ... base data
      trackingNumber: '1Z999AA10123456784',
      carrier: 'ups',
      trackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784'
    }
    
    const result = await sendOrderStatusEmail(emailData, 'order_shipped')
    
    expect(result.success).toBe(true)
  })
})
```

## Common Patterns

### Pattern 1: Status Update with Email
Always update order status first, then send email:

```typescript
// 1. Update database
await supabase.from('orders').update({ status: 'shipped' }).eq('id', orderId)

// 2. Fetch updated order
const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()

// 3. Send email
await sendOrderStatusEmail(emailData, 'order_shipped')
```

### Pattern 2: Graceful Email Failure
Don't fail the entire operation if email fails:

```typescript
try {
  await sendOrderStatusEmail(emailData, 'order_shipped')
} catch (emailError) {
  console.error('Email failed but order was updated:', emailError)
  // Log error but don't throw
}
```

### Pattern 3: Batch Status Updates
When updating multiple orders:

```typescript
const orders = await fetchOrdersToUpdate()

for (const order of orders) {
  try {
    await updateOrderStatus(order.id, 'shipped')
    await sendOrderStatusEmail(/* ... */, 'order_shipped')
  } catch (error) {
    console.error(`Failed to process order ${order.id}:`, error)
    // Continue with next order
  }
}
```

## Troubleshooting

### Email Not Sending
1. Check email logs in database
2. Verify customer email address is valid
3. Check Resend API key configuration
4. Review email service logs

### Wrong Language
1. Verify customer's preferred_locale in profile
2. Check locale parameter in emailData
3. Ensure translations exist for locale

### Tracking Link Not Working
1. Verify tracking number format
2. Check carrier name matches supported carriers
3. Validate tracking URL generation
4. Test tracking URL manually

### Template Not Rendering
1. Check for syntax errors in template
2. Verify all required data fields are present
3. Test template with sample data
4. Review browser console for errors
