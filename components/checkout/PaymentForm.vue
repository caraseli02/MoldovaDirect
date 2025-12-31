<template>
  <div class="payment-form">
    <!-- Cash Payment Form -->
    <PaymentCashSection v-if="modelValue.type === 'cash'" />

    <!-- Credit Card Form -->
    <PaymentCardSection
      v-else-if="modelValue.type === 'credit_card'"
      :model-value="creditCardFormData"
      :errors="errors"
      @update:model-value="onCreditCardUpdate"
    />

    <!-- PayPal Form -->
    <PaymentPayPalSection
      v-else-if="modelValue.type === 'paypal'"
      :model-value="paypalFormData"
      :errors="errors"
      @update:model-value="onPayPalUpdate"
    />

    <!-- Bank Transfer Form -->
    <PaymentBankTransferSection
      v-else-if="modelValue.type === 'bank_transfer'"
      :model-value="bankTransferFormData"
      @update:model-value="onBankTransferUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import type { PaymentMethod } from '~/types/checkout'
import PaymentCashSection from '~/components/checkout/payment/CashSection.vue'
import PaymentCardSection from '~/components/checkout/payment/CardSection.vue'
import PaymentPayPalSection from '~/components/checkout/payment/PayPalSection.vue'
import PaymentBankTransferSection from '~/components/checkout/payment/BankTransferSection.vue'

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
  errors: () => ({}),
})

const emit = defineEmits<Emits>()

// =============================================
// COMPUTED - Form Data Adapters
// =============================================

const creditCardFormData = computed(() => ({
  number: props.modelValue.creditCard?.number || '',
  expiryMonth: props.modelValue.creditCard?.expiryMonth || '',
  expiryYear: props.modelValue.creditCard?.expiryYear || '',
  cvv: props.modelValue.creditCard?.cvv || '',
  holderName: props.modelValue.creditCard?.holderName || '',
}))

const paypalFormData = computed(() => ({
  email: props.modelValue.paypal?.email || '',
}))

const bankTransferFormData = computed(() => ({
  reference: props.modelValue.bankTransfer?.reference || '',
}))

// =============================================
// EVENT HANDLERS
// =============================================

const onCreditCardUpdate = (data: {
  number: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  holderName: string
}) => {
  emit('update:modelValue', {
    ...props.modelValue,
    creditCard: {
      number: data.number,
      expiryMonth: data.expiryMonth,
      expiryYear: data.expiryYear,
      cvv: data.cvv,
      holderName: data.holderName,
    },
  })
}

const onPayPalUpdate = (data: { email: string }) => {
  emit('update:modelValue', {
    ...props.modelValue,
    paypal: { email: data.email },
  })
}

const onBankTransferUpdate = (data: { reference: string }) => {
  emit('update:modelValue', {
    ...props.modelValue,
    bankTransfer: { reference: data.reference },
  })
}

// =============================================
// LIFECYCLE
// =============================================

// Initialize cash or bank transfer on mount
onMounted(() => {
  if (props.modelValue.type === 'cash') {
    emit('update:modelValue', {
      ...props.modelValue,
      cash: { confirmed: true },
    })
  }
})

// Watch for payment type changes to initialize data
watch(() => props.modelValue.type, (newType) => {
  if (newType === 'cash') {
    emit('update:modelValue', {
      ...props.modelValue,
      cash: { confirmed: true },
    })
  }
})
</script>

<style scoped>
.payment-form {
  width: 100%;
}
</style>
