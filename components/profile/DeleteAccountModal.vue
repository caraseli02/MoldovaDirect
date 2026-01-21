<template>
  <AlertDialog
    :open="true"
    @update:open="handleOpenChange"
  >
    <AlertDialogContent class="sm:max-w-md">
      <AlertDialogHeader>
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full">
              <commonIcon
                name="lucide:alert-triangle"
                class="w-6 h-6 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            </div>
          </div>
          <div>
            <AlertDialogTitle class="text-gray-900 dark:text-white">
              {{ $t('profile.deleteAccount') }}
            </AlertDialogTitle>
            <AlertDialogDescription class="text-gray-500 dark:text-gray-400">
              {{ $t('profile.deleteAccountWarning') }}
            </AlertDialogDescription>
          </div>
        </div>
      </AlertDialogHeader>

      <div class="my-4">
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
          <UiLabel for="confirmation">
            {{ $t('profile.deleteConfirmationLabel') }}
          </UiLabel>
          <UiInput
            id="confirmation"
            ref="confirmationInput"
            v-model="confirmationText"
            type="text"
            required
            :aria-invalid="!!errors.confirmation"
            :aria-describedby="errors.confirmation ? 'confirmation-error confirmation-hint' : 'confirmation-hint'"
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
          <UiLabel for="password">
            {{ $t('profile.confirmPassword') }}
          </UiLabel>
          <UiInput
            id="password"
            v-model="password"
            type="password"
            required
            :aria-invalid="!!errors.password"
            :aria-describedby="errors.password ? 'password-error' : undefined"
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
          <UiLabel for="reason">
            {{ $t('profile.deleteReason') }} ({{ $t('common.optional') }})
          </UiLabel>
          <UiSelect
            id="reason"
            v-model="reason"
          >
            <UiSelectTrigger>
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="">
                {{ $t('profile.selectReason') }}
              </UiSelectItem>
              <UiSelectItem value="not_using">
                {{ $t('profile.deleteReasons.notUsing') }}
              </UiSelectItem>
              <UiSelectItem value="privacy_concerns">
                {{ $t('profile.deleteReasons.privacyConcerns') }}
              </UiSelectItem>
              <UiSelectItem value="found_alternative">
                {{ $t('profile.deleteReasons.foundAlternative') }}
              </UiSelectItem>
              <UiSelectItem value="technical_issues">
                {{ $t('profile.deleteReasons.technicalIssues') }}
              </UiSelectItem>
              <UiSelectItem value="other">
                {{ $t('profile.deleteReasons.other') }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <!-- Action Buttons -->
        <AlertDialogFooter class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <AlertDialogCancel
            :aria-label="$t('common.cancel')"
            class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
          >
            {{ $t('common.cancel') }}
          </AlertDialogCancel>
          <AlertDialogAction
            type="submit"
            :disabled="isLoading || !isFormValid"
            :aria-label="$t('profile.confirmDelete')"
            :aria-busy="isLoading"
            class="px-6 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            @click.prevent="handleSubmit"
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
          </AlertDialogAction>
        </AlertDialogFooter>
      </form>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getErrorMessage } from '~/utils/errorUtils'
import type { ToastPlugin } from '~/types/plugins'

interface Emits {
  (e: 'confirm', data: { password: string, reason?: string }): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const { t } = useI18n()
const nuxtApp = useNuxtApp()
const $toast = nuxtApp.$toast as ToastPlugin

// Input ref for auto-focus
const confirmationInput = ref<HTMLInputElement>()

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

// Handle dialog open state change (for cancel/close)
const handleOpenChange = (open: boolean) => {
  if (!open) {
    emit('close')
  }
}

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
  catch (error: unknown) {
    console.error('Error confirming account deletion:', error)
    const errorMsg = getErrorMessage(error)
    $toast.error(errorMsg || t('profile.errors.deleteFailed'))
  }
  finally {
    isLoading.value = false
  }
}

// Focus the confirmation input when modal opens
onMounted(() => {
  nextTick(() => {
    confirmationInput.value?.focus()
  })
})
</script>
