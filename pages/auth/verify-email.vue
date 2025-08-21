<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ $t('auth.emailVerification') }}
        </h2>
      </div>
      
      <div class="mt-8 space-y-6">
        <div v-if="loading" class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-sm text-gray-600">{{ $t('auth.verifying') }}...</p>
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
                {{ $t('auth.emailVerified') }}
              </h3>
              <p class="mt-1 text-sm text-green-700">
                {{ message }}
              </p>
            </div>
          </div>
          <div class="mt-4">
            <NuxtLink :to="localePath('/auth/login')" class="text-sm font-medium text-primary-600 hover:text-primary-500">
              {{ $t('auth.signIn') }} →
            </NuxtLink>
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
                {{ $t('auth.verificationFailed') }}
              </h3>
              <p class="mt-1 text-sm text-red-700">
                {{ error }}
              </p>
            </div>
          </div>
          
          <div class="mt-4 space-y-2">
            <div class="flex space-x-2">
              <input
                v-model="email"
                type="email"
                :placeholder="$t('auth.email')"
                class="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
              <button
                @click="resendVerification"
                :disabled="resendLoading || !email"
                class="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50"
              >
                {{ resendLoading ? $t('common.loading') : $t('auth.resendVerification') }}
              </button>
            </div>
            <NuxtLink :to="localePath('/auth/login')" class="block text-sm font-medium text-gray-600 hover:text-gray-500">
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
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const loading = ref(true)
const success = ref(false)
const error = ref('')
const message = ref('')
const resendLoading = ref(false)
const email = ref('')

const verifyEmail = async () => {
  try {
    // Check if we have verification tokens in the URL
    const hash = window.location.hash
    if (hash) {
      // Supabase will automatically handle email verification from hash
      // Check if user is now authenticated
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait a bit for auth to process
      
      if (user.value && user.value.email_confirmed_at) {
        success.value = true
        message.value = t('auth.emailVerified')
      } else {
        throw new Error('Verification failed')
      }
    } else {
      throw new Error('Missing verification link')
    }
  } catch (err: any) {
    error.value = err.message || t('auth.verificationError')
  } finally {
    loading.value = false
  }
}

const resendVerification = async () => {
  if (!email.value) {
    error.value = t('auth.emailRequired')
    return
  }
  
  resendLoading.value = true
  try {
    const { error: authError } = await supabase.auth.resend({
      type: 'signup',
      email: email.value,
      options: {
        emailRedirectTo: `${window.location.origin}${localePath('/auth/verify-email')}`
      }
    })
    
    if (authError) {
      throw authError
    }
    
    message.value = t('auth.verificationResent')
    error.value = ''
  } catch (err: any) {
    error.value = err.message || t('auth.resendError')
  } finally {
    resendLoading.value = false
  }
}

onMounted(() => {
  // Get email from query params if available
  const emailParam = route.query.email as string
  if (emailParam) {
    email.value = emailParam
  }
  
  verifyEmail()
})

useHead({
  title: t('auth.emailVerification')
})
</script>