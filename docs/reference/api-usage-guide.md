# Order History API Usage Guide


## Quick Reference for Frontend Integration

### 1. Fetching Orders with Filters

```typescript
// Basic order list
const { data } = await $fetch('/api/orders', {
  headers: {
    authorization: `Bearer ${token}`
  },
  query: {
    page: 1,
    limit: 10
  }
})

// With filters
const { data } = await $fetch('/api/orders', {
  headers: {
    authorization: `Bearer ${token}`
  },
  query: {
    page: 1,
    limit: 10,
    status: 'shipped',
    search: 'wine',
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
    minAmount: 50,
    maxAmount: 200,
    sortBy: 'created_at',
    sortOrder: 'desc'
  }
})
```

### 2. Getting Order Tracking

```typescript
// Get tracking information
const { data } = await $fetch(`/api/orders/${orderId}/tracking`, {
  headers: {
    authorization: `Bearer ${token}`
  }
})

// Response includes:
// - trackingNumber
// - carrier
// - estimatedDelivery
// - events (array of tracking events)
// - lastUpdate
```

### 3. Reordering Items

```typescript
// Add all items from previous order to cart
const { data } = await $fetch(`/api/orders/${orderId}/reorder`, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${token}`
  }
})

// Response includes:
// - itemsAdded: number of items successfully added
// - validationResults: array with status of each item
//   - success: item added
//   - unavailable: product no longer available
//   - out_of_stock: product out of stock
//   - adjusted: quantity reduced due to stock
```

### 4. Initiating a Return

```typescript
// Create return request
const { data } = await $fetch(`/api/orders/${orderId}/return`, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${token}`
  },
  body: {
    items: [
      {
        orderItemId: 123,
        quantity: 1,
        reason: 'Product damaged'
      },
      {
        orderItemId: 124,
        quantity: 2,
        reason: 'Wrong size'
      }
    ],
    additionalNotes: 'Package arrived damaged'
  }
})

// Response includes:
// - returnId
// - status: 'pending'
// - estimatedRefund
// - nextSteps: array of instructions
```

### 5. Creating Support Ticket

```typescript
// Create support ticket for order
const { data } = await $fetch(`/api/orders/${orderId}/support`, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${token}`
  },
  body: {
    subject: 'Question about delivery',
    category: 'shipping', // order_status, shipping, product_issue, payment, return, other
    message: 'When will my order arrive?',
    priority: 'medium' // low, medium, high (optional)
  }
})

// Response includes:
// - ticketId
// - ticketNumber
// - expectedResponseTime
// - contactMethods
```

## Admin Endpoints

### Update Tracking Information

```typescript
// Update order tracking (admin only)
const { data } = await $fetch(`/api/orders/${orderId}/tracking`, {
  method: 'PUT',
  headers: {
    authorization: `Bearer ${adminToken}`
  },
  body: {
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
    estimatedDelivery: '2024-12-25T00:00:00Z',
    status: 'shipped'
  }
})
```

### Add Tracking Event

```typescript
// Add tracking event (admin only)
const { data } = await $fetch(`/api/orders/${orderId}/tracking`, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${adminToken}`
  },
  body: {
    status: 'in_transit',
    location: 'Distribution Center - New York',
    description: 'Package arrived at distribution center',
    timestamp: '2024-12-20T10:30:00Z' // optional
  }
})
```

### Sync Tracking from Carrier

```typescript
// Sync tracking from carrier API (admin only)
const { data } = await $fetch(`/api/orders/${orderId}/sync-tracking`, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${adminToken}`
  }
})
```

## Error Handling

All endpoints return consistent error responses:

```typescript
try {
  const { data } = await $fetch('/api/orders/123/reorder', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` }
  })
} catch (error) {
  if (error.statusCode === 401) {
    // Redirect to login
  } else if (error.statusCode === 404) {
    // Order not found
  } else if (error.statusCode === 400) {
    // Validation error - check error.data for details
    console.log(error.data.validationResults)
  } else {
    // Generic error
    console.error(error.statusMessage)
  }
}
```

## Composable Integration Examples

### useOrders Composable

```typescript
// In composables/useOrders.ts
export const useOrders = () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const filters = ref({})

  const fetchOrders = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch('/api/orders', {
        headers: {
          authorization: `Bearer ${useAuth().token.value}`
        },
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          ...filters.value,
          ...params
        }
      })
      
      orders.value = data.orders
      pagination.value = data.pagination
    } catch (e) {
      error.value = e.statusMessage
    } finally {
      loading.value = false
    }
  }

  const searchOrders = async (query) => {
    filters.value.search = query
    pagination.value.page = 1
    await fetchOrders()
  }

  const filterByStatus = async (status) => {
    filters.value.status = status
    pagination.value.page = 1
    await fetchOrders()
  }

  return {
    orders,
    loading,
    error,
    pagination,
    filters,
    fetchOrders,
    searchOrders,
    filterByStatus
  }
}
```

### useOrderActions Composable

```typescript
// In composables/useOrderActions.ts
export const useOrderActions = () => {
  const loading = ref(false)
  const error = ref(null)

  const reorder = async (orderId) => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch(`/api/orders/${orderId}/reorder`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${useAuth().token.value}`
        }
      })
      
      // Show success message
      useToast().success(`${data.itemsAdded} items added to cart`)
      
      // Navigate to cart
      navigateTo('/cart')
      
      return data
    } catch (e) {
      error.value = e.statusMessage
      useToast().error(e.statusMessage)
      throw e
    } finally {
      loading.value = false
    }
  }

  const initiateReturn = async (orderId, returnData) => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${useAuth().token.value}`
        },
        body: returnData
      })
      
      useToast().success('Return request submitted successfully')
      
      return data
    } catch (e) {
      error.value = e.statusMessage
      useToast().error(e.statusMessage)
      throw e
    } finally {
      loading.value = false
    }
  }

  const contactSupport = async (orderId, ticketData) => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch(`/api/orders/${orderId}/support`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${useAuth().token.value}`
        },
        body: ticketData
      })
      
      useToast().success('Support ticket created successfully')
      
      return data
    } catch (e) {
      error.value = e.statusMessage
      useToast().error(e.statusMessage)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    reorder,
    initiateReturn,
    contactSupport
  }
}
```

## Filter Options Reference

### Status Values
- `pending` - Order received, awaiting processing
- `processing` - Order is being prepared
- `shipped` - Order has been shipped
- `delivered` - Order has been delivered
- `cancelled` - Order was cancelled

### Sort Fields
- `created_at` - Order creation date (default)
- `total_eur` - Order total amount
- `status` - Order status
- `order_number` - Order number

### Sort Orders
- `asc` - Ascending
- `desc` - Descending (default)

### Support Categories
- `order_status` - Questions about order status
- `shipping` - Shipping and delivery questions
- `product_issue` - Product quality or issues
- `payment` - Payment and billing questions
- `return` - Return and refund questions
- `other` - Other inquiries

### Return Reasons (Common)
- Product damaged
- Wrong item received
- Wrong size/color
- Not as described
- Changed mind
- Quality issues
- Defective product
