<template>
  <Transition name="slide-up">
    <div 
      v-if="showPrompt"
      class="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
    >
      <div class="flex items-start space-x-3">
        <!-- App Icon -->
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ $t('pwa.installTitle') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ $t('pwa.installDescription') }}
          </p>
          
          <!-- Actions -->
          <div class="flex items-center space-x-3 mt-3">
            <Button
              @click="handleInstall"
              :disabled="installing"
              size="sm"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="installing" class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ installing ? $t('pwa.installing') : $t('pwa.install') }}
            </Button>

            <Button
              variant="link"
              size="sm"
              @click="handleDismiss"
              class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-0 h-auto"
            >
              {{ $t('pwa.notNow') }}
            </Button>
          </div>
        </div>
        
        <!-- Close Button -->
        <Button
          variant="ghost"
          size="icon"
          @click="handleDismiss"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

const pwa = usePWA()
const { vibrate } = useHapticFeedback()

// Map showInstallPrompt to isInstallable
const isInstallable = computed(() => pwa?.showInstallPrompt ?? false)

const showPrompt = ref(false)
const installing = ref(false)
const dismissed = ref(false)

// Show prompt when installable and not dismissed
watch(isInstallable, (installable) => {
  if (installable && !dismissed.value) {
    // Delay showing prompt to avoid being intrusive
    setTimeout(() => {
      showPrompt.value = true
    }, 3000)
  }
})

// Handle install
const handleInstall = async () => {
  installing.value = true
  vibrate('buttonPress')

  try {
    const result = await pwa?.install()
    const success = result?.outcome === 'accepted'

    if (success) {
      showPrompt.value = false
      vibrate('success')
    } else {
      vibrate('error')
    }
  } catch (error) {
    console.error('Installation failed:', error)
    vibrate('error')
  } finally {
    installing.value = false
  }
}

// Handle dismiss
const handleDismiss = () => {
  showPrompt.value = false
  dismissed.value = true
  vibrate('tap')

  // Remember dismissal for this session
  if (process.client) {
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }
}

// Check if previously dismissed
onMounted(() => {
  if (process.client) {
    dismissed.value = sessionStorage.getItem('pwa-install-dismissed') === 'true'
  }
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>