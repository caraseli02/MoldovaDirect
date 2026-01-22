<template>
  <UiTableRow
    class="hover:bg-gray-50 dark:hover:bg-gray-700"
    :class="{ 'bg-blue-50 dark:bg-blue-900/20': isSelected }"
  >
    <!-- Selection Checkbox -->
    <UiTableCell class="w-12">
      <UiInput
        type="checkbox"
        :checked="isSelected"
        @change="$emit('toggle-selection', order.id)"
      />
    </UiTableCell>

    <!-- Order Number -->
    <UiTableCell class="font-medium">
      <nuxt-link
        :to="`/admin/orders/${order.id}`"
        class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
      >
        #{{ order.order_number }}
      </nuxt-link>
    </UiTableCell>

    <!-- Customer -->
    <UiTableCell>
      <div class="flex flex-col">
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {{ customerName }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ customerEmail }}
        </span>
      </div>
    </UiTableCell>

    <!-- Date -->
    <UiTableCell class="text-sm text-gray-600 dark:text-gray-300">
      {{ formatDate(order.created_at) }}
      <div class="text-xs text-gray-500 dark:text-gray-400">
        {{ daysSinceOrder }} {{ daysSinceOrder === 1 ? 'day' : 'days' }} ago
      </div>
    </UiTableCell>

    <!-- Items -->
    <UiTableCell class="text-sm text-gray-600 dark:text-gray-300">
      {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
    </UiTableCell>

    <!-- Total -->
    <UiTableCell class="font-medium text-gray-900 dark:text-white">
      €{{ formatPrice(order.total_eur) }}
    </UiTableCell>

    <!-- Status -->
    <UiTableCell>
      <AdminOrdersStatusBadge :status="order.status" />
    </UiTableCell>

    <!-- Payment Status -->
    <UiTableCell>
      <UiBadge :variant="getPaymentStatusVariant(order.payment_status || '')">
        {{ getPaymentStatusLabel(order.payment_status || '') }}
      </UiBadge>
    </UiTableCell>

    <!-- Actions -->
    <UiTableCell>
      <div class="flex items-center space-x-2">
        <UiButton>
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
        </UiButton>
      </div>
    </UiTableCell>
  </UiTableRow>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import type { OrderWithAdminDetailsRaw } from '~/types/database'

interface Props {
  order: Partial<OrderWithAdminDetailsRaw> & {
    id: number
    created_at: string
    total_eur: number
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  }
  isSelected?: boolean
}

interface Emits {
  (e: 'toggle-selection', orderId: number): void
}

const _props = defineProps<Props>()
const _emit = defineEmits<Emits>()

// Computed properties
const customerName = computed(() => {
  return 'Guest Customer'
})

const customerEmail = computed(() => {
  return _props.order.guest_email || ''
})

const itemCount = computed(() => {
  return _props.order.order_items?.length || 0
})

const daysSinceOrder = computed(() => {
  const orderDate = new Date(_props.order.created_at)
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
