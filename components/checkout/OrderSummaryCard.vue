<template>
  <div class="order-summary-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('common.orderSummary') }}
        </h3>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ items.length }} {{ items.length === 1 ? $t('common.item', 'item') : $t('common.items', 'items') }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="p-6"
    >
      <div class="animate-pulse space-y-4">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div class="h-px bg-gray-200 dark:bg-gray-700"></div>
        <div class="space-y-2">
          <div class="flex justify-between">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div
      v-else
      class="p-6"
    >
      <!-- Cart Items (Collapsed by default) -->
      <div class="mb-4">
        <button
          class="w-full flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          @click="showItems = !showItems"
        >
          <span>{{ showItems ? $t('checkout.hideItems', 'Hide items') : $t('checkout.showItems', 'Show items') }}</span>
          <svg
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': showItems }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          v-show="showItems"
          class="mt-3 space-y-3 max-h-64 overflow-y-auto"
        >
          <div
            v-for="item in items"
            :key="item.productId"
            class="flex items-center space-x-3"
          >
            <div class="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                v-if="item.images?.[0]"
                :src="item.images[0]"
                :alt="getItemName(item)"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ getItemName(item) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ $t('common.quantity') }}: {{ item.quantity }}
              </p>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatPrice(item.price * item.quantity) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Pricing Breakdown -->
      <div class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <!-- Subtotal -->
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">{{ $t('common.subtotal') }}</span>
          <span class="text-gray-900 dark:text-white">{{ formatPrice(subtotal) }}</span>
        </div>

        <!-- Shipping -->
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            {{ $t('common.shipping') }}
            <span
              v-if="shippingMethod"
              class="text-xs text-gray-500"
            >
              ({{ shippingMethod.name }})
            </span>
          </span>
          <span class="text-gray-900 dark:text-white">
            <template v-if="shippingCost === 0">
              <span class="text-green-600 dark:text-green-400">{{ $t('checkout.freeShipping', 'Free') }}</span>
            </template>
            <template v-else-if="shippingCost > 0">
              {{ formatPrice(shippingCost) }}
            </template>
            <template v-else>
              <span class="text-gray-400">{{ $t('checkout.calculatedAtNextStep', 'Calculated') }}</span>
            </template>
          </span>
        </div>

        <!-- Tax -->
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">{{ $t('common.tax') }}</span>
          <span class="text-gray-900 dark:text-white">{{ formatPrice(tax) }}</span>
        </div>
      </div>

      <!-- Total -->
      <div class="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <span class="text-base font-semibold text-gray-900 dark:text-white">
            {{ $t('common.total') }}
          </span>
          <span class="text-xl font-bold text-gray-900 dark:text-white">
            {{ formatPrice(total) }}
          </span>
        </div>
      </div>

      <!-- Shipping Estimate (if method selected) -->
      <div
        v-if="shippingMethod?.estimatedDays"
        class="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
      >
        <div class="flex items-center text-sm text-primary-700 dark:text-primary-300">
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            {{ $t('checkout.estimatedDelivery', 'Estimated delivery') }}:
            <strong>{{ getEstimatedDeliveryDate() }}</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- Trust Footer -->
    <div class="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        <span class="flex items-center">
          <svg
            class="w-3 h-3 mr-1 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clip-rule="evenodd"
            />
          </svg>
          {{ $t('checkout.secure', 'Secure') }}
        </span>
        <span class="flex items-center">
          <svg
            class="w-3 h-3 mr-1 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ $t('checkout.guaranteed', 'Guaranteed') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShippingMethod } from '~/types/checkout'

interface CartItem {
  productId: string
  name: string | Record<string, string>
  quantity: number
  price: number
  images?: readonly string[]
}

const props = defineProps<{
  items: readonly CartItem[]
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  shippingMethod?: ShippingMethod | null
  loading?: boolean
}>()

const { locale } = useI18n()

const showItems = ref(false)

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const getItemName = (item: CartItem): string => {
  if (typeof item.name === 'string') {
    return item.name
  }
  // Handle i18n object
  return item.name[locale.value] || item.name.en || item.name.es || Object.values(item.name)[0] || 'Product'
}

const getEstimatedDeliveryDate = (): string => {
  if (!props.shippingMethod?.estimatedDays) return ''

  const date = new Date()
  date.setDate(date.getDate() + props.shippingMethod.estimatedDays)

  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
</script>

<style scoped>
.order-summary-card {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
</style>
