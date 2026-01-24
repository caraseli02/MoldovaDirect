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

      <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
      >
        <div>
          <UiLabel for="email">
            Recipient Email
          </UiLabel>
          <UiInput
            id="email"
            v-model="email"
            type="email"
            placeholder="qa@example.com"
            required
          />
        </div>

        <div>
          <UiLabel for="emailType">
            Email Type
          </UiLabel>
          <UiSelect v-model="selectedType">
            <UiSelectTrigger class="w-full">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="option in emailTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <div v-if="selectedType === 'order_issue'">
          <UiLabel for="issueDescription">
            Issue Description
          </UiLabel>
          <UiTextarea
            id="issueDescription"
            v-model="issueDescription"
            rows="3"
            placeholder="Optional context for the issue email"
          />
        </div>

        <div>
          <UiLabel for="locale">
            Locale
          </UiLabel>
          <UiSelect v-model="locale">
            <UiSelectTrigger class="w-full">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="option in localeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <div class="flex items-center justify-between">
          <UiButton
            type="submit"
            :disabled="loading"
          >
            <span v-if="!loading">Send Test Email</span>
            <span
              v-else
              class="flex items-center space-x-2"
            >
              <span class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Sending…</span>
            </span>
          </UiButton>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Generates temporary orders tagged as <strong>TEST</strong> and deletes them afterwards.
          </p>
        </div>
      </form>

      <div
        v-if="successMessage"
        class="mt-6 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-300"
      >
        {{ successMessage }}
      </div>

      <div
        v-if="errorMessage"
        class="mt-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
      >
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
  middleware: 'admin',
})

useHead({
  title: 'Email Testing - Admin',
})

const email = ref('')
const selectedType = ref<EmailType>('order_confirmation')
const issueDescription = ref('Customer reported a damaged parcel on delivery (test data).')
const locale = ref('en')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const emailTypeOptions: Array<{ value: EmailType, label: string }> = [
  { value: 'order_confirmation', label: 'Order Confirmation' },
  { value: 'order_processing', label: 'Order Processing' },
  { value: 'order_shipped', label: 'Order Shipped' },
  { value: 'order_delivered', label: 'Order Delivered' },
  { value: 'order_cancelled', label: 'Order Cancelled' },
  { value: 'order_issue', label: 'Order Issue' },
]

const localeOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'ro', label: 'Română' },
  { value: 'ru', label: 'Русский' },
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
        email: email.value.trim() as any,
        type: selectedType.value,
        locale: locale.value,
        issueDescription: selectedType.value === 'order_issue' ? issueDescription.value : undefined,
      },
    })

    successMessage.value = `✔ Test email queued successfully. Check ${email.value} for “${response.subject}”.`
  }
  catch (error: unknown) {
    errorMessage.value = getErrorMessage(error) || 'Failed to send test email.'
  }
  finally {
    loading.value = false
  }
}
</script>
