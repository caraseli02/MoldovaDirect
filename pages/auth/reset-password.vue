<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ $t('auth.resetPassword') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ $t('auth.resetPasswordInstructions') }}
        </p>
      </div>
      
      <form v-if="!success" class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-800">{{ error }}</div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              {{ $t('auth.newPassword') }}
            </label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              :placeholder="$t('auth.passwordHint')"
            >
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              {{ $t('auth.confirmPassword') }}
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              :placeholder="$t('auth.confirmPassword')"
            >
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loading ? $t('common.loading') : $t('auth.resetPassword') }}
          </button>
        </div>
      </form>
      
      <div v-else class="mt-8 space-y-6">
        <div class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                {{ $t('auth.passwordResetSuccess') }}
              </h3>
              <p class="mt-1 text-sm text-green-700">
                {{ message }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <NuxtLink :to="localePath('/auth/login')" class="font-medium text-primary-600 hover:text-primary-500">
            {{ $t('auth.signIn') }} →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const form = ref({
  password: '',
  confirmPassword: ''
})

const error = ref('')
const success = ref(false)
const message = ref('')
const loading = ref(false)

const handleResetPassword = async () => {
  error.value = ''
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = t('auth.passwordMismatch')
    return
  }
  
  if (form.value.password.length < 8) {
    error.value = t('auth.passwordTooShort')
    return
  }
  
  loading.value = true
  
  try {
    const { error: authError } = await supabase.auth.updateUser({
      password: form.value.password
    })
    
    if (authError) {
      throw authError
    }
    
    success.value = true
    message.value = t('auth.passwordResetSuccess')
  } catch (err: any) {
    error.value = err.message || t('auth.resetPasswordError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Check if we have the access_token and refresh_token from URL hash
  const hash = window.location.hash
  if (!hash) {
    error.value = t('auth.missingToken')
    return
  }
  
  // Supabase will automatically handle the session from URL hash
})

useHead({
  title: t('auth.resetPassword')
})
</script>