<template>
  <div v-if="hasError" class="error-boundary" data-testid="error-boundary">
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
            {{ title || $t('cart.error.boundary.title') }}
          </h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-400">
            <p>{{ message || $t('cart.error.boundary.message') }}</p>
            <p v-if="showDetails && errorDetails" class="mt-2 font-mono text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded" data-testid="error-details">
              {{ errorDetails }}
            </p>
          </div>
          <div class="mt-4 flex space-x-3">
            <button
              @click="retry"
              data-testid="error-retry-button"
              class="bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {{ $t('common.retry') }}
            </button>
            <button
              v-if="showDetails !== undefined"
              @click="toggleDetails"
              :data-testid="showDetails ? 'hide-details-button' : 'show-details-button'"
              class="bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {{ showDetails ? $t('cart.error.boundary.hideDetails') : $t('cart.error.boundary.showDetails') }}
            </button>
            <button
              v-if="fallbackAction"
              @click="fallbackAction"
              data-testid="error-fallback-button"
              class="bg-primary-100 dark:bg-primary-900/30 px-3 py-2 rounded-md text-sm font-medium text-primary-800 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {{ fallbackActionText || $t('cart.error.boundary.fallback') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  fallbackAction?: () => void
  fallbackActionText?: string
  onError?: (error: Error) => void
}

const props = defineProps<Props>()

const hasError = ref(false)
const errorDetails = ref<string>('')
const showDetails = ref(false)

const retry = () => {
  hasError.value = false
  errorDetails.value = ''
  showDetails.value = false
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

// Error handling
const handleError = (error: Error) => {
  hasError.value = true
  errorDetails.value = error.message || 'Unknown error occurred'
  
  // Call custom error handler if provided
  if (props.onError) {
    props.onError(error)
  }
  
  // Log error for debugging
  console.error('ErrorBoundary caught error:', error)
}

// Provide error handler to child components
provide('errorHandler', handleError)

// Global error handler for unhandled promise rejections
onMounted(() => {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof Error) {
      handleError(event.reason)
    }
  })
})

// Vue error handler
onErrorCaptured((error: Error) => {
  handleError(error)
  return false // Prevent error from propagating
})
</script>

<style scoped>
.error-boundary {
  margin: 1rem 0;
}
</style>