/**
 * Custom PWA composable that wraps @vite-pwa/nuxt's usePWA
 * and provides additional functionality for PWA components
 */
import { computed, ref } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface UseCustomPWAReturn {
  // Update functionality
  updateAvailable: ComputedRef<boolean>
  applyUpdate: () => Promise<void>

  // Installation functionality
  isInstallable: ComputedRef<boolean>
  installPWA: () => Promise<boolean>

  // Online/Offline detection
  isOnline: Ref<boolean>
}

export function useCustomPWA(): UseCustomPWAReturn {
  // Get the PWA instance from @vite-pwa/nuxt
  const pwa = usePWA()

  // Online/offline state - using VueUse's useOnline or manual implementation
  const isOnline = ref(true)

  // Set up online/offline listeners (client-side only)
  if (process.client) {
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

  // Map needRefresh to updateAvailable
  const updateAvailable = computed(() => {
    return pwa?.needRefresh ?? false
  })

  // Map updateServiceWorker to applyUpdate
  const applyUpdate = async () => {
    if (pwa?.updateServiceWorker) {
      await pwa.updateServiceWorker(true) // true = reload page after update
    }
  }

  // Map showInstallPrompt to isInstallable
  const isInstallable = computed(() => {
    return pwa?.showInstallPrompt ?? false
  })

  // Map install to installPWA with proper return type
  const installPWA = async (): Promise<boolean> => {
    if (pwa?.install) {
      try {
        const result = await pwa.install()
        return result?.outcome === 'accepted'
      } catch (error) {
        console.error('PWA installation failed:', error)
        return false
      }
    }
    return false
  }

  return {
    // Update functionality
    updateAvailable,
    applyUpdate,

    // Installation functionality
    isInstallable,
    installPWA,

    // Online/Offline detection
    isOnline,
  }
}
