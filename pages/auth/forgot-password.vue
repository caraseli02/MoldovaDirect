<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Mobile-optimized container -->
    <div class="flex-1 flex items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
      <div class="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        <!-- Logo/Brand area -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
            <svg
              class="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ $t('auth.forgotPassword') }}
          </h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
            {{ $t('auth.forgotPasswordInstructions') }}
          </p>
        </div>

        <!-- Card container -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-gray-700 p-6 sm:p-8">
          <form
            class="space-y-5"
            @submit.prevent="handleForgotPassword"
          >
            <!-- Alert messages -->
            <Transition name="slide-fade">
              <div
                v-if="success"
                class="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 sm:p-4"
              >
                <div class="flex items-start">
                  <svg
                    class="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <div class="ml-3 text-sm text-green-800 dark:text-green-300">
                    {{ message }}
                  </div>
                </div>
              </div>
            </Transition>

            <Transition name="slide-fade">
              <div
                v-if="error"
                class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 sm:p-4"
              >
                <div class="flex items-start">
                  <svg
                    class="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <div class="ml-3 text-sm text-red-800 dark:text-red-300">
                    {{ error }}
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Email input with floating label -->
            <div class="relative">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="peer w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-500 rounded-xl text-gray-900 dark:text-white placeholder-transparent focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-all bg-white dark:bg-gray-700"
                placeholder="Email"
              />
              <label
                for="email"
                class="absolute left-3 -top-2.5 bg-gray-50 dark:bg-gray-800 px-2 text-sm text-gray-600 dark:text-gray-300 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-primary-600 dark:peer-focus:text-primary-400"
              >
                {{ $t('auth.email') }}
              </label>
            </div>

            <!-- Submit button with modern styling -->
            <UiButton
              type="submit"
              :disabled="loading || success"
              class="w-full"
              size="lg"
            >
              <commonIcon
                v-if="loading"
                name="lucide:loader-2"
                class="mr-2 h-5 w-5 animate-spin"
              />
              <commonIcon
                v-else
                name="lucide:mail"
                class="mr-2 h-5 w-5"
              />
              {{ loading ? $t('common.loading') : $t('auth.sendResetEmail') }}
            </UiButton>

            <!-- Back to login link -->
            <div class="text-center pt-4">
              <NuxtLink
                :to="localePath('/auth/login')"
                class="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-200 transition-colors"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                {{ $t('auth.backToLogin') }}
              </NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Apply guest middleware - redirect authenticated users
definePageMeta({
  middleware: 'guest',
})

const supabase = useSupabaseClient()
const _user = useSupabaseUser()
const { t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()

const form = ref({
  email: '',
})

const error = ref('')
const success = ref(false)
const message = ref('')
const loading = ref(false)

const handleForgotPassword = async () => {
  error.value = ''
  success.value = false
  loading.value = true

  try {
    const siteUrl = runtimeConfig.public.siteUrl || window.location.origin
    const { error: authError } = await supabase.auth.resetPasswordForEmail(form.value.email, {
      redirectTo: `${siteUrl}${localePath('/auth/reset-password')}`,
    })

    if (authError) {
      throw authError
    }

    success.value = true
    message.value = t('auth.passwordResetSent')
  }
  catch (err: unknown) {
    error.value = err.message || t('auth.forgotPasswordError')
  }
  finally {
    loading.value = false
  }
}

useHead({
  title: t('auth.forgotPassword'),
})
</script>
