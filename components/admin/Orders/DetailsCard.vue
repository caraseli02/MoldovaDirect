<template>
  <UiCard class="rounded-2xl">
    <UiCardHeader>
      <UiCardTitle>Order Summary</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <div class="space-y-4">
        <!-- Order Totals -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span class="text-gray-900 dark:text-white">€{{ formatPrice(order.subtotal_eur) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Shipping</span>
            <span class="text-gray-900 dark:text-white">€{{ formatPrice(order.shipping_cost_eur) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Tax</span>
            <span class="text-gray-900 dark:text-white">€{{ formatPrice(order.tax_eur) }}</span>
          </div>
          <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <div class="flex justify-between">
              <span class="text-base font-semibold text-gray-900 dark:text-white">Total</span>
              <span class="text-base font-bold text-gray-900 dark:text-white">€{{ formatPrice(order.total_eur) }}</span>
            </div>
          </div>
        </div>

        <!-- Order Metadata -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Order Number
            </p>
            <p class="text-sm text-gray-900 dark:text-white font-mono">
              {{ order.order_number }}
            </p>
          </div>

          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Order Date
            </p>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ formatDate(order.created_at) }}
            </p>
          </div>

          <div v-if="order.updated_at && order.updated_at !== order.created_at">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Last Updated
            </p>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ formatDate(order.updated_at) }}
            </p>
          </div>

          <div v-if="order.shipped_at">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Shipped Date
            </p>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ formatDate(order.shipped_at) }}
            </p>
          </div>

          <div v-if="order.delivered_at">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Delivered Date
            </p>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ formatDate(order.delivered_at) }}
            </p>
          </div>

          <div v-if="order.estimated_ship_date">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Estimated Ship Date
            </p>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ formatDate(order.estimated_ship_date) }}
            </p>
          </div>

          <div v-if="order.priority_level">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Priority Level
            </p>
            <div class="flex items-center space-x-2 mt-1">
              <UiBadge :variant="getPriorityVariant(order.priority_level)">
                {{ getPriorityLabel(order.priority_level) }}
              </UiBadge>
            </div>
          </div>

          <div v-if="order.fulfillment_progress !== undefined && order.fulfillment_progress !== null">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Fulfillment Progress
            </p>
            <div class="mt-2">
              <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>{{ order.fulfillment_progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${order.fulfillment_progress}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Item Count -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
            </span>
          </div>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { OrderWithAdminDetailsRaw } from '~/types/database'

interface Props {
  order: OrderWithAdminDetailsRaw
}

const props = defineProps<Props>()

// Computed properties
const itemCount = computed(() => {
  return props.order.order_items?.length || 0
})

// Utility functions
const formatPrice = (price: number) => {
  return Number(price).toFixed(2)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getPriorityLabel = (priority: number) => {
  if (priority >= 3) return 'High Priority'
  if (priority === 2) return 'Medium Priority'
  return 'Normal Priority'
}

const getPriorityVariant = (priority: number) => {
  if (priority >= 3) return 'destructive'
  if (priority === 2) return 'default'
  return 'secondary'
}
</script>
