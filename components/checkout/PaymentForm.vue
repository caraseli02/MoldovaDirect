<template>
  <div class="payment-form">
    <!-- Cash Payment Form -->
    <div v-if="modelValue.type === 'cash'" class="space-y-4">
      <div class="text-center py-8">
        <commonIcon name="lucide:banknote" class="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('checkout.payment.cash.title') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ $t('checkout.payment.cash.description') }}
        </p>
      </div>

      <!-- Cash Payment Instructions -->
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h4 class="text-md font-semibold text-green-900 dark:text-green-100 mb-4">
          {{ $t('checkout.payment.cashInstructions') }}
        </h4>

        <ul class="space-y-3 text-sm text-green-800 dark:text-green-200">
          <li class="flex items-start space-x-2">
            <commonIcon name="lucide:check-circle-2" class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>{{ $t('checkout.payment.cashInstruction1') }}</span>
          </li>
          <li class="flex items-start space-x-2">
            <commonIcon name="lucide:check-circle-2" class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>{{ $t('checkout.payment.cashInstruction2') }}</span>
          </li>
          <li class="flex items-start space-x-2">
            <commonIcon name="lucide:check-circle-2" class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>{{ $t('checkout.payment.cashInstruction3') }}</span>
          </li>
          <li class="flex items-start space-x-2">
            <commonIcon name="lucide:check-circle-2" class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>{{ $t('checkout.payment.cashInstruction4') }}</span>
          </li>
        </ul>
      </div>

      <!-- Contact Information Notice -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex">
          <commonIcon name="lucide:info" class="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div>
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
              {{ $t('checkout.payment.contactNoticeTitle') }}
            </h3>
            <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {{ $t('checkout.payment.contactNotice') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Credit Card Form (Disabled) -->
    <div v-else-if="modelValue.type === 'credit_card'" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Card Number -->
        <div class="md:col-span-2">
          <label for="card-number" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('checkout.payment.cardNumber') }}
          </label>
          <div class="relative">
            <input id="card-number" ref="cardNumberRef" type="text" v-model="creditCardData.number"
              :placeholder="$t('checkout.payment.cardNumberPlaceholder')" :class="[
                'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                hasError('cardNumber')
                  ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
              ]" maxlength="19" autocomplete="cc-number" @input="formatCardNumber" @blur="validateCardNumber" />
            <div v-if="cardBrand" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <commonIcon :name="getCardBrandIcon(cardBrand)" class="h-6 w-6" />
            </div>
          </div>
          <p v-if="hasError('cardNumber')" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ getError('cardNumber') }}
          </p>
        </div>

        <!-- Expiry Date -->
        <div>
          <label for="expiry-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('checkout.payment.expiryDate') }}
          </label>
          <input id="expiry-date" type="text" v-model="expiryDisplay"
            :placeholder="$t('checkout.payment.expiryPlaceholder')" :class="[
              'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
              hasError('expiry')
                ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
            ]" maxlength="5" autocomplete="cc-exp" @input="formatExpiry" @blur="validateExpiry" />
          <p v-if="hasError('expiry')" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ getError('expiry') }}
          </p>
        </div>

        <!-- CVV -->
        <div>
          <label for="cvv" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('checkout.payment.cvv') }}
          </label>
          <div class="relative">
            <input id="cvv" type="text" v-model="creditCardData.cvv"
              :placeholder="$t('checkout.payment.cvvPlaceholder')" :class="[
                'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                hasError('cvv')
                  ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
              ]" :maxlength="cardBrand === 'amex' ? 4 : 3" autocomplete="cc-csc" @input="formatCVV"
              @blur="validateCVV" />
            <Button type="button" variant="ghost" size="icon" class="absolute inset-y-0 right-0 pr-3"
              @click="showCVVHelp = !showCVVHelp">
              <commonIcon name="lucide:circle-help" class="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </Button>
          </div>
          <p v-if="hasError('cvv')" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ getError('cvv') }}
          </p>
          <div v-if="showCVVHelp" class="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('checkout.payment.cvvHelp') }}
            </p>
          </div>
        </div>

        <!-- Cardholder Name -->
        <div class="md:col-span-2">
          <label for="cardholder-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('checkout.payment.cardholderName') }}
          </label>
          <input id="cardholder-name" type="text" v-model="creditCardData.holderName"
            :placeholder="$t('checkout.payment.cardholderNamePlaceholder')" :class="[
              'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
              hasError('holderName')
                ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
            ]" autocomplete="cc-name" @blur="validateHolderName" />
          <p v-if="hasError('holderName')" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ getError('holderName') }}
          </p>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div class="flex">
          <commonIcon name="lucide:shield-check" class="h-5 w-5 text-green-400 mr-2 mt-0.5" />
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

    <!-- PayPal Form -->
    <div v-else-if="modelValue.type === 'paypal'" class="space-y-4">
      <div class="text-center py-8">
        <commonIcon name="lucide:badge-dollar-sign" class="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('checkout.payment.paypal.title') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ $t('checkout.payment.paypal.description') }}
        </p>

        <!-- PayPal Email (optional for display) -->
        <div class="max-w-md mx-auto">
          <label for="paypal-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('checkout.payment.paypalEmail') }}
          </label>
          <input id="paypal-email" type="email" v-model="paypalData.email"
            :placeholder="$t('checkout.payment.paypalEmailPlaceholder')" :class="[
              'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
              hasError('paypalEmail')
                ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
            ]" autocomplete="email" @blur="validatePayPalEmail" />
          <p v-if="hasError('paypalEmail')" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ getError('paypalEmail') }}
          </p>
        </div>
      </div>

      <!-- PayPal Notice -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex">
          <commonIcon name="lucide:info" class="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div>
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
              {{ $t('checkout.payment.paypalNoticeTitle') }}
            </h3>
            <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {{ $t('checkout.payment.paypalNotice') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bank Transfer Form -->
    <div v-else-if="modelValue.type === 'bank_transfer'" class="space-y-4">
      <div class="text-center py-8">
        <commonIcon name="lucide:building-2" class="h-16 w-16 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
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
              {{ bankTransferReference }}
            </span>
          </div>
        </div>

        <!-- Copy Button -->
        <Button type="button" variant="outline" @click="copyBankDetails"
          class="mt-4 w-full inline-flex justify-center items-center">
          <commonIcon name="lucide:clipboard-list" class="h-4 w-4 mr-2" />
          {{ $t('checkout.payment.copyDetails') }}
        </Button>
      </div>

      <!-- Bank Transfer Instructions -->
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div class="flex">
          <commonIcon name="lucide:alert-triangle" class="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
          <div>
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {{ $t('checkout.payment.bankTransferInstructions') }}
            </h3>
            <ul class="text-sm text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside space-y-1">
              <li>{{ $t('checkout.payment.bankInstruction1') }}</li>
              <li>{{ $t('checkout.payment.bankInstruction2') }}</li>
              <li>{{ $t('checkout.payment.bankInstruction3') }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useToast } from '~/composables/useToast'
import { Button } from '@/components/ui/button'
import type { PaymentMethod } from '~/types/checkout'

// =============================================
// PROPS & EMITS
// =============================================

interface Props {
  modelValue: PaymentMethod
  loading?: boolean
  errors?: Record<string, string>
}

interface Emits {
  (e: 'update:modelValue', value: PaymentMethod): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  errors: () => ({})
})

const emit = defineEmits<Emits>()

// =============================================
// COMPOSABLES
// =============================================

const toast = useToast()

// =============================================
// REACTIVE STATE
// =============================================

const showCVVHelp = ref(false)
const cardBrand = ref<string>('')
const validationErrors = ref<Record<string, string>>({})

// Form data refs
const creditCardData = ref({
  number: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  holderName: ''
})

const paypalData = ref({
  email: ''
})

const expiryDisplay = ref('')

// =============================================
// COMPUTED PROPERTIES
// =============================================

const bankTransferReference = computed(() => {
  return `ORDER-${Date.now().toString().slice(-8)}`
})

// =============================================
// METHODS
// =============================================

const hasError = (field: string): boolean => {
  return !!(props.errors[field] || validationErrors.value[field])
}

const getError = (field: string): string => {
  return props.errors[field] || validationErrors.value[field] || ''
}

const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '')

  // Detect card brand
  cardBrand.value = detectCardBrand(value)

  // Format with spaces
  const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value

  creditCardData.value.number = formattedValue
  updatePaymentMethod()
}

const formatExpiry = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }

  expiryDisplay.value = value

  // Parse month and year
  const parts = value.split('/')
  if (parts.length === 2) {
    creditCardData.value.expiryMonth = parts[0]
    creditCardData.value.expiryYear = parts[1]
  }

  updatePaymentMethod()
}

const formatCVV = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/[^0-9]/gi, '')
  const maxLength = cardBrand.value === 'amex' ? 4 : 3

  creditCardData.value.cvv = value.substring(0, maxLength)
  updatePaymentMethod()
}

const detectCardBrand = (number: string): string => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]|^2[2-7]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3[0689]/,
    jcb: /^35/
  }

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(number)) {
      return brand
    }
  }

  return ''
}

const getCardBrandIcon = (_brand: string): string => 'lucide:credit-card'

const validateCardNumber = () => {
  const number = creditCardData.value.number.replace(/\s/g, '')

  if (!number) {
    validationErrors.value.cardNumber = 'Card number is required'
  } else if (!/^\d{13,19}$/.test(number)) {
    validationErrors.value.cardNumber = 'Invalid card number'
  } else if (!luhnCheck(number)) {
    validationErrors.value.cardNumber = 'Invalid card number'
  } else {
    delete validationErrors.value.cardNumber
  }
}

const validateExpiry = () => {
  const month = parseInt(creditCardData.value.expiryMonth)
  const year = parseInt(creditCardData.value.expiryYear)

  if (!month || !year) {
    validationErrors.value.expiry = 'Expiry date is required'
  } else if (month < 1 || month > 12) {
    validationErrors.value.expiry = 'Invalid month'
  } else {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      validationErrors.value.expiry = 'Card has expired'
    } else {
      delete validationErrors.value.expiry
    }
  }
}

const validateCVV = () => {
  const cvv = creditCardData.value.cvv
  const expectedLength = cardBrand.value === 'amex' ? 4 : 3

  if (!cvv) {
    validationErrors.value.cvv = 'CVV is required'
  } else if (!/^\d+$/.test(cvv)) {
    validationErrors.value.cvv = 'CVV must be numeric'
  } else if (cvv.length !== expectedLength) {
    validationErrors.value.cvv = `CVV must be ${expectedLength} digits`
  } else {
    delete validationErrors.value.cvv
  }
}

const validateHolderName = () => {
  const name = creditCardData.value.holderName.trim()

  if (!name) {
    validationErrors.value.holderName = 'Cardholder name is required'
  } else if (name.length < 2) {
    validationErrors.value.holderName = 'Name is too short'
  } else {
    delete validationErrors.value.holderName
  }
}

const validatePayPalEmail = () => {
  const email = paypalData.value.email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    validationErrors.value.paypalEmail = 'PayPal email is required'
  } else if (!emailRegex.test(email)) {
    validationErrors.value.paypalEmail = 'Invalid email address'
  } else {
    delete validationErrors.value.paypalEmail
  }
}

const luhnCheck = (number: string): boolean => {
  let sum = 0
  let alternate = false

  for (let i = number.length - 1; i >= 0; i--) {
    let n = parseInt(number.charAt(i), 10)

    if (alternate) {
      n *= 2
      if (n > 9) {
        n = (n % 10) + 1
      }
    }

    sum += n
    alternate = !alternate
  }

  return sum % 10 === 0
}

const copyBankDetails = async () => {
  const details = `
Bank: Banca Transilvania
Account Holder: Moldovan Products SRL
IBAN: RO49 AAAA 1B31 0075 9384 0000
SWIFT: BTRLRO22
Reference: ${bankTransferReference.value}
  `.trim()

  try {
    await navigator.clipboard.writeText(details)
    toast.success('Bank details copied to clipboard')
  } catch (error) {
    console.error('Failed to copy bank details:', error)
    toast.error('Failed to copy bank details')
  }
}

const updatePaymentMethod = () => {
  let updatedMethod: PaymentMethod = { ...props.modelValue }

  if (props.modelValue.type === 'cash') {
    updatedMethod.cash = {
      confirmed: true
    }
  } else if (props.modelValue.type === 'credit_card') {
    updatedMethod.creditCard = { ...creditCardData.value }
  } else if (props.modelValue.type === 'paypal') {
    updatedMethod.paypal = { ...paypalData.value }
  } else if (props.modelValue.type === 'bank_transfer') {
    updatedMethod.bankTransfer = {
      reference: bankTransferReference.value
    }
  }

  emit('update:modelValue', updatedMethod)
}

// =============================================
// WATCHERS
// =============================================

// Initialize form data when payment method changes (one-way sync only)
watch(() => props.modelValue, (newMethod) => {
  if (newMethod.type === 'cash') {
    // Cash payment is ready immediately - no need to update
  } else if (newMethod.type === 'credit_card' && newMethod.creditCard) {
    // Only update if different to avoid triggering updates
    const currentNumber = creditCardData.value.number.replace(/\s/g, '')
    const newNumber = newMethod.creditCard.number.replace(/\s/g, '')

    if (currentNumber !== newNumber ||
      creditCardData.value.expiryMonth !== newMethod.creditCard.expiryMonth ||
      creditCardData.value.expiryYear !== newMethod.creditCard.expiryYear ||
      creditCardData.value.cvv !== newMethod.creditCard.cvv ||
      creditCardData.value.holderName !== newMethod.creditCard.holderName) {

      creditCardData.value = { ...newMethod.creditCard }

      // Update expiry display
      if (newMethod.creditCard.expiryMonth && newMethod.creditCard.expiryYear) {
        expiryDisplay.value = `${newMethod.creditCard.expiryMonth}/${newMethod.creditCard.expiryYear}`
      }

      // Detect card brand
      cardBrand.value = detectCardBrand(newNumber)
    }
  } else if (newMethod.type === 'paypal' && newMethod.paypal) {
    if (paypalData.value.email !== newMethod.paypal.email) {
      paypalData.value = { ...newMethod.paypal }
    }
  }
}, { immediate: true })

// Initialize cash or bank transfer on mount
onMounted(() => {
  if (props.modelValue.type === 'cash' || props.modelValue.type === 'bank_transfer') {
    updatePaymentMethod()
  }
})
</script>

<style scoped>
.payment-form {
  width: 100%;
}

/* Custom input styling */
input:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
  --tw-ring-opacity: 0.5;
  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity));
}

/* Card brand icon positioning */
.card-brand-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}

/* Security badge styling */
.security-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  background-color: rgb(220 252 231);
  color: rgb(22 101 52);
}
</style>
