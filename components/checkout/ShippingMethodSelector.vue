<template>
  <div class="shipping-method-selector">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ $t('checkout.shippingMethod.title') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('checkout.shippingMethod.subtitle') }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <div class="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
              <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shipping Methods -->
    <div v-else-if="availableMethods.length > 0" class="space-y-3">
      <div v-for="method in availableMethods" :key="method.id" class="relative">
        <label
          class="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          :class="selectedMethodId === method.id
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
            : 'border-gray-200 dark:border-gray-600'">
          <input type="radio" :name="'shipping-method'" :value="method.id" v-model="selectedMethodId"
            class="mt-1 text-primary-600 focus:ring-primary-500 border-gray-300" />

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ method.name }}
              </h4>
              <div class="flex items-center space-x-2">
                <!-- Free shipping badge -->
                <span v-if="method.price === 0"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {{ $t('checkout.shippingMethod.free') }}
                </span>

                <!-- Express shipping badge -->
                <span v-else-if="method.estimatedDays <= 2"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {{ $t('checkout.shippingMethod.express') }}
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
            <div class="flex items-center space-x-2 mt-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ getDeliveryEstimate(method.estimatedDays) }}
              </span>
            </div>

            <!-- Special conditions -->
            <div v-if="getMethodConditions(method)" class="mt-2">
              <p class="text-xs text-gray-500 dark:text-gray-400 italic">
                {{ getMethodConditions(method) }}
              </p>
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- No Methods Available -->
    <div v-else class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ $t('checkout.shippingMethod.noMethods') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('checkout.shippingMethod.noMethodsDescription') }}
      </p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            {{ $t('checkout.shippingMethod.error') }}
          </h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">
            {{ error }}
          </p>
          <div class="mt-3">
            <button @click="$emit('retry')"
              class="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 underline">
              {{ $t('common.retry') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Validation Error -->
    <p v-if="validationError" class="mt-2 text-sm text-red-600 dark:text-red-400">
      {{ validationError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ShippingMethod } from '~/stores/checkout'

interface Props {
  modelValue: ShippingMethod | null
  availableMethods: ShippingMethod[]
  loading?: boolean
  error?: string | null
  validationError?: string | null
}

interface Emits {
  (e: 'update:modelValue', value: ShippingMethod | null): void
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  validationError: null
})

const emit = defineEmits<Emits>()

// Local state - use computed instead of ref + watcher to avoid recursion
const selectedMethodId = computed({
  get: () => props.modelValue?.id || null,
  set: (value: string | null) => {
    // Find the method and emit it
    const method = props.availableMethods.find(m => m.id === value)
    if (method) {
      emit('update:modelValue', method)
    }
  }
})

// Methods
const selectMethod = (method: ShippingMethod) => {
  // This is now redundant since v-model handles it, but keep for explicit calls
  emit('update:modelValue', method)
}

const formatPrice = (price: number): string => {
  if (price === 0) {
    return 'Free'
  }
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const getDeliveryEstimate = (days: number): string => {
  const today = new Date()
  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + days)

  if (days === 1) {
    return 'Delivery tomorrow'
  } else if (days <= 3) {
    return `Delivery by ${deliveryDate.toLocaleDateString('en-US', { weekday: 'long' })}`
  } else {
    return `Delivery in ${days} business days`
  }
}

// Get conditions for a shipping method
const getMethodConditions = (method: ShippingMethod): string => {
  if (method.id === 'free' && method.price === 0) {
    return 'Available for orders over €50'
  } else if (method.id === 'express') {
    return 'Order before 2 PM for next-day delivery'
  }
  return ''
}
</script>

<style scoped>
.shipping-method-selector {
  width: 100%;
}

/* Smooth transitions for method selection */
.shipping-method-selector label {
  transition: all 0.2s ease-in-out;
}

/* Hover effects */
.shipping-method-selector label:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Selected state animation */
.shipping-method-selector label:has(input:checked) {
  animation: selectPulse 0.3s ease-out;
}

@keyframes selectPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
  }
}

/* Loading animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }
}

/* Error state styling */
.shipping-method-selector .bg-red-50 {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>