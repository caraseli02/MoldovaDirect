<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ $t('auth.forgotPassword') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ $t('auth.forgotPasswordInstructions') }}
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleForgotPassword">
        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="text-sm text-green-800">{{ message }}</div>
        </div>
        
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-800">{{ error }}</div>
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            {{ $t('auth.email') }}
          </label>
          <input
            id="email"
            v-model="form.email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            :placeholder="$t('auth.emailPlaceholder')"
          >
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || success"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loading ? $t('common.loading') : $t('auth.sendResetEmail') }}
          </button>
        </div>
        
        <div class="text-center">
          <NuxtLink :to="localePath('/auth/login')" class="font-medium text-primary-600 hover:text-primary-500">
            {{ $t('auth.backToLogin') }}
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()
const localePath = useLocalePath()

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    navigateTo(localePath('/dashboard'))
  }
})

const form = ref({
  email: ''
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
    const { error: authError } = await supabase.auth.resetPasswordForEmail(form.value.email, {
      redirectTo: `${window.location.origin}${localePath('/auth/reset-password')}`
    })
    
    if (authError) {
      throw authError
    }
    
    success.value = true
    message.value = t('auth.passwordResetSent')
  } catch (err: any) {
    error.value = err.message || t('auth.forgotPasswordError')
  } finally {
    loading.value = false
  }
}

useHead({
  title: t('auth.forgotPassword')
})
</script>