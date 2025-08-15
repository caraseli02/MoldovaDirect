<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ $t('auth.createAccount') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ $t('auth.haveAccount') }}
          <NuxtLink :to="localePath('/auth/login')" class="font-medium text-primary-600 hover:text-primary-500">
            {{ $t('auth.signIn') }}
          </NuxtLink>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-800">{{ error }}</div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              {{ $t('auth.fullName') }}
            </label>
            <input
              id="name"
              v-model="form.name"
              name="name"
              type="text"
              autocomplete="name"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              :placeholder="$t('auth.fullName')"
            >
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
              :placeholder="$t('auth.email')"
            >
          </div>
          
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              {{ $t('auth.phone') }} ({{ $t('common.optional') }})
            </label>
            <input
              id="phone"
              v-model="form.phone"
              name="phone"
              type="tel"
              autocomplete="tel"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              :placeholder="$t('auth.phone')"
            >
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              {{ $t('auth.password') }}
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

        <div class="flex items-center">
          <input
            id="terms"
            v-model="form.acceptTerms"
            name="terms"
            type="checkbox"
            required
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          >
          <label for="terms" class="ml-2 block text-sm text-gray-900">
            {{ $t('auth.acceptTerms') }}
            <NuxtLink :to="localePath('/terms')" class="text-primary-600 hover:text-primary-500">
              {{ $t('footer.terms') }}
            </NuxtLink>
            {{ $t('common.and') }}
            <NuxtLink :to="localePath('/privacy')" class="text-primary-600 hover:text-primary-500">
              {{ $t('footer.privacy') }}
            </NuxtLink>
          </label>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !form.acceptTerms"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loading ? $t('common.loading') : $t('auth.signUp') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
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
    await authStore.register({
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone || undefined,
      password: form.value.password,
      preferredLanguage: locale.value
    })
  } catch (err: any) {
    error.value = err.data?.statusMessage || t('auth.registerError')
  } finally {
    loading.value = false
  }
}

useHead({
  title: t('auth.createAccount')
})
</script>