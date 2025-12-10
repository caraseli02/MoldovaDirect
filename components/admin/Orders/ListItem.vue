<template>
  <TableRow
    class="hover:bg-gray-50 dark:hover:bg-gray-700"
    :class="{ 'bg-blue-50 dark:bg-blue-900/20': isSelected }"
  >
    <!-- Selection Checkbox -->
    <TableCell class="w-12">
      <input
        type="checkbox"
        :checked="isSelected"
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
        @change="$emit('toggle-selection', order.id)"
      />
    </TableCell>

    <!-- Order Number -->
    <TableCell class="font-medium">
      <nuxt-link
        :to="`/admin/orders/${order.id}`"
        class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
      >
        #{{ order.order_number }}
      </nuxt-link>
    </TableCell>

    <!-- Customer -->
    <TableCell>
      <div class="flex flex-col">
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {{ customerName }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ customerEmail }}
        </span>
      </div>
    </TableCell>

    <!-- Date -->
    <TableCell class="text-sm text-gray-600 dark:text-gray-300">
      {{ formatDate(order.created_at) }}
      <div class="text-xs text-gray-500 dark:text-gray-400">
        {{ daysSinceOrder }} {{ daysSinceOrder === 1 ? 'day' : 'days' }} ago
      </div>
    </TableCell>

    <!-- Items -->
    <TableCell class="text-sm text-gray-600 dark:text-gray-300">
      {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
    </TableCell>

    <!-- Total -->
    <TableCell class="font-medium text-gray-900 dark:text-white">
      €{{ formatPrice(order.total_eur) }}
    </TableCell>

    <!-- Status -->
    <TableCell>
      <AdminOrdersStatusBadge :status="order.status" />
    </TableCell>

    <!-- Payment Status -->
    <TableCell>
      <Badge :variant="getPaymentStatusVariant(order.payment_status)">
        {{ getPaymentStatusLabel(order.payment_status) }}
      </Badge>
    </TableCell>

    <!-- Actions -->
    <TableCell>
      <div class="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          as-child
        >
          <nuxt-link
            :to="`/admin/orders/${order.id}`"
            title="View Order"
          >
            <commonIcon
              name="lucide:eye"
              class="h-4 w-4"
            />
          </nuxt-link>
        </Button>
      </div>
    </TableCell>
  </TableRow>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import type { OrderWithAdminDetailsRaw } from '~/types/database'

interface Props {
  order: OrderWithAdminDetailsRaw
  isSelected?: boolean
}

interface Emits {
  (e: 'toggle-selection', orderId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties
const customerName = computed(() => {
  return 'Guest Customer'
})

const customerEmail = computed(() => {
  return props.order.guest_email || 'guest@example.com'
})

const itemCount = computed(() => {
  return props.order.order_items?.length || 0
})

const daysSinceOrder = computed(() => {
  const orderDate = new Date(props.order.created_at)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - orderDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatPrice = (price: number) => {
  return Number(price).toFixed(2)
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
</script>
