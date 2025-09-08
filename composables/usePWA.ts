/**
 * Progressive Web App composable
 * Provides PWA installation, offline detection, and push notification capabilities
 */
export const useCustomPWA = () => {
  const isOnline = ref(true)
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const updateAvailable = ref(false)
  const pushSupported = ref(false)
  const pushPermission = ref<NotificationPermission>('default')
  
  let deferredPrompt: any = null
  let registration: ServiceWorkerRegistration | null = null
  
  // Check if app is installed
  const checkInstallStatus = () => {
    if (process.client) {
      // Check if running in standalone mode (installed)
      isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true
    }
  }
  
  // Handle install prompt
  const handleInstallPrompt = (event: Event) => {
    event.preventDefault()
    deferredPrompt = event
    isInstallable.value = true
  }
  
  // Install PWA
  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) return false
    
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        isInstallable.value = false
        isInstalled.value = true
        deferredPrompt = null
        return true
      }
      
      return false
    } catch (error) {
      console.error('PWA installation failed:', error)
      return false
    }
  }
  
  // Check for app updates
  const checkForUpdates = async () => {
    if (!registration) return
    
    try {
      await registration.update()
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }
  
  // Handle service worker updates
  const handleServiceWorkerUpdate = (event: Event) => {
    updateAvailable.value = true
  }
  
  // Apply update
  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }
  
  // Push notification functionality
  const checkPushSupport = () => {
    if (process.client) {
      pushSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
      pushPermission.value = Notification.permission
    }
  }
  
  // Request push notification permission
  const requestPushPermission = async (): Promise<boolean> => {
    if (!pushSupported.value) return false
    
    try {
      const permission = await Notification.requestPermission()
      pushPermission.value = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request push permission:', error)
      return false
    }
  }
  
  // Subscribe to push notifications
  const subscribeToPush = async (vapidKey: string): Promise<PushSubscription | null> => {
    if (!registration || pushPermission.value !== 'granted') return null
    
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      })
      
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }
  
  // Unsubscribe from push notifications
  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!registration) return false
    
    try {
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }
  
  // Show local notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (pushPermission.value === 'granted') {
      new Notification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        ...options
      })
    }
  }
  
  // Handle online/offline status
  const handleOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }
  
  // Initialize PWA functionality
  const initializePWA = async () => {
    if (!process.client) return
    
    // Check install status
    checkInstallStatus()
    
    // Check push support
    checkPushSupport()
    
    // Handle online/offline events
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)
    handleOnlineStatus()
    
    // Handle install prompt
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    
    // Handle app installed
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      isInstallable.value = false
    })
    
    // Register service worker events
    if ('serviceWorker' in navigator) {
      try {
        registration = await navigator.serviceWorker.ready
        
        // Handle updates
        registration.addEventListener('updatefound', handleServiceWorkerUpdate)
        
        // Handle messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'UPDATE_AVAILABLE') {
            updateAvailable.value = true
          }
        })
        
      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }
  }
  
  // Cleanup
  const cleanup = () => {
    if (process.client) {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
    }
  }
  
  // Initialize on mount
  onMounted(() => {
    initializePWA()
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    // State
    isOnline: readonly(isOnline),
    isInstallable: readonly(isInstallable),
    isInstalled: readonly(isInstalled),
    updateAvailable: readonly(updateAvailable),
    pushSupported: readonly(pushSupported),
    pushPermission: readonly(pushPermission),
    
    // Methods
    installPWA,
    checkForUpdates,
    applyUpdate,
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showNotification
  }
}