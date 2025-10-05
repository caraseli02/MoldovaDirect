export const useCartCache = () => {
  const isOnline = ref(true)
  const isServiceWorkerSupported = ref(false)
  const serviceWorkerRegistration = ref<ServiceWorkerRegistration | null>(null)

  // Check if service worker is supported
  const checkServiceWorkerSupport = () => {
    if (process.client && 'serviceWorker' in navigator) {
      isServiceWorkerSupported.value = true
      return true
    }
    return false
  }

  // Register cart service worker
  const registerCartServiceWorker = async () => {
    if (!checkServiceWorkerSupport()) {
      console.warn('Service Worker not supported')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw-cart.js', {
        scope: '/'
      })

      serviceWorkerRegistration.value = registration

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              console.log('New service worker available')
            }
          })
        }
      })

      console.log('Cart service worker registered successfully')
      return true
    } catch (error) {
      console.error('Failed to register cart service worker:', error)
      return false
    }
  }

  // Handle messages from service worker
  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data

    switch (type) {
      case 'CART_SYNC_COMPLETE':
        console.log('Cart sync completed:', data)
        break
      default:
        console.log('Unknown service worker message:', type, data)
    }
  }

  // Cache cart data
  const cacheCartData = async (cartData: any) => {
    if (!serviceWorkerRegistration.value) return false

    try {
      // Send message to service worker to cache cart data
      const messageChannel = new MessageChannel()
      
      serviceWorkerRegistration.value.active?.postMessage({
        type: 'CACHE_CART_DATA',
        data: cartData
      }, [messageChannel.port2])

      return true
    } catch (error) {
      console.error('Failed to cache cart data:', error)
      return false
    }
  }

  // Clear cart cache
  const clearCartCache = async () => {
    if (!serviceWorkerRegistration.value) return false

    try {
      serviceWorkerRegistration.value.active?.postMessage({
        type: 'CLEAR_CART_CACHE'
      })

      return true
    } catch (error) {
      console.error('Failed to clear cart cache:', error)
      return false
    }
  }

  // Sync cart data
  const syncCartData = async (cartData: any) => {
    if (!serviceWorkerRegistration.value) return false

    try {
      serviceWorkerRegistration.value.active?.postMessage({
        type: 'SYNC_CART_DATA',
        data: cartData
      })

      // Register background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        await serviceWorkerRegistration.value?.sync?.register('cart-sync')
      }

      return true
    } catch (error) {
      console.error('Failed to sync cart data:', error)
      return false
    }
  }

  // Monitor online/offline status
  const setupOnlineStatusMonitoring = () => {
    if (!process.client) return

    const updateOnlineStatus = () => {
      isOnline.value = navigator.onLine
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Initial status
    updateOnlineStatus()

    // Cleanup on unmount
    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    })
  }

  // Preload critical cart resources
  const preloadCartResources = async () => {
    if (!process.client) return

    try {
      // Preload cart page
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = '/cart'
      document.head.appendChild(link)

      // Preload common product images
      const imageLink = document.createElement('link')
      imageLink.rel = 'prefetch'
      imageLink.href = '/placeholder-product.svg'
      document.head.appendChild(imageLink)
    } catch (error) {
      console.error('Failed to preload cart resources:', error)
    }
  }

  // Initialize cart caching
  const initializeCartCache = async () => {
    if (!process.client) return false

    try {
      await registerCartServiceWorker()
      setupOnlineStatusMonitoring()
      await preloadCartResources()
      return true
    } catch (error) {
      console.error('Failed to initialize cart cache:', error)
      return false
    }
  }

  // Get cache statistics
  const getCacheStats = async () => {
    if (!process.client || !('caches' in window)) return null

    try {
      const cacheNames = await caches.keys()
      const cartCaches = cacheNames.filter(name => name.includes('moldova-direct-cart'))
      
      const stats = {
        totalCaches: cartCaches.length,
        cacheNames: cartCaches,
        totalSize: 0
      }

      // Calculate total cache size (approximate)
      for (const cacheName of cartCaches) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        stats.totalSize += keys.length
      }

      return stats
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return null
    }
  }

  return {
    // State
    isOnline: readonly(isOnline),
    isServiceWorkerSupported: readonly(isServiceWorkerSupported),
    serviceWorkerRegistration: readonly(serviceWorkerRegistration),

    // Methods
    initializeCartCache,
    cacheCartData,
    clearCartCache,
    syncCartData,
    getCacheStats,
    preloadCartResources,

    // Utilities
    checkServiceWorkerSupport
  }
}