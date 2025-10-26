<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-96">
      <commonIcon name="lucide:loader-2" class="h-12 w-12 animate-spin text-primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <commonIcon name="lucide:alert-circle" class="h-12 w-12 text-red-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Order not found</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        The order you're looking for doesn't exist or has been deleted.
      </p>
      <Button as-child>
        <nuxt-link to="/admin/orders">
          <commonIcon name="lucide:arrow-left" class="h-4 w-4 mr-2" />
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
                <commonIcon name="lucide:arrow-left" class="h-5 w-5" />
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

          <!-- Order Timeline (if status history exists) -->
          <Card v-if="order.statusHistory && order.statusHistory.length > 0" class="rounded-2xl">
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="(history, index) in order.statusHistory"
                  :key="history.id"
                  class="flex items-start space-x-3"
                >
                  <div class="flex-shrink-0">
                    <div
                      :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        index === 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                      ]"
                    >
                      <commonIcon
                        :name="getStatusIcon(history.toStatus)"
                        :class="[
                          'h-4 w-4',
                          index === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                        ]"
                      />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      Status changed to {{ getStatusLabel(history.toStatus) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(history.changedAt) }}
                    </p>
                    <p v-if="history.notes" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {{ history.notes }}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ order.customer?.name || 'Guest Customer' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ order.customer?.email || order.guestEmail || 'N/A' }}
                  </p>
                </div>
                <div v-if="order.customer?.phone">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ order.customer.phone }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Shipping Address -->
          <Card v-if="order.shipping_address" class="rounded-2xl">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-gray-900 dark:text-white space-y-1">
                <p>{{ order.shipping_address.street }}</p>
                <p>{{ order.shipping_address.city }}, {{ order.shipping_address.postalCode }}</p>
                <p v-if="order.shipping_address.province">{{ order.shipping_address.province }}</p>
                <p>{{ order.shipping_address.country }}</p>
              </div>
            </CardContent>
          </Card>

          <!-- Billing Address -->
          <Card v-if="order.billing_address" class="rounded-2xl">
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-gray-900 dark:text-white space-y-1">
                <p>{{ order.billing_address.street }}</p>
                <p>{{ order.billing_address.city }}, {{ order.billing_address.postalCode }}</p>
                <p v-if="order.billing_address.province">{{ order.billing_address.province }}</p>
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
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p class="text-sm text-gray-900 dark:text-white capitalize">
                    {{ order.payment_method }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</p>
                  <Badge :variant="getPaymentStatusVariant(order.payment_status)" class="mt-1">
                    {{ getPaymentStatusLabel(order.payment_status) }}
                  </Badge>
                </div>
                <div v-if="order.payment_intent_id">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Intent ID</p>
                  <p class="text-xs text-gray-600 dark:text-gray-300 font-mono">
                    {{ order.payment_intent_id }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Tracking Information (if available) -->
          <Card v-if="order.tracking_number" class="rounded-2xl">
            <CardHeader>
              <CardTitle>Tracking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div v-if="order.carrier">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Carrier</p>
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ order.carrier }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tracking Number</p>
                  <p class="text-sm text-gray-900 dark:text-white font-mono">
                    {{ order.tracking_number }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Customer Notes (if available) -->
          <Card v-if="order.customer_notes" class="rounded-2xl">
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
          <Card v-if="order.admin_notes" class="rounded-2xl">
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
  CardTitle
} from '@/components/ui/card'
import type { OrderWithAdminDetails } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Get order ID from route
const route = useRoute()
const orderId = route.params.id as string

// State
const loading = ref(true)
const error = ref(false)
const order = ref<OrderWithAdminDetails | null>(null)

// Fetch order data
const fetchOrder = async () => {
  try {
    loading.value = true
    error.value = false

    const response = await $fetch<{
      success: boolean
      data: OrderWithAdminDetails
    }>(`/api/admin/orders/${orderId}`)

    if (response.success) {
      order.value = response.data
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('Error fetching order:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// Handle status update
const handleStatusUpdated = async (data: { status: string, trackingNumber?: string, carrier?: string }) => {
  // Refresh order data to get updated information
  await fetchOrder()
}

onMounted(async () => {
  await fetchOrder()
})

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded'
  }
  return labels[status] || status
}

const getPaymentStatusVariant = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    paid: 'default',
    failed: 'destructive',
    refunded: 'secondary'
  }
  return variants[status] || 'secondary'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    pending: 'lucide:clock',
    processing: 'lucide:loader',
    shipped: 'lucide:truck',
    delivered: 'lucide:check-circle',
    cancelled: 'lucide:x-circle'
  }
  return icons[status] || 'lucide:circle'
}

// SEO
useHead({
  title: computed(() => {
    return order.value
      ? `Order #${order.value.orderNumber} - Admin - Moldova Direct`
      : 'Order Details - Admin - Moldova Direct'
  }),
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})
</script>
