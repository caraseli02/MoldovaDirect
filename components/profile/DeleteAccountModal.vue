<template>
  <div
    class="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-account-title"
    aria-describedby="delete-account-description"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        aria-hidden="true"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <div class="flex items-center mb-6">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full">
              <commonIcon
                name="lucide:alert-triangle"
                class="w-6 h-6 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            </div>
          </div>
          <div class="ml-4">
            <h3
              id="delete-account-title"
              class="text-lg font-medium text-gray-900 dark:text-white"
            >
              {{ $t('profile.deleteAccount') }}
            </h3>
            <p
              id="delete-account-description"
              class="text-sm text-gray-500 dark:text-gray-400"
            >
              {{ $t('profile.deleteAccountWarning') }}
            </p>
          </div>
        </div>

        <div class="mb-6">
          <div
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"
            role="alert"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <commonIcon
                  name="lucide:alert-triangle"
                  class="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-red-800 dark:text-red-200">
                  {{ $t('profile.deleteAccountConsequences.title') }}
                </h4>
                <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                  <ul
                    class="list-disc list-inside space-y-1"
                    role="list"
                  >
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

        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <!-- Confirmation Input -->
          <div>
            <label
              for="confirmation"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ $t('profile.deleteConfirmationLabel') }}
            </label>
            <input
              id="confirmation"
              v-model="confirmationText"
              type="text"
              required
              :aria-invalid="!!errors.confirmation"
              :aria-describedby="errors.confirmation ? 'confirmation-error confirmation-hint' : 'confirmation-hint'"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:bg-gray-700 dark:text-white transition-colors"
              :class="{ 'border-red-500': errors.confirmation }"
              :placeholder="$t('profile.deleteConfirmationPlaceholder')"
            />
            <p
              v-if="errors.confirmation"
              id="confirmation-error"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {{ errors.confirmation }}
            </p>
            <p
              id="confirmation-hint"
              class="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              {{ $t('profile.deleteConfirmationHint') }}
            </p>
          </div>

          <!-- Password Confirmation -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ $t('profile.confirmPassword') }}
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              :aria-invalid="!!errors.password"
              :aria-describedby="errors.password ? 'password-error' : undefined"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:bg-gray-700 dark:text-white transition-colors"
              :class="{ 'border-red-500': errors.password }"
              :placeholder="$t('profile.confirmPasswordPlaceholder')"
            />
            <p
              v-if="errors.password"
              id="password-error"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {{ errors.password }}
            </p>
          </div>

          <!-- Reason (Optional) -->
          <div>
            <label
              for="reason"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ $t('profile.deleteReason') }} ({{ $t('common.optional') }})
            </label>
            <select
              id="reason"
              v-model="reason"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="">
                {{ $t('profile.selectReason') }}
              </option>
              <option value="not_using">
                {{ $t('profile.deleteReasons.notUsing') }}
              </option>
              <option value="privacy_concerns">
                {{ $t('profile.deleteReasons.privacyConcerns') }}
              </option>
              <option value="found_alternative">
                {{ $t('profile.deleteReasons.foundAlternative') }}
              </option>
              <option value="technical_issues">
                {{ $t('profile.deleteReasons.technicalIssues') }}
              </option>
              <option value="other">
                {{ $t('profile.deleteReasons.other') }}
              </option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              size="sm"
              :aria-label="$t('common.cancel')"
              class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
              @click="$emit('close')"
            >
              {{ $t('common.cancel') }}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              :disabled="isLoading || !isFormValid"
              :aria-label="$t('profile.confirmDelete')"
              :aria-busy="isLoading"
              class="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              <span
                v-if="isLoading"
                class="flex items-center"
              >
                <commonIcon
                  name="lucide:loader-2"
                  class="animate-spin h-4 w-4 mr-2"
                  aria-hidden="true"
                />
                {{ $t('common.loading') }}
              </span>
              <span v-else>
                {{ $t('profile.confirmDelete') }}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Emits {
  (e: 'confirm', data: { password: string, reason?: string }): void
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
  password: '',
})

// Computed properties
const isFormValid = computed(() => {
  return confirmationText.value.toLowerCase() === 'delete'
    && password.value.length > 0
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
      reason: reason.value || undefined,
    })
  }
  catch (error) {
    console.error('Error confirming account deletion:', error)
  }
  finally {
    isLoading.value = false
  }
}
</script>
