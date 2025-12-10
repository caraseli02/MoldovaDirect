<template>
  <div>
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center min-h-96"
    >
      <commonIcon
        name="lucide:loader-2"
        class="h-12 w-12 animate-spin text-primary"
      />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="text-center py-12"
    >
      <commonIcon
        name="lucide:alert-circle"
        class="h-12 w-12 text-red-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Order not found
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        The order you're looking for doesn't exist or has been deleted.
      </p>
      <Button as-child>
        <nuxt-link to="/admin/orders">
          <commonIcon
            name="lucide:arrow-left"
            class="h-4 w-4 mr-2"
          />
          Back to Orders
        </nuxt-link>
      </Button>
    </div>

    <!-- Order Detail -->
    <div v-else-if="order">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              as-child
            >
              <nuxt-link to="/admin/orders">
                <commonIcon
                  name="lucide:arrow-left"
                  class="h-5 w-5"
                />
              </nuxt-link>
            </Button>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                Order #{{ order.order_number }}
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                Placed {{ formatDate(order.created_at) }}
              </p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center space-x-2">
            <AdminOrdersStatusBadge :status="order.status" />
            <Badge :variant="getPaymentStatusVariant(order.payment_status)">
              {{ getPaymentStatusLabel(order.payment_status) }}
            </Badge>
            <AdminOrdersStatusUpdateDialog
              :order-id="order.id"
              :order-number="order.order_number"
              :current-status="order.status"
              @updated="handleStatusUpdated"
            />
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Order Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Items -->
          <AdminOrdersItemsList :items="order.order_items" />

          <!-- Fulfillment Checklist -->
          <AdminOrdersFulfillmentChecklist
            v-if="order.status === 'pending' || order.status === 'processing' || order.fulfillmentTasks && order.fulfillmentTasks.length > 0"
            :order-id="order.id"
            :current-status="order.status"
            :fulfillment-tasks="order.fulfillmentTasks"
            @updated="handleFulfillmentUpdated"
          />

          <!-- Order Notes -->
          <AdminOrdersNotesSection
            :order-id="order.id"
            :notes="order.notes || []"
            @updated="handleNotesUpdated"
          />

          <!-- Order Timeline -->
          <AdminOrdersTimeline
            :status-history="order.statusHistory"
            :order-notes="order.notes"
            :order-created-at="order.created_at"
            :order-status="order.status"
          />
        </div>

        <!-- Right Column - Customer & Shipping Info -->
        <div class="space-y-6">
          <!-- Order Summary -->
          <AdminOrdersDetailsCard :order="order" />

          <!-- Customer Information -->
          <Card class="rounded-2xl">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </p>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ order.customer?.name || 'Guest Customer' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ order.customer?.email || order.guest_email || 'N/A' }}
                  </p>
                </div>
                <div v-if="order.customer?.phone">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ order.customer.phone }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Shipping Address -->
          <Card
            v-if="order.shipping_address"
            class="rounded-2xl"
          >
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-gray-900 dark:text-white space-y-1">
                <p>{{ order.shipping_address.street }}</p>
                <p>{{ order.shipping_address.city }}, {{ order.shipping_address.postalCode }}</p>
                <p v-if="order.shipping_address.province">
                  {{ order.shipping_address.province }}
                </p>
                <p>{{ order.shipping_address.country }}</p>
              </div>
            </CardContent>
          </Card>

          <!-- Billing Address -->
          <Card
            v-if="order.billing_address"
            class="rounded-2xl"
          >
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-gray-900 dark:text-white space-y-1">
                <p>{{ order.billing_address.street }}</p>
                <p>{{ order.billing_address.city }}, {{ order.billing_address.postalCode }}</p>
                <p v-if="order.billing_address.province">
                  {{ order.billing_address.province }}
                </p>
                <p>{{ order.billing_address.country }}</p>
              </div>
            </CardContent>
          </Card>

          <!-- Payment Details -->
          <Card class="rounded-2xl">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Payment Method
                  </p>
                  <p class="text-sm text-gray-900 dark:text-white capitalize">
                    {{ order.payment_method }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Payment Status
                  </p>
                  <Badge
                    :variant="getPaymentStatusVariant(order.payment_status)"
                    class="mt-1"
                  >
                    {{ getPaymentStatusLabel(order.payment_status) }}
                  </Badge>
                </div>
                <div v-if="order.payment_intent_id">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Payment Intent ID
                  </p>
                  <p class="text-xs text-gray-600 dark:text-gray-300 font-mono">
                    {{ order.payment_intent_id }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Tracking Information (if available) -->
          <Card
            v-if="order.tracking_number"
            class="rounded-2xl"
          >
            <CardHeader>
              <CardTitle>Tracking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div v-if="order.carrier">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Carrier
                  </p>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ order.carrier }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tracking Number
                  </p>
                  <p class="text-sm text-gray-900 dark:text-white font-mono">
                    {{ order.tracking_number }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Customer Notes (if available) -->
          <Card
            v-if="order.customer_notes"
            class="rounded-2xl"
          >
            <CardHeader>
              <CardTitle>Customer Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ order.customer_notes }}
              </p>
            </CardContent>
          </Card>

          <!-- Admin Notes (if available) -->
          <Card
            v-if="order.admin_notes"
            class="rounded-2xl"
          >
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ order.admin_notes }}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { OrderWithAdminDetailsRaw } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

// Lazy load admin order detail components to reduce main bundle size
const AdminOrdersStatusBadge = useAsyncAdminComponent('Orders/StatusBadge')
const AdminOrdersStatusUpdateDialog = useAsyncAdminComponent('Orders/StatusUpdateDialog')
const AdminOrdersItemsList = useAsyncAdminComponent('Orders/ItemsList')
const AdminOrdersFulfillmentChecklist = useAsyncAdminComponent('Orders/FulfillmentChecklist')
const AdminOrdersNotesSection = useAsyncAdminComponent('Orders/NotesSection')
const AdminOrdersTimeline = useAsyncAdminComponent('Orders/Timeline')
const AdminOrdersDetailsCard = useAsyncAdminComponent('Orders/DetailsCard')

// Get order ID from route
const route = useRoute()
const orderId = route.params.id as string

// State
const loading = ref(true)
const error = ref(false)
const order = ref<OrderWithAdminDetailsRaw | null>(null)

// Fetch order data
const fetchOrder = async () => {
  try {
    loading.value = true
    error.value = false

    const response = await $fetch<{
      success: boolean
      data: OrderWithAdminDetailsRaw
    }>(`/api/admin/orders/${orderId}`)

    if (response.success) {
      order.value = response.data
    }
    else {
      error.value = true
    }
  }
  catch (err) {
    console.error('Error fetching order:', err)
    error.value = true
  }
  finally {
    loading.value = false
  }
}

// Handle status update
const handleStatusUpdated = async (data: { status: string, trackingNumber?: string, carrier?: string }) => {
  // Refresh order data to get updated information
  await fetchOrder()
}

// Handle fulfillment task update
const handleFulfillmentUpdated = async () => {
  // Refresh order data to get updated fulfillment progress
  await fetchOrder()
}

// Handle notes update
const handleNotesUpdated = async () => {
  // Refresh order data to get updated notes
  await fetchOrder()
}

// Real-time updates
const { subscribeToOrder, unsubscribe, isSubscribed } = useAdminOrderRealtime({
  onOrderUpdated: async (update: any) => {
    // Refresh order data when updated
    await fetchOrder()
  },
  onOrderStatusChanged: async (update: any) => {
    // Refresh order data when status changes
    await fetchOrder()
  },
  onConflict: (orderId: number, message: string) => {
    // Show warning when order was modified by another admin
    console.warn('Order conflict detected:', orderId, message)
  },
})

onMounted(async () => {
  await fetchOrder()

  // Subscribe to real-time updates for this order
  if (order.value) {
    subscribeToOrder(order.value.id)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  unsubscribe()
})

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  }
  return labels[status] || status
}

const getPaymentStatusVariant = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    paid: 'default',
    failed: 'destructive',
    refunded: 'secondary',
  }
  return variants[status] || 'secondary'
}

// SEO
useHead({
  title: computed(() => {
    return order.value
      ? `Order #${order.value.order_number} - Admin - Moldova Direct`
      : 'Order Details - Admin - Moldova Direct'
  }),
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
})
</script>
