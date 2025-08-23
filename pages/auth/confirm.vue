<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ $t('auth.confirmingAccount') }}
        </h2>
      </div>
      
      <div class="mt-8 space-y-6">
        <div v-if="loading" class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-sm text-gray-600">{{ $t('auth.processing') }}...</p>
        </div>
        
        <div v-else-if="success" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                {{ $t('auth.accountConfirmed') }}
              </h3>
              <p class="mt-1 text-sm text-green-700">
                {{ $t('auth.redirectingToAccount') }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-else-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ $t('auth.confirmationFailed') }}
              </h3>
              <p class="mt-1 text-sm text-red-700">
                {{ error }}
              </p>
            </div>
          </div>
          
          <div class="mt-4">
            <NuxtLink :to="localePath('/auth/login')" class="text-sm font-medium text-primary-600 hover:text-primary-500">
              {{ $t('auth.backToLogin') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()
const localePath = useLocalePath()

const loading = ref(true)
const success = ref(false)
const error = ref('')

const handleAuthCallback = async () => {
  try {
    // Supabase will automatically handle the callback from URL hash
    // We just need to wait for the session to be established
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for auth processing
    
    if (user.value) {
      success.value = true
      
      // Redirect to dashboard after a brief success message
      setTimeout(() => {
        navigateTo(localePath('/account'))
      }, 2000)
    } else {
      throw new Error('Authentication failed')
    }
  } catch (err: any) {
    error.value = err.message || t('auth.confirmationError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  handleAuthCallback()
})

useHead({
  title: t('auth.confirmingAccount')
})
</script>