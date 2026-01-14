<template>
  <div class="space-y-4">
    <!-- Stripe Card Element - One field for card number, expiry, CVC -->
    <div>
      <UiLabel class="mb-2 block text-sm font-medium">
        {{ $t('checkout.payment.cardDetails') }}
      </UiLabel>
      <div
        ref="stripeCardContainer"
        class="stripe-card-element"
      ></div>
      <p
        v-if="stripeError"
        class="mt-2 text-sm text-destructive"
        role="alert"
      >
        {{ stripeError }}
      </p>
    </div>

    <!-- Cardholder Name -->
    <div>
      <UiLabel
        for="cardholder-name"
        class="mb-2 block text-sm font-medium"
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
        class="h-11"
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

    <!-- Security Notice -->
    <div
      v-if="!stripeLoading"
      class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
      role="status"
    >
      <div class="flex">
        <commonIcon
          name="lucide:shield-check"
          class="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 shrink-0"
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
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useStripe, formatStripeError } from '~/composables/useStripe'

const { t } = useI18n()

interface CardFormData {
  number: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  holderName: string
  useStripeElements?: boolean
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

// Stripe integration - using unified Card Element
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

// Error helpers
const hasError = (field: string): boolean => {
  return !!(props.errors[field] || validationErrors.value[field])
}

const getError = (field: string): string => {
  return props.errors[field] || validationErrors.value[field] || ''
}

// Validation
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
    useStripeElements: true, // Flag to indicate Stripe Elements is handling card data
  })
}

// Initialize Stripe Elements
const initializeStripeElements = async () => {
  try {
    console.log('Initializing Stripe Elements...')
    await initializeStripe()

    if (!stripeCardContainer.value) {
      console.error('Stripe card container ref is not available')
      emit('stripe-ready', false)
      return
    }

    if (!elements.value) {
      console.error('Stripe elements not initialized')
      emit('stripe-ready', false)
      return
    }

    console.log('Creating card element...')
    await createCardElement(stripeCardContainer.value)
    console.log('Card element created successfully')
    emit('stripe-ready', true)
    emitUpdate()
  }
  catch (error) {
    console.error('Failed to initialize Stripe Elements:', error)
    emit('stripe-ready', false)
  }
}

// Watch for Stripe errors
watch(stripeError, (error) => {
  emit('stripe-error', error)
})

// Watch for prop changes
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
  if (cardElement.value) {
    cardElement.value.destroy()
  }
})

// Expose methods
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
/* Stripe Card Element container - minimal styling */
.stripe-card-element {
  width: 100%;
}

/* Global styles for Stripe elements (not scoped) */
</style>

<style>
/* Stripe element base styling - must be global to work with iframe */
.stripe-element-base {
  display: block;
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background-color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.stripe-element-focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  outline: none;
}

.stripe-element-invalid {
  border-color: #ef4444;
}

/* Dark mode support */
.dark .stripe-element-base {
  background-color: #1f2937;
  border-color: #4b5563;
  color: white;
}

.dark .stripe-element-focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.dark .stripe-element-invalid {
  border-color: #ef4444;
}
</style>
