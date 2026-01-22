<!--
  Email Template Manager Component

  Requirements addressed:
  - 5.1: Edit email template HTML and styling
  - 5.2: Preview function to test email appearance
  - 5.4: Validate HTML structure
  - 5.5: Manage templates for each supported locale
-->

<template>
  <div class="space-y-6">
    <!-- Template Type Selection -->
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Select Template Type</UiCardTitle>
      </UiCardHeader>
      <UiCardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UiButton
            v-for="type in templateTypes"
            :key="type.value"
            :class="['p-4 border-2 rounded-lg text-left transition-all', selectedType === type.value ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300']"
            @click="selectedType = type.value"
          >
            <div class="font-semibold text-gray-900 dark:text-white">
              {{ type.label }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ type.description }}
            </div>
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Locale Selection -->
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Select Language</UiCardTitle>
      </UiCardHeader>
      <UiCardContent>
        <div class="flex gap-2">
          <UiButton
            v-for="locale in supportedLocales"
            :key="locale.code"
            :class="['px-4 py-2 rounded-lg font-medium transition-all', selectedLocale === locale.code ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200']"
            @click="selectedLocale = locale.code"
          >
            {{ locale.name }}
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Version History and Synchronization -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminEmailTemplateHistory
        :template-type="selectedType"
        :locale="selectedLocale"
        @rollback="loadTemplate"
      />
      <AdminEmailTemplateSynchronizer
        :template-type="selectedType"
        @synchronized="loadTemplate"
      />
    </div>

    <!-- Template Editor -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Editor Panel -->
      <UiCard>
        <UiCardHeader>
          <div class="flex items-center justify-between">
            <UiCardTitle>Template Editor</UiCardTitle>
            <div class="flex gap-2">
              <UiButton>
                variant="outline"
                size="sm"
                @click="validateTemplate"
                >
                Validate
              </UiButton>
              <UiButton>
                :disabled="saving || !hasChanges"
                size="sm"
                @click="saveTemplate"
                >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </UiButton>
            </div>
          </div>
        </UiCardHeader>
        <UiCardContent>
          <!-- Subject Line -->
          <div class="mb-4">
            <UiLabel>Subject Line</UiLabel>
            <UiInput
              v-model="templateData.subject"
              type="text"
              placeholder="Order Confirmation #{orderNumber}"
            />
          </div>

          <!-- Preheader Text -->
          <div class="mb-4">
            <UiLabel>Preheader Text</UiLabel>
            <UiInput
              v-model="templateData.preheader"
              type="text"
              placeholder="Thank you for your order"
            />
          </div>

          <!-- Template Content -->
          <div class="mb-4">
            <UiLabel>Template Content (JSON)</UiLabel>
            <UiTextarea
              v-model="templateContent"
              rows="20"
              placeholder="Enter template translations JSON"
            />
          </div>

          <!-- Validation Messages -->
          <div
            v-if="validationErrors.length > 0"
            class="mt-4"
          >
            <UiAlert variant="destructive">
              <UiAlertTitle>Validation Errors</UiAlertTitle>
              <UiAlertDescription>
                <ul class="list-disc list-inside space-y-1">
                  <li
                    v-for="(error, index) in validationErrors"
                    :key="index"
                  >
                    {{ error }}
                  </li>
                </ul>
              </UiAlertDescription>
            </UiAlert>
          </div>

          <div
            v-if="validationWarnings.length > 0"
            class="mt-4"
          >
            <UiAlert>
              <UiAlertTitle>Warnings</UiAlertTitle>
              <UiAlertDescription>
                <ul class="list-disc list-inside space-y-1">
                  <li
                    v-for="(warning, index) in validationWarnings"
                    :key="index"
                  >
                    {{ warning }}
                  </li>
                </ul>
              </UiAlertDescription>
            </UiAlert>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Preview Panel -->
      <UiCard>
        <UiCardHeader>
          <div class="flex items-center justify-between">
            <UiCardTitle>Preview</UiCardTitle>
            <UiButton>
              variant="outline"
              size="sm"
              @click="refreshPreview"
              >
              Refresh Preview
            </UiButton>
          </div>
        </UiCardHeader>
        <UiCardContent>
          <div class="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <iframe
              ref="previewFrame"
              :srcdoc="previewHtml"
              class="w-full h-[600px] bg-white"
              sandbox="allow-same-origin"
            ></iframe>
          </div>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'

const templateTypes = [
  {
    value: 'order_confirmation',
    label: 'Order Confirmation',
    description: 'Sent when order is placed',
  },
  {
    value: 'order_processing',
    label: 'Order Processing',
    description: 'Sent when order is being processed',
  },
  {
    value: 'order_shipped',
    label: 'Order Shipped',
    description: 'Sent when order is shipped',
  },
  {
    value: 'order_delivered',
    label: 'Order Delivered',
    description: 'Sent when order is delivered',
  },
  {
    value: 'order_cancelled',
    label: 'Order Cancelled',
    description: 'Sent when order is cancelled',
  },
  {
    value: 'order_issue',
    label: 'Order Issue',
    description: 'Sent when there is an issue',
  },
]

const supportedLocales = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'ro', name: 'Română' },
  { code: 'ru', name: 'Русский' },
]

const selectedType = ref('order_confirmation')
const selectedLocale = ref('en')
const templateContent = ref('')
const templateData = ref({
  subject: '',
  preheader: '',
})
const previewHtml = ref('')
const saving = ref(false)
const hasChanges = ref(false)
const validationErrors = ref<string[]>([])
const validationWarnings = ref<string[]>([])
const previewFrame = ref<HTMLIFrameElement>()

// Load template when type or locale changes
watch([selectedType, selectedLocale], async () => {
  await loadTemplate()
})

// Track changes
watch([templateContent, templateData], () => {
  hasChanges.value = true
}, { deep: true })

// Load template from server
async function loadTemplate() {
  try {
    const { data } = await useFetch('/api/admin/email-templates/get', {
      params: {
        type: selectedType.value,
        locale: selectedLocale.value,
      },
    })

    if (data.value) {
      templateContent.value = JSON.stringify(data.value.translations, null, 2)
      templateData.value = {
        subject: data.value.subject || '',
        preheader: data.value.preheader || '',
      }
      hasChanges.value = false
      await refreshPreview()
    }
  }
  catch (error: unknown) {
    console.error('Failed to load template:', error)
  }
}

// Validate template
function validateTemplate() {
  validationErrors.value = []
  validationWarnings.value = []

  // Validate JSON
  try {
    const parsed = JSON.parse(templateContent.value)

    // Check required fields
    const requiredFields = ['title', 'greeting', 'message', 'orderNumber', 'orderDate', 'thankYou']
    for (const field of requiredFields) {
      if (!parsed[field]) {
        validationErrors.value.push(`Missing required field: ${field}`)
      }
    }

    // Check for placeholder syntax
    const placeholderRegex = /\{(\w+)\}/g
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        const matches = value.match(placeholderRegex)
        if (matches) {
          validationWarnings.value.push(`Field "${key}" contains placeholders: ${matches.join(', ')}`)
        }
      }
    }
  }
  catch {
    validationErrors.value.push('Invalid JSON format')
  }

  // Validate subject
  if (!templateData.value.subject) {
    validationErrors.value.push('Subject line is required')
  }

  if (validationErrors.value.length === 0) {
    useToast().success('Template validation passed')
  }
}

// Refresh preview
async function refreshPreview() {
  try {
    const { data } = await useFetch('/api/admin/email-templates/preview', {
      method: 'POST',
      body: {
        type: selectedType.value,
        locale: selectedLocale.value,
        translations: JSON.parse(templateContent.value),
        subject: templateData.value.subject,
        preheader: templateData.value.preheader,
      },
    })

    if (data.value) {
      previewHtml.value = data.value.html
    }
  }
  catch (error: unknown) {
    console.error('Failed to generate preview:', error)
    useToast().error('Failed to generate preview')
  }
}

// Save template
async function saveTemplate() {
  validateTemplate()

  if (validationErrors.value.length > 0) {
    useToast().error('Please fix validation errors before saving')
    return
  }

  saving.value = true
  try {
    await $fetch('/api/admin/email-templates/save', {
      method: 'POST',
      body: {
        type: selectedType.value,
        locale: selectedLocale.value,
        translations: JSON.parse(templateContent.value) as any,
        subject: templateData.value.subject,
        preheader: templateData.value.preheader,
      },
    })

    hasChanges.value = false
    useToast().success('Template saved successfully')
  }
  catch (error: unknown) {
    console.error('Failed to save template:', error)
    useToast().error('Failed to save template')
  }
  finally {
    saving.value = false
  }
}

// Initialize
onMounted(() => {
  loadTemplate()
})
</script>
