<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-8">
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Email Testing Playground
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Trigger transactional email templates with mock order data and verify delivery end-to-end.
        </p>
      </div>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recipient Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="qa@example.com"
            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
        </div>

        <div>
          <label for="emailType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Type
          </label>
          <select
            id="emailType"
            v-model="selectedType"
            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option
              v-for="option in emailTypeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div v-if="selectedType === 'order_issue'">
          <label for="issueDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Issue Description
          </label>
          <textarea
            id="issueDescription"
            v-model="issueDescription"
            rows="3"
            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Optional context for the issue email"
          />
        </div>

        <div>
          <label for="locale" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Locale
          </label>
          <select
            id="locale"
            v-model="locale"
            class="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option v-for="option in localeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            <span v-if="!loading">Send Test Email</span>
            <span v-else class="flex items-center space-x-2">
              <span class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending…</span>
            </span>
          </button>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Generates temporary orders tagged as <strong>TEST</strong> and deletes them afterwards.
          </p>
        </div>
      </form>

      <div v-if="successMessage" class="mt-6 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-300">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="mt-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { EmailType } from '~/types/email'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const email = ref('')
const selectedType = ref<EmailType>('order_confirmation')
const issueDescription = ref('Customer reported a damaged parcel on delivery (test data).')
const locale = ref('en')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const emailTypeOptions: Array<{ value: EmailType; label: string }> = [
  { value: 'order_confirmation', label: 'Order Confirmation' },
  { value: 'order_processing', label: 'Order Processing' },
  { value: 'order_shipped', label: 'Order Shipped' },
  { value: 'order_delivered', label: 'Order Delivered' },
  { value: 'order_cancelled', label: 'Order Cancelled' },
  { value: 'order_issue', label: 'Order Issue' }
]

const localeOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'ro', label: 'Română' },
  { value: 'ru', label: 'Русский' }
]

function validateEmail(target: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)
}

async function handleSubmit() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateEmail(email.value)) {
    errorMessage.value = 'Please enter a valid email address.'
    return
  }

  loading.value = true

  try {
    const response = await $fetch('/api/tools/send-test-email', {
      method: 'POST',
      body: {
        email: email.value.trim(),
        type: selectedType.value,
        locale: locale.value,
        issueDescription: selectedType.value === 'order_issue' ? issueDescription.value : undefined
      }
    })

    successMessage.value = `✔ Test email queued successfully. Check ${email.value} for “${response.subject}”.`
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error.message || 'Failed to send test email.'
  } finally {
    loading.value = false
  }
}
</script>
