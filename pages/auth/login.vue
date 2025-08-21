<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ $t('auth.signIn') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ $t('auth.noAccount') }}
          <NuxtLink :to="localePath('/auth/register')" class="font-medium text-primary-600 hover:text-primary-500">
            {{ $t('auth.signUp') }}
          </NuxtLink>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-800">{{ error }}</div>
        </div>

        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="text-sm text-green-800">{{ success }}</div>
        </div>
        
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">{{ $t('auth.email') }}</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              :placeholder="$t('auth.email')"
            >
          </div>
          <div>
            <label for="password" class="sr-only">{{ $t('auth.password') }}</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              :placeholder="$t('auth.password')"
            >
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <NuxtLink :to="localePath('/auth/forgot-password')" class="font-medium text-primary-600 hover:text-primary-500">
              {{ $t('auth.forgotPassword') }}
            </NuxtLink>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loading ? $t('common.loading') : $t('auth.signIn') }}
          </button>
        </div>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">{{ $t('auth.orContinueWith') }}</span>
          </div>
        </div>

        <!-- Magic Link Login -->
        <div>
          <button
            type="button"
            @click="handleMagicLink"
            :disabled="loadingMagic"
            class="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loadingMagic ? $t('common.loading') : $t('auth.sendMagicLink') }}
          </button>
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
  email: '',
  password: ''
})

const error = ref('')
const success = ref('')
const loading = ref(false)
const loadingMagic = ref(false)

const handleLogin = async () => {
  error.value = ''
  success.value = ''
  loading.value = true
  
  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password
    })

    if (authError) {
      throw authError
    }

    // Redirect will happen automatically via watcher
    success.value = t('auth.loginSuccess')
  } catch (err: any) {
    error.value = err.message || t('auth.loginError')
  } finally {
    loading.value = false
  }
}

const handleMagicLink = async () => {
  if (!form.value.email) {
    error.value = t('auth.emailRequired')
    return
  }

  error.value = ''
  success.value = ''
  loadingMagic.value = true

  try {
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: form.value.email,
      options: {
        emailRedirectTo: `${window.location.origin}${localePath('/auth/confirm')}`
      }
    })

    if (authError) {
      throw authError
    }

    success.value = t('auth.magicLinkSent')
  } catch (err: any) {
    error.value = err.message || t('auth.magicLinkError')
  } finally {
    loadingMagic.value = false
  }
}

useHead({
  title: t('auth.signIn')
})
</script>