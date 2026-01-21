<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ $t('auth.mfa.verify.title') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ $t('auth.mfa.verify.description') }}
        </p>
      </div>

      <form
        class="mt-8 space-y-6"
        @submit.prevent="handleVerify"
      >
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <UiLabel for="mfa-code">
              {{ $t('auth.mfa.verify.codeLabel') }}
            </UiLabel>
            <UiInput
              id="mfa-code"
              v-model="code"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              autocomplete="one-time-code"
              required
              :class="{ 'border-red-500': error, 'border-gray-300': !error }"
              :placeholder="$t('auth.mfa.verify.codePlaceholder')"
              :disabled="authStore.mfaLoading"
              @input="handleInput"
            />
          </div>
        </div>

        <div
          v-if="error"
          class="rounded-md bg-red-50 p-4"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <UiButton
            type="submit"
            :disabled="authStore.mfaLoading || code.length !== 6"
            class="w-full"
          >
            <template v-if="!authStore.mfaLoading">
              {{ $t('auth.mfa.verify.submitButton') }}
            </template>
            <template v-else>
              <commonIcon
                name="lucide:loader-2"
                class="mr-2 h-5 w-5 animate-spin"
              />
              {{ $t('auth.mfa.verify.verifying') }}
            </template>
          </UiButton>
        </div>

        <div class="text-center">
          <UiButton
            type="button"
            variant="link"
            class="text-sm"
            @click="handleCancel"
          >
            {{ $t('auth.mfa.verify.cancel') }}
          </UiButton>
        </div>
      </form>

      <div class="mt-6 border-t border-gray-200 pt-6">
        <div class="text-sm text-gray-600 space-y-2">
          <p class="font-medium">
            {{ $t('auth.mfa.verify.helpTitle') }}
          </p>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li>{{ $t('auth.mfa.verify.helpItem1') }}</li>
            <li>{{ $t('auth.mfa.verify.helpItem2') }}</li>
            <li>{{ $t('auth.mfa.verify.helpItem3') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAuthValidation } from '~/composables/useAuthValidation'

definePageMeta({
  layout: 'auth' as any,
  middleware: [],
})

const authStore = useAuthStore()
const { validateMFACode } = useAuthValidation()
const route = useRoute()
const supabase = useSupabaseClient()
const localePath = useLocalePath()

const code = ref('')
const error = ref('')

// Handle input to only allow numbers and limit to 6 digits
function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  code.value = target.value.replace(/[^0-9]/g, '').slice(0, 6)
  error.value = ''
}

async function handleVerify(): Promise<void> {
  error.value = ''

  // Validate code format
  const validation = validateMFACode(code.value)
  if (!validation.isValid) {
    error.value = validation.errors?.[0]?.message || 'Invalid MFA code'
    return
  }

  try {
    // Verify MFA code
    await authStore.verifyMFA(code.value)

    // Handle redirect with role-based logic
    const { handleAuthRedirect } = await import('~/utils/authRedirect')
    const redirect = route.query.redirect as string
    const user = useSupabaseUser()

    await handleAuthRedirect(redirect, user.value || null, supabase, localePath, navigateTo)
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? getErrorMessage(err) : 'Verification failed'
  }
}

async function handleCancel(): Promise<void> {
  authStore.mfaChallenge = null
  await authStore.logout()
}

// Auto-focus on the input
onMounted(() => {
  const input = document.getElementById('mfa-code') as HTMLInputElement
  if (input) {
    input.focus()
  }
})
</script>
