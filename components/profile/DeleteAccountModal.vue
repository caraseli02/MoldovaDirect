<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <div class="flex items-center mb-6">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full">
              <Icon name="exclamation-triangle" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ $t('profile.deleteAccount') }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('profile.deleteAccountWarning') }}
            </p>
          </div>
        </div>

        <div class="mb-6">
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <Icon name="exclamation-triangle" class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-red-800 dark:text-red-200">
                  {{ $t('profile.deleteAccountConsequences.title') }}
                </h4>
                <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                  <ul class="list-disc list-inside space-y-1">
                    <li>{{ $t('profile.deleteAccountConsequences.personalData') }}</li>
                    <li>{{ $t('profile.deleteAccountConsequences.orderHistory') }}</li>
                    <li>{{ $t('profile.deleteAccountConsequences.addresses') }}</li>
                    <li>{{ $t('profile.deleteAccountConsequences.irreversible') }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Confirmation Input -->
          <div>
            <label for="confirmation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('profile.deleteConfirmationLabel') }}
            </label>
            <input
              id="confirmation"
              v-model="confirmationText"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': errors.confirmation }"
              :placeholder="$t('profile.deleteConfirmationPlaceholder')"
            >
            <p v-if="errors.confirmation" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.confirmation }}
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ $t('profile.deleteConfirmationHint') }}
            </p>
          </div>

          <!-- Password Confirmation -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('profile.confirmPassword') }}
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': errors.password }"
              :placeholder="$t('profile.confirmPasswordPlaceholder')"
            >
            <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.password }}
            </p>
          </div>

          <!-- Reason (Optional) -->
          <div>
            <label for="reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('profile.deleteReason') }} ({{ $t('common.optional') }})
            </label>
            <select
              id="reason"
              v-model="reason"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{{ $t('profile.selectReason') }}</option>
              <option value="not_using">{{ $t('profile.deleteReasons.notUsing') }}</option>
              <option value="privacy_concerns">{{ $t('profile.deleteReasons.privacyConcerns') }}</option>
              <option value="found_alternative">{{ $t('profile.deleteReasons.foundAlternative') }}</option>
              <option value="technical_issues">{{ $t('profile.deleteReasons.technicalIssues') }}</option>
              <option value="other">{{ $t('profile.deleteReasons.other') }}</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isLoading" class="flex items-center">
                <Icon name="spinner" class="animate-spin h-4 w-4 mr-2" />
                {{ $t('common.loading') }}
              </span>
              <span v-else>
                {{ $t('profile.confirmDelete') }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'confirm', data: { password: string; reason?: string }): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const { t } = useI18n()

// Reactive state
const isLoading = ref(false)
const confirmationText = ref('')
const password = ref('')
const reason = ref('')

// Form validation
const errors = reactive({
  confirmation: '',
  password: ''
})

// Computed properties
const isFormValid = computed(() => {
  return confirmationText.value.toLowerCase() === 'delete' && 
         password.value.length > 0
})

// Form validation
const validateForm = (): boolean => {
  errors.confirmation = ''
  errors.password = ''

  if (confirmationText.value.toLowerCase() !== 'delete') {
    errors.confirmation = t('profile.validation.confirmationRequired')
    return false
  }

  if (!password.value) {
    errors.password = t('profile.validation.passwordRequired')
    return false
  }

  return true
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    emit('confirm', {
      password: password.value,
      reason: reason.value || undefined
    })
  } catch (error) {
    console.error('Error confirming account deletion:', error)
  } finally {
    isLoading.value = false
  }
}
</script>