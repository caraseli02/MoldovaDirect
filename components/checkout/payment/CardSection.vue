<template>
  <div class="space-y-4">
    <!-- Stripe Card Element Container -->
    <div>
      <UiLabel class="mb-2 block">
        {{ $t('checkout.payment.cardDetails') }}
      </UiLabel>
      <div
        ref="stripeCardContainer"
        class="stripe-card-element p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        :class="{ 'border-red-500': stripeError }"
      ></div>
      <p
        v-if="stripeError"
        class="mt-1 text-sm text-destructive"
        role="alert"
      >
        {{ stripeError }}
      </p>
    </div>

    <!-- Cardholder Name (separate from Stripe Element) -->
    <div>
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

    <!-- Loading State -->
    <div
      v-if="stripeLoading"
      class="flex items-center justify-center py-4"
    >
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
        {{ $t('checkout.payment.loadingStripe') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Button } from '@/components/ui/button'
import { useStripe, formatStripeError } from '~/composables/useStripe'

const { t } = useI18n()

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
  (e: 'stripe-ready', ready: boolean): void
  (e: 'stripe-error', error: string | null): void
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
})

const emit = defineEmits<Emits>()

// Stripe integration
const {
  stripe,
  elements,
  cardElement,
  loading: stripeLoading,
  error: stripeError,
  initializeStripe,
  createCardElement,
} = useStripe()

// Template refs
const stripeCardContainer = ref<HTMLElement>()

// Local state
const creditCardData = ref<CardFormData>({
  number: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  holderName: props.modelValue.holderName || '',
})

const validationErrors = ref<Record<string, string>>({})

// Error helpers that combine external and internal errors
const hasError = (field: string): boolean => {
  return !!((props.errors[field]) || validationErrors.value[field] || (field === 'stripe' && stripeError.value))
}

const getError = (field: string): string => {
  if (field === 'stripe' && stripeError.value) {
    return formatStripeError(stripeError.value)
  }
  return props.errors[field] || validationErrors.value[field] || ''
}

// Validation functions
const validateHolderName = () => {
  if (!creditCardData.value.holderName.trim()) {
    validationErrors.value.holderName = t('checkout.validation.cardholderNameRequired')
    return false
  }
  if (creditCardData.value.holderName.trim().length < 2) {
    validationErrors.value.holderName = t('checkout.validation.cardholderNameTooShort')
    return false
  }
  delete validationErrors.value.holderName
  return true
}

// Input handlers
const onHolderNameInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  creditCardData.value.holderName = input.value
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', {
    number: '', // Stripe handles this securely
    expiryMonth: '', // Stripe handles this securely
    expiryYear: '', // Stripe handles this securely
    cvv: '', // Stripe handles this securely
    holderName: creditCardData.value.holderName,
  })
}

// Initialize Stripe Elements
const initializeStripeElements = async () => {
  try {
    await initializeStripe()

    if (stripeCardContainer.value && elements.value) {
      await createCardElement(stripeCardContainer.value)
      emit('stripe-ready', true)
    }
  }
  catch (error) {
    console.error('Failed to initialize Stripe Elements:', error)
    emit('stripe-ready', false)
  }
}

// Watch for Stripe errors and emit them
watch(stripeError, (error) => {
  emit('stripe-error', error)
})

// Initialize from props
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.holderName !== creditCardData.value.holderName) {
    creditCardData.value.holderName = newValue.holderName
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  await nextTick()
  await initializeStripeElements()
})

onUnmounted(() => {
  // Cleanup Stripe elements
  if (cardElement.value) {
    cardElement.value.destroy()
  }
})

// Expose validation method for parent components
defineExpose({
  validateForm: () => {
    const isHolderNameValid = validateHolderName()
    const isStripeReady = !!cardElement.value && !stripeError.value
    return isHolderNameValid && isStripeReady
  },
  getStripeCardElement: () => cardElement.value,
})
</script>

<style scoped>
.stripe-card-element {
  min-height: 44px;
  display: flex;
  align-items: center;
}

/* Stripe element styling is handled by the Stripe library */
.stripe-card-element:focus-within {
  border-color: rgb(79 70 229);
  box-shadow: 0 0 0 3px rgb(79 70 229 / 0.1);
}

.stripe-card-element.border-red-500 {
  border-color: rgb(239 68 68);
}
</style>
