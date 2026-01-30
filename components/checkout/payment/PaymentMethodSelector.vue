<template>
  <div class="space-y-4 mb-6">
    <div class="grid grid-cols-1 gap-4">
      <!-- Cash Payment (Available) -->
      <UiRadioGroup
        :model-value="localType"
        @update:model-value="$emit('update:modelValue', { type: $event as PaymentMethod['type'], saveForFuture: false })"
      >
        <div
          class="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20"
        >
          <div class="flex items-center space-x-3">
            <UiRadioGroupItem
              id="cash"
              value="cash"
              class="shrink-0"
            />
            <div>
              <div class="flex items-center space-x-2">
                <commonIcon
                  name="lucide:banknote"
                  class="h-6 w-6 text-green-600 dark:text-green-400"
                />
                <span class="font-medium text-gray-900 dark:text-white">{{ $t('checkout.payment.cash.label') }}</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('checkout.payment.cash.summary') }}
              </p>
            </div>
          </div>
        </div>
      </UiRadioGroup>

      <!-- Disabled Options -->
      <div
        v-if="showNew"
        class="space-y-3"
      >
        <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ $t('checkout.payment.comingSoon') }}
        </h4>

        <!-- Credit Card (Disabled) -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="size-4 rounded-full border border-gray-300 bg-gray-100 shrink-0"></div>
              <div>
                <div class="flex items-center space-x-2">
                  <commonIcon
                    name="lucide:credit-card"
                    class="h-6 w-6 text-gray-400"
                  />
                  <span class="font-medium text-gray-500 dark:text-gray-400">{{ $t('checkout.payment.creditCard.label') }}</span>
                </div>
                <p class="text-sm text-gray-400">
                  {{ $t('checkout.payment.creditCard.summary') }}
                </p>
              </div>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {{ $t('checkout.payment.comingSoon') }}
            </span>
          </div>
        </div>

        <!-- PayPal (Disabled) -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="size-4 rounded-full border border-gray-300 bg-gray-100 shrink-0"></div>
              <div>
                <div class="flex items-center space-x-2">
                  <commonIcon
                    name="lucide:badge-dollar-sign"
                    class="h-6 w-6 text-gray-400"
                  />
                  <span class="font-medium text-gray-500 dark:text-gray-400">{{ $t('checkout.payment.paypal.label') }}</span>
                </div>
                <p class="text-sm text-gray-400">
                  {{ $t('checkout.payment.paypal.summary') }}
                </p>
              </div>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {{ $t('checkout.payment.comingSoon') }}
            </span>
          </div>
        </div>

        <!-- Bank Transfer (Disabled) -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="size-4 rounded-full border border-gray-300 bg-gray-100 shrink-0"></div>
              <div>
                <div class="flex items-center space-x-2">
                  <commonIcon
                    name="lucide:building-2"
                    class="h-6 w-6 text-gray-400"
                  />
                  <span class="font-medium text-gray-500 dark:text-gray-400">{{ $t('checkout.payment.bankTransfer.label') }}</span>
                </div>
                <p class="text-sm text-gray-400">
                  {{ $t('checkout.payment.bankTransfer.summary') }}
                </p>
              </div>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {{ $t('checkout.payment.comingSoon') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentMethod } from '~/types/checkout'

interface Props {
  modelValue: PaymentMethod
  showNew: boolean
  isAuthenticated: boolean
}

interface Emits {
  (e: 'update:modelValue', value: PaymentMethod): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localType = computed(() => props.modelValue.type)
</script>
