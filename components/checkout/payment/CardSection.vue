<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Card Number -->
      <div class="md:col-span-2">
        <UiLabel
          for="card-number"
          class="mb-1"
        >
          {{ $t('checkout.payment.cardNumber') }}
        </UiLabel>
        <div class="relative">
          <UiInput
            id="card-number"
            ref="cardNumberRef"
            type="text"
            :value="creditCardData.number"
            :placeholder="$t('checkout.payment.cardNumberPlaceholder')"
            :aria-invalid="hasError('cardNumber')"
            :aria-describedby="hasError('cardNumber') ? 'card-number-error' : undefined"
            maxlength="19"
            autocomplete="cc-number"
            @input="onCardNumberInput"
            @blur="validateCardNumber"
          />
          <div
            v-if="cardBrand"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-hidden="true"
          >
            <commonIcon
              :name="getCardBrandIcon(cardBrand)"
              class="h-6 w-6"
            />
          </div>
        </div>
        <p
          v-if="hasError('cardNumber')"
          id="card-number-error"
          class="mt-1 text-sm text-destructive"
          role="alert"
        >
          {{ getError('cardNumber') }}
        </p>
      </div>

      <!-- Expiry Date -->
      <div>
        <UiLabel
          for="expiry-date"
          class="mb-1"
        >
          {{ $t('checkout.payment.expiryDate') }}
        </UiLabel>
        <UiInput
          id="expiry-date"
          type="text"
          :value="expiryDisplay"
          :placeholder="$t('checkout.payment.expiryPlaceholder')"
          :aria-invalid="hasError('expiry')"
          :aria-describedby="hasError('expiry') ? 'expiry-error' : undefined"
          maxlength="5"
          autocomplete="cc-exp"
          @input="onExpiryInput"
          @blur="validateExpiry"
        />
        <p
          v-if="hasError('expiry')"
          id="expiry-error"
          class="mt-1 text-sm text-destructive"
          role="alert"
        >
          {{ getError('expiry') }}
        </p>
      </div>

      <!-- CVV -->
      <div>
        <UiLabel
          for="cvv"
          class="mb-1"
        >
          {{ $t('checkout.payment.cvv') }}
        </UiLabel>
        <div class="relative">
          <UiInput
            id="cvv"
            type="text"
            :value="creditCardData.cvv"
            :placeholder="$t('checkout.payment.cvvPlaceholder')"
            :aria-invalid="hasError('cvv')"
            :aria-describedby="hasError('cvv') ? 'cvv-error cvv-help' : showCVVHelp ? 'cvv-help' : undefined"
            :maxlength="cvvMaxLength"
            autocomplete="cc-csc"
            @input="onCVVInput"
            @blur="validateCVV"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            :aria-label="$t('checkout.payment.cvvHelpLabel')"
            :aria-expanded="showCVVHelp"
            class="absolute inset-y-0 right-0 pr-3 min-w-[44px] min-h-[44px]"
            @click="showCVVHelp = !showCVVHelp"
          >
            <commonIcon
              name="lucide:circle-help"
              class="h-5 w-5 text-gray-400 hover:text-gray-500"
              aria-hidden="true"
            />
          </Button>
        </div>
        <p
          v-if="hasError('cvv')"
          id="cvv-error"
          class="mt-1 text-sm text-destructive"
          role="alert"
        >
          {{ getError('cvv') }}
        </p>
        <div
          v-if="showCVVHelp"
          id="cvv-help"
          class="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
          role="region"
        >
          <p class="text-sm text-muted-foreground">
            {{ $t('checkout.payment.cvvHelp') }}
          </p>
        </div>
      </div>

      <!-- Cardholder Name -->
      <div class="md:col-span-2">
        <UiLabel
          for="cardholder-name"
          class="mb-1"
        >
          {{ $t('checkout.payment.cardholderName') }}
        </UiLabel>
        <UiInput
          id="cardholder-name"
          type="text"
          :value="creditCardData.holderName"
          :placeholder="$t('checkout.payment.cardholderNamePlaceholder')"
          :aria-invalid="hasError('holderName')"
          :aria-describedby="hasError('holderName') ? 'holder-name-error' : undefined"
          autocomplete="cc-name"
          @blur="validateHolderName"
          @input="onHolderNameInput"
        />
        <p
          v-if="hasError('holderName')"
          id="holder-name-error"
          class="mt-1 text-sm text-destructive"
          role="alert"
        >
          {{ getError('holderName') }}
        </p>
      </div>
    </div>

    <!-- Security Notice -->
    <div
      class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
      role="status"
    >
      <div class="flex">
        <commonIcon
          name="lucide:shield-check"
          class="h-5 w-5 text-green-400 mr-2 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
            {{ $t('checkout.payment.securePayment') }}
          </h3>
          <p class="text-sm text-green-700 dark:text-green-300 mt-1">
            {{ $t('checkout.payment.securityNotice') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { useCardValidation } from '~/composables/checkout/useCardValidation'

interface CardFormData {
  number: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  holderName: string
}

interface Props {
  modelValue: CardFormData
  errors?: Record<string, string>
}

interface Emits {
  (e: 'update:modelValue', value: CardFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
})

const emit = defineEmits<Emits>()

const showCVVHelp = ref(false)

const {
  creditCardData,
  cardBrand,
  validationErrors,
  expiryDisplay,
  cvvMaxLength,
  formatCardNumber,
  formatExpiry,
  formatCVV,
  validateCardNumber,
  validateExpiry,
  validateCVV,
  validateHolderName,
  getCardBrandIcon,
  initializeFromData,
} = useCardValidation()

// Error helpers that combine external and internal errors
const hasError = (field: string): boolean => {
  return !!((props.errors[field]) || validationErrors.value[field])
}

const getError = (field: string): string => {
  return props.errors[field] || validationErrors.value[field] || ''
}

// Input handlers that emit updates
const onCardNumberInput = (event: Event) => {
  formatCardNumber(event)
  emitUpdate()
}

const onExpiryInput = (event: Event) => {
  formatExpiry(event)
  emitUpdate()
}

const onCVVInput = (event: Event) => {
  formatCVV(event)
  emitUpdate()
}

const onHolderNameInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  creditCardData.value.holderName = input.value
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', {
    number: creditCardData.value.number,
    expiryMonth: creditCardData.value.expiryMonth || '',
    expiryYear: creditCardData.value.expiryYear || '',
    cvv: creditCardData.value.cvv,
    holderName: creditCardData.value.holderName,
  })
}

// Initialize from props
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const currentNumber = creditCardData.value.number.replace(/\s/g, '')
    const newNumber = newValue.number.replace(/\s/g, '')

    if (currentNumber !== newNumber
      || creditCardData.value.expiryMonth !== newValue.expiryMonth
      || creditCardData.value.expiryYear !== newValue.expiryYear
      || creditCardData.value.cvv !== newValue.cvv
      || creditCardData.value.holderName !== newValue.holderName) {
      initializeFromData({
        number: newValue.number,
        expiryMonth: newValue.expiryMonth,
        expiryYear: newValue.expiryYear,
        cvv: newValue.cvv,
        holderName: newValue.holderName,
      })
    }
  }
}, { immediate: true })
</script>
