<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {{ $t('checkout.payment.savedMethods') }}
    </h3>

    <UiRadioGroup
      :model-value="selectedId"
      @update:model-value="$emit('select', $event)"
    >
      <div class="space-y-3">
        <div
          v-for="savedMethod in savedMethods"
          :key="savedMethod.id"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-colors"
          :class="{
            'border-blue-500 bg-blue-50 dark:bg-blue-900/20': selectedId === savedMethod.id,
            'hover:border-gray-300 dark:hover:border-gray-600': selectedId !== savedMethod.id,
          }"
          @click="$emit('select', savedMethod)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <UiRadioGroupItem
                :id="`saved-${savedMethod.id}`"
                :value="savedMethod.id"
                class="shrink-0"
              />
              <div>
                <div class="flex items-center space-x-2">
                  <commonIcon
                    :name="getPaymentMethodIcon(savedMethod.type)"
                    class="h-6 w-6"
                  />
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ getPaymentMethodLabel(savedMethod) }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ getPaymentMethodDescription(savedMethod) }}
                </p>
              </div>
            </div>
            <span
              v-if="savedMethod.isDefault"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {{ $t('checkout.payment.default') }}
            </span>
          </div>
        </div>
      </div>
    </UiRadioGroup>

    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <UiButton
        type="button"
        variant="link"
        class="px-0"
        @click="$emit('use-new')"
      >
        {{ $t('checkout.payment.useNewMethod') }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SavedPaymentMethod } from '~/types/checkout'

interface Props {
  savedMethods: SavedPaymentMethod[]
  selectedId: string | null
}

interface Emits {
  (e: 'select', value: string | SavedPaymentMethod): void
  (e: 'use-new'): void
}

defineProps<Props>()
defineEmits<Emits>()

const getPaymentMethodIcon = (type: string) => {
  if (type === 'credit_card') return 'lucide:credit-card'
  if (type === 'paypal') return 'lucide:badge-dollar-sign'
  return 'lucide:credit-card'
}

const getPaymentMethodLabel = (savedMethod: SavedPaymentMethod) => {
  if (savedMethod.type === 'credit_card') {
    const brand = savedMethod.brand ? savedMethod.brand.charAt(0).toUpperCase() + savedMethod.brand.slice(1) : 'Card'
    return `${brand} •••• ${savedMethod.lastFour}`
  }
  else if (savedMethod.type === 'paypal') {
    return 'PayPal'
  }
  return 'Payment Method'
}

const getPaymentMethodDescription = (savedMethod: SavedPaymentMethod) => {
  if (savedMethod.type === 'credit_card' && savedMethod.expiryMonth && savedMethod.expiryYear) {
    return `Expires ${savedMethod.expiryMonth.toString().padStart(2, '0')}/${savedMethod.expiryYear}`
  }
  else if (savedMethod.type === 'paypal') {
    return 'PayPal account'
  }
  return ''
}
</script>
