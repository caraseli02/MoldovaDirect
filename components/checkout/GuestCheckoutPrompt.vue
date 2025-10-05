<template>
  <div v-if="show"
    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
    <div class="flex items-start space-x-3">
      <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd" />
      </svg>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
          {{ $t('checkout.guestCheckout.title') }}
        </h3>
        <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">
          {{ $t('checkout.guestCheckout.description') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-2">
          <NuxtLink :to="localePath('/auth/login')"
            class="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
            {{ $t('auth.login') }}
          </NuxtLink>
          <button @click="$emit('continue-as-guest')"
            class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">
            {{ $t('checkout.continueAsGuest') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
}

defineProps<Props>()

interface Emits {
  (e: 'continue-as-guest'): void
}

defineEmits<Emits>()

const localePath = useLocalePath()
</script>
