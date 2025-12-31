<template>
  <div class="space-y-4">
    <div class="text-center py-8">
      <commonIcon
        name="lucide:badge-dollar-sign"
        class="h-16 w-16 text-blue-600 mx-auto mb-4"
        aria-hidden="true"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('checkout.payment.paypal.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ $t('checkout.payment.paypal.description') }}
      </p>

      <!-- PayPal Email (optional for display) -->
      <div class="max-w-md mx-auto">
        <UiLabel
          for="paypal-email"
          class="mb-1"
        >
          {{ $t('checkout.payment.paypalEmail') }}
        </UiLabel>
        <UiInput
          id="paypal-email"
          type="email"
          :value="email"
          :placeholder="$t('checkout.payment.paypalEmailPlaceholder')"
          :aria-invalid="hasError"
          :aria-describedby="hasError ? 'paypal-email-error' : undefined"
          autocomplete="email"
          @input="onEmailInput"
          @blur="validateEmail"
        />
        <p
          v-if="hasError"
          id="paypal-email-error"
          class="mt-1 text-sm text-destructive"
          role="alert"
        >
          {{ errorMessage }}
        </p>
      </div>
    </div>

    <!-- PayPal Notice -->
    <div
      class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      role="status"
    >
      <div class="flex">
        <commonIcon
          name="lucide:info"
          class="h-5 w-5 text-blue-400 mr-2 mt-0.5"
          aria-hidden="true"
        />
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: {
    email: string
  }
  errors?: Record<string, string>
}

interface Emits {
  (e: 'update:modelValue', value: { email: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
})

const emit = defineEmits<Emits>()

const email = ref('')
const validationError = ref('')

const hasError = computed(() => {
  return !!(props.errors.paypalEmail || validationError.value)
})

const errorMessage = computed(() => {
  return props.errors.paypalEmail || validationError.value || ''
})

const validateEmail = () => {
  const value = email.value.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!value) {
    validationError.value = 'PayPal email is required'
  }
  else if (!emailRegex.test(value)) {
    validationError.value = 'Invalid email address'
  }
  else {
    validationError.value = ''
  }
}

const onEmailInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  email.value = input.value
  emit('update:modelValue', { email: email.value })
}

// Initialize from props
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.email !== email.value) {
    email.value = newValue.email
  }
}, { immediate: true })
</script>
