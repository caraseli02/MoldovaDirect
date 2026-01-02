<template>
  <div class="min-h-screen flex flex-col bg-[var(--md-cream)] dark:bg-[var(--md-charcoal)]">
    <div class="flex-1 flex items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
      <div class="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <!-- Logo/Brand area -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[var(--md-wine-muted)] dark:bg-[var(--md-wine)]/20 rounded-2xl mb-4">
            <svg
              class="w-10 h-10 sm:w-12 sm:h-12 text-[var(--md-wine)] dark:text-[var(--md-gold)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 class="font-[family-name:var(--md-font-serif)] text-2xl sm:text-3xl font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
            {{ $t('auth.mfa.verify.title') }}
          </h2>
          <p class="text-sm sm:text-base text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] px-4">
            {{ $t('auth.mfa.verify.description') }}
          </p>
        </div>

        <!-- Card container -->
        <div class="bg-[var(--md-cream-light)] dark:bg-[var(--md-charcoal-light)] rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-[var(--md-gray-700)] p-6 sm:p-8">
          <form
            class="space-y-5"
            @submit.prevent="handleVerify"
          >
            <div class="space-y-2">
              <label
                for="mfa-code"
                class="block text-sm font-medium text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]"
              >
                {{ $t('auth.mfa.verify.codeLabel') }}
              </label>
              <input
                id="mfa-code"
                v-model="code"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                autocomplete="one-time-code"
                required
                class="w-full px-4 py-3 border-2 border-[var(--md-gray-200)] dark:border-[var(--md-gray-600)] rounded-xl text-[var(--md-charcoal)] dark:text-[var(--md-cream)] placeholder:text-[var(--md-gray-500)] focus:border-[var(--md-gold)] dark:focus:border-[var(--md-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--md-gold)]/20 transition-all bg-white dark:bg-[var(--md-charcoal)] text-center text-2xl tracking-widest"
                :class="{
                  'border-red-500 dark:border-red-400': error,
                }"
                :placeholder="$t('auth.mfa.verify.codePlaceholder')"
                :disabled="authStore.mfaLoading"
                @input="handleInput"
              />
            </div>

            <div
              v-if="error"
              class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4"
            >
              <div class="flex items-start">
                <svg
                  class="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5"
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
                <div class="ml-3">
                  <p class="text-sm font-medium text-red-800 dark:text-red-300">
                    {{ error }}
                  </p>
                </div>
              </div>
            </div>

            <UiButton
              type="submit"
              :disabled="authStore.mfaLoading || code.length !== 6"
              class="w-full"
              size="lg"
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

            <div class="text-center pt-2">
              <button
                type="button"
                class="text-sm font-medium text-[var(--md-wine)] hover:text-[var(--md-wine-light)] dark:text-[var(--md-gold)] dark:hover:text-[var(--md-gold-light)] transition-colors"
                @click="handleCancel"
              >
                {{ $t('auth.mfa.verify.cancel') }}
              </button>
            </div>
          </form>

          <!-- Help section -->
          <div class="mt-6 pt-6 border-t border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)]">
            <div class="text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] space-y-2">
              <p class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
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
