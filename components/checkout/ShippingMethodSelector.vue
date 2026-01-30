<template>
  <div class="shipping-method-selector">
    <!-- Auto-Selected Free Shipping Banner -->
    <div
      v-if="autoSelected && modelValue && modelValue.price === 0 && !showAllMethods"
      class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
    >
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
          <svg
            class="w-5 h-5 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="text-base font-semibold text-green-800 dark:text-green-200">{{ $t('checkout.shippingMethod.freeShipping') }}</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
              {{ $t('checkout.shippingMethod.autoApplied') }}
            </span>
          </div>
          <p class="text-sm text-green-700 dark:text-green-300 mt-0.5">
            {{ modelValue.name }} - {{ $t('checkout.shippingMethod.estimatedDelivery', { days: modelValue.estimatedDays }) }}
          </p>
        </div>
        <UiButton
          v-if="availableMethods.length > 1"
          type="button"
          class="text-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 underline"
          @click="showAllMethods = true"
        >
          {{ $t('checkout.shippingMethod.changeMethod') }}
        </UiButton>
      </div>
    </div>

    <!-- Auto-Selected Single Method Banner -->
    <div
      v-else-if="autoSelected && modelValue && availableMethods.length === 1 && !showAllMethods"
      class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
    >
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0 w-10 h-10 bg-rose-100 dark:bg-rose-800 rounded-full flex items-center justify-center">
          <svg
            class="w-5 h-5 text-rose-600 dark:text-rose-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </div>
        <div class="flex-1">
          <span class="text-base font-semibold text-gray-900 dark:text-white">{{ modelValue.name }}</span>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {{ modelValue.description }} - {{ formatPrice(modelValue.price) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Standard Header -->
    <div
      v-if="!autoSelected || showAllMethods"
      class="mb-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ $t('checkout.shippingMethod.title') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('checkout.shippingMethod.subtitle') }}
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="space-y-4"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="animate-pulse"
      >
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

    <!-- Fallback Warning Banner -->
    <div
      v-if="error && availableMethods.length > 0"
      class="mb-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {{ $t('checkout.shippingMethod.fallbackWarning.title') }}
          </h3>
          <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            {{ $t('checkout.shippingMethod.fallbackWarning.description') }}
          </p>
          <div class="mt-3">
            <UiButton
              variant="link"
              size="sm"
              class="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 p-0 h-auto"
              type="button"
              @click="$emit('retry')"
            >
              {{ $t('checkout.shippingMethod.fallbackWarning.retry') }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Shipping Methods -->
    <div
      v-else-if="availableMethods.length > 0 && (!autoSelected || showAllMethods)"
      class="space-y-3"
    >
      <UiRadioGroup
        :model-value="selectedMethodId"
        :aria-label="$t('checkout.shippingMethod.title')"
        :aria-invalid="!!validationError"
        :aria-describedby="validationError ? 'shipping-method-error' : undefined"
        @update:model-value="selectMethod"
      >
        <ShippingMethodCard
          v-for="method in availableMethods"
          :key="method.id"
          :method="method"
          :selected="selectedMethodId === method.id"
          :currency="currency"
          @select="selectMethod(method.id)"
        />
      </UiRadioGroup>
    </div>

    <!-- No Methods Available -->
    <div
      v-else
      class="text-center py-8"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ $t('checkout.shippingMethod.noMethods') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('checkout.shippingMethod.noMethodsDescription') }}
      </p>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="rounded-md bg-rose-50 dark:bg-rose-900/20 p-4 border border-rose-200 dark:border-rose-800"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-rose-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-rose-800 dark:text-rose-200">
            {{ $t('checkout.shippingMethod.error') }}
          </h3>
          <p class="mt-1 text-sm text-rose-700 dark:text-rose-300">
            {{ error }}
          </p>
          <div class="mt-3">
            <UiButton
              variant="link"
              size="sm"
              class="text-sm font-medium text-rose-800 dark:text-rose-200 hover:text-rose-900 dark:hover:text-rose-100 p-0 h-auto"
              type="button"
              @click="$emit('retry')"
            >
              {{ $t('common.retry') }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Validation Error -->
    <p
      v-if="validationError"
      id="shipping-method-error"
      role="alert"
      class="mt-2 text-sm text-rose-600 dark:text-rose-400"
    >
      {{ validationError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ShippingMethod } from '~/types/checkout'
import ShippingMethodCard from '~/components/checkout/shipping/ShippingMethodCard.vue'

interface Props {
  modelValue: ShippingMethod | null
  availableMethods: ShippingMethod[]
  loading?: boolean
  error?: string | null
  validationError?: string | null
  autoSelected?: boolean
  currency?: string
}

interface Emits {
  (e: 'update:modelValue', value: ShippingMethod | null): void
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  validationError: null,
  autoSelected: false,
  currency: 'EUR',
})

const emit = defineEmits<Emits>()

const showAllMethods = ref(false)
const { locale, t } = useI18n()

const formatPrice = (price: number): string => {
  if (price === 0) return t('checkout.freeShipping', 'Free')
  return new Intl.NumberFormat(locale.value || 'en-US', {
    style: 'currency',
    currency: props.currency || 'EUR',
  }).format(price)
}

const selectedMethodId = computed({
  get: () => props.modelValue?.id || null,
  set: (value: string | null) => {
    const method = props.availableMethods.find(m => m.id === value)
    if (method) emit('update:modelValue', method)
  },
})

const selectMethod = (value: string | null) => {
  selectedMethodId.value = value
}
</script>

<style scoped>
.shipping-method-selector { width: 100%; }
.shipping-method-selector :deep(label) { transition: all 0.2s ease-in-out; }
.shipping-method-selector :deep(label:hover) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.shipping-method-selector :deep(label:has([data-state=checked])) { animation: selectPulse 0.3s ease-out; }
@keyframes selectPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
.shipping-method-selector :deep(.bg-red-50) { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
