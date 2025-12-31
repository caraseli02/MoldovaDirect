<template>
  <div class="space-y-4">
    <div class="text-center py-8">
      <commonIcon
        name="lucide:building-2"
        class="h-16 w-16 text-gray-600 dark:text-gray-400 mx-auto mb-4"
        aria-hidden="true"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('checkout.payment.bankTransfer.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ $t('checkout.payment.bankTransfer.description') }}
      </p>
    </div>

    <!-- Bank Details -->
    <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-4">
        {{ $t('checkout.payment.bankDetails') }}
      </h4>

      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ $t('checkout.payment.bankName') }}:
          </span>
          <span class="text-sm text-gray-900 dark:text-white font-mono">
            Banca Transilvania
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ $t('checkout.payment.accountHolder') }}:
          </span>
          <span class="text-sm text-gray-900 dark:text-white font-mono">
            Moldovan Products SRL
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ $t('checkout.payment.iban') }}:
          </span>
          <span class="text-sm text-gray-900 dark:text-white font-mono">
            RO49 AAAA 1B31 0075 9384 0000
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ $t('checkout.payment.swift') }}:
          </span>
          <span class="text-sm text-gray-900 dark:text-white font-mono">
            BTRLRO22
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ $t('checkout.payment.reference') }}:
          </span>
          <span class="text-sm text-gray-900 dark:text-white font-mono">
            {{ reference }}
          </span>
        </div>
      </div>

      <!-- Copy Button -->
      <Button
        type="button"
        variant="outline"
        :aria-label="$t('checkout.payment.copyBankDetails')"
        class="mt-4 w-full inline-flex justify-center items-center min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        @click="copyBankDetails"
      >
        <commonIcon
          name="lucide:clipboard-list"
          class="h-4 w-4 mr-2"
          aria-hidden="true"
        />
        {{ $t('checkout.payment.copyDetails') }}
      </Button>
    </div>

    <!-- Bank Transfer Instructions -->
    <div
      class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
      role="alert"
    >
      <div class="flex">
        <commonIcon
          name="lucide:alert-triangle"
          class="h-5 w-5 text-yellow-400 mr-2 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {{ $t('checkout.payment.bankTransferInstructions') }}
          </h3>
          <ul
            class="text-sm text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside space-y-1"
            role="list"
          >
            <li>{{ $t('checkout.payment.bankInstruction1') }}</li>
            <li>{{ $t('checkout.payment.bankInstruction2') }}</li>
            <li>{{ $t('checkout.payment.bankInstruction3') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useToast } from '~/composables/useToast'

interface Props {
  modelValue?: {
    reference: string
  }
}

interface Emits {
  (e: 'update:modelValue', value: { reference: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()

const reference = computed(() => {
  return props.modelValue?.reference || `ORDER-${Date.now().toString().slice(-8)}`
})

const copyBankDetails = async () => {
  const details = `
Bank: Banca Transilvania
Account Holder: Moldovan Products SRL
IBAN: RO49 AAAA 1B31 0075 9384 0000
SWIFT: BTRLRO22
Reference: ${reference.value}
  `.trim()

  try {
    await navigator.clipboard.writeText(details)
    toast.success('Bank details copied to clipboard')
  }
  catch (error: unknown) {
    console.error('Failed to copy bank details:', error)
    toast.error('Failed to copy bank details')
  }
}

// Emit the reference when component mounts
emit('update:modelValue', { reference: reference.value })
</script>
