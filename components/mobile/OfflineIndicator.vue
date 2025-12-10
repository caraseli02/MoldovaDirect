<template>
  <Transition name="slide-down">
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium"
    >
      <div class="flex items-center justify-center space-x-2">
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
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
          />
        </svg>
        <span>{{ $t('pwa.offlineMessage') }}</span>
      </div>
    </div>
  </Transition>

  <!-- Back online notification -->
  <Transition name="slide-down">
    <div
      v-if="showBackOnline"
      class="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 text-center text-sm font-medium"
    >
      <div class="flex items-center justify-center space-x-2">
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ $t('pwa.backOnline') }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// Online/offline state detection (not provided by @vite-pwa/nuxt)
const isOnline = ref(true)
const showBackOnline = ref(false)
const wasOffline = ref(false)

// Set up online/offline listeners (client-side only)
if (import.meta.client) {
  isOnline.value = navigator.onLine

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  })
}

// Watch for online status changes
watch(isOnline, (online, wasOnlineBefore) => {
  if (!online) {
    wasOffline.value = true
    showBackOnline.value = false
  }
  else if (wasOffline.value && wasOnlineBefore === false) {
    // Show back online message briefly
    showBackOnline.value = true
    setTimeout(() => {
      showBackOnline.value = false
      wasOffline.value = false
    }, 3000)
  }
})
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
