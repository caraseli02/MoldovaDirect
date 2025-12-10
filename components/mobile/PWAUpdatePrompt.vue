<template>
  <Transition name="slide-down">
    <div
      v-if="updateAvailable"
      class="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white rounded-lg shadow-lg p-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- Update Icon -->
          <div class="flex-shrink-0">
            <svg
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h3 class="text-sm font-semibold">
              {{ $t('pwa.updateAvailable') }}
            </h3>
            <p class="text-xs opacity-90 mt-1">
              {{ $t('pwa.updateDescription') }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-2">
          <Button
            :disabled="updating"
            size="sm"
            class="inline-flex items-center px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
            @click="handleUpdate"
          >
            <svg
              v-if="updating"
              class="animate-spin -ml-1 mr-1 h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ updating ? $t('pwa.updating') : $t('pwa.update') }}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            class="text-white hover:text-gray-200 p-1"
            @click="handleDismiss"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

const pwa = usePWA()
const { vibrate } = useHapticFeedback()

// Map needRefresh to updateAvailable
const updateAvailable = computed(() => pwa?.needRefresh ?? false)

const updating = ref(false)

// Handle update
const handleUpdate = async () => {
  updating.value = true
  vibrate('buttonPress')

  try {
    await pwa?.updateServiceWorker(true) // true = reload page after update
    vibrate('success')
  }
  catch (error) {
    console.error('Update failed:', error)
    vibrate('error')
  }
  finally {
    updating.value = false
  }
}

// Handle dismiss
const handleDismiss = () => {
  // Hide the update prompt temporarily
  // Note: In a real app, you might want to store this preference
  vibrate('tap')
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
