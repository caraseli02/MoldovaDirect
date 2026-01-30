<template>
  <div
    class="p-4 border rounded-lg cursor-pointer transition-all"
    :class="selected
      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
    @click="$emit('select', method.id)"
  >
    <div class="flex items-start gap-3">
      <UiRadioGroupItem
        :id="`ship-${method.id}`"
        :value="method.id"
        class="mt-0.5 flex-shrink-0 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100"
      />

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white">
            {{ method.name }}
          </h4>
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Free shipping badge -->
            <span
              v-if="method.price === 0"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              {{ $t('checkout.shippingMethod.free.label') }}
            </span>

            <!-- Express shipping badge -->
            <span
              v-else-if="method.estimatedDays <= 2"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
            >
              {{ $t('checkout.shippingMethod.express.label') }}
            </span>

            <!-- Price -->
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ formatPrice(method.price) }}
            </span>
          </div>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ method.description }}
        </p>

        <!-- Delivery estimate -->
        <div class="flex items-center gap-1.5 mt-2">
          <svg
            class="w-4 h-4 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ getDeliveryEstimate(method.estimatedDays) }}
          </span>
        </div>

        <!-- Special conditions -->
        <p
          v-if="getMethodConditions()"
          class="text-xs text-gray-500 dark:text-gray-400 italic mt-2"
        >
          {{ getMethodConditions() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShippingMethod } from '~/types/checkout'

interface Props {
  method: ShippingMethod
  selected: boolean
  currency: string
}

interface Emits {
  (e: 'select', id: string): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const { locale, t } = useI18n()

const formatPrice = (price: number): string => {
  if (price === 0) return t('checkout.freeShipping', 'Free')
  return new Intl.NumberFormat(locale.value || 'en-US', {
    style: 'currency',
    currency: props.currency || 'EUR',
  }).format(price)
}

const getDeliveryEstimate = (days: number): string => {
  const today = new Date()
  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + days)

  if (days === 1) {
    return t('checkout.shippingMethod.deliveryTomorrow', 'Delivery tomorrow')
  }
  else if (days <= 3) {
    const dayName = deliveryDate.toLocaleDateString(locale.value, { weekday: 'long' })
    return t('checkout.shippingMethod.deliveryBy', { day: dayName }, `Delivery by ${dayName}`)
  }
  else {
    return t('checkout.shippingMethod.deliveryInDays', { days }, `Delivery in ${days} business days`)
  }
}

const getMethodConditions = (): string => {
  if (props.method.id === 'free' && props.method.price === 0) {
    return t('checkout.shippingMethod.conditions.freeOver50', 'Available for orders over €50')
  }
  else if (props.method.id === 'express') {
    return t('checkout.shippingMethod.conditions.expressBefore2pm', 'Order before 2 PM for next-day delivery')
  }
  return ''
}
</script>
