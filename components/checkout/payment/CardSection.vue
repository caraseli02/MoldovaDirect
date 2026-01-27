<template>
  <div class="space-y-4">
    <!-- Stripe Card Element - One field for card number, expiry, CVC -->
    <div>
      <UiLabel class="mb-2 block text-sm font-medium dark:text-white">
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

      <!-- Fallback UI for Stripe loading failure -->
      <div
        v-if="stripeFailed && !stripeLoading"
        class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        role="alert"
      >
        <div class="flex items-start">
          <commonIcon
            name="lucide:alert-triangle"
            class="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div class="flex-1">
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {{ $t('checkout.payment.stripeLoadFailed') }}
            </h3>
            <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {{ $t('checkout.payment.stripeLoadFailedMessage') }}
            </p>
            <UiButton
              type="button"
              variant="outline"
              size="sm"
              class="mt-3"
              @click="handleRetry"
            >
              <commonIcon
                name="lucide:refresh-cw"
                class="h-4 w-4 mr-2"
              />
              {{ $t('checkout.payment.retryStripe') }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Cardholder Name -->
    <div>
      <UiLabel
        for="cardholder-name"
        class="mb-2 block text-sm font-medium dark:text-white"
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
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
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
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
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
  retryCount,
  initializeStripe,
  createCardElement,
  retryInitialization,
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
const initializationAttempted = ref(false)

// Computed
const stripeFailed = computed(() => {
  return initializationAttempted.value && !!stripeError.value && retryCount.value >= 3
})

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
    initializationAttempted.value = true
    await initializeStripe()

    if (!stripeCardContainer.value) {
      emit('stripe-ready', false)
      return
    }

    if (!elements.value) {
      emit('stripe-ready', false)
      return
    }

    await createCardElement(stripeCardContainer.value)
    emit('stripe-ready', true)
    emitUpdate()
  }
  catch (error) {
    emit('stripe-ready', false)
  }
}

// Handle manual retry
const handleRetry = async () => {
  initializationAttempted.value = false
  await retryInitialization()
  await nextTick()
  await initializeStripeElements()
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
