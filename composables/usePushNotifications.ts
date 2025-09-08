/**
 * Push notifications composable for stock alerts and product updates
 * Handles subscription management and notification preferences
 */
export const usePushNotifications = () => {
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const subscription = ref<PushSubscription | null>(null)
  const preferences = ref({
    stockAlerts: true,
    newProducts: true,
    priceDrops: true,
    orderUpdates: true
  })
  
  const { pushSupported, pushPermission, subscribeToPush, unsubscribeFromPush } = useCustomPWA()
  
  // VAPID public key (in production, this should come from environment variables)
  const VAPID_PUBLIC_KEY = 'your-vapid-public-key-here'
  
  // Check subscription status
  const checkSubscriptionStatus = async () => {
    if (!pushSupported.value) return
    
    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()
      
      if (existingSubscription) {
        subscription.value = existingSubscription
        isSubscribed.value = true
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error)
    }
  }
  
  // Subscribe to push notifications
  const subscribe = async (): Promise<boolean> => {
    if (!pushSupported.value || pushPermission.value !== 'granted') {
      return false
    }
    
    try {
      const newSubscription = await subscribeToPush(VAPID_PUBLIC_KEY)
      
      if (newSubscription) {
        subscription.value = newSubscription
        isSubscribed.value = true
        
        // Send subscription to server
        await sendSubscriptionToServer(newSubscription)
        
        // Save preferences
        savePreferences()
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return false
    }
  }
  
  // Unsubscribe from push notifications
  const unsubscribe = async (): Promise<boolean> => {
    try {
      const success = await unsubscribeFromPush()
      
      if (success) {
        // Remove subscription from server
        if (subscription.value) {
          await removeSubscriptionFromServer(subscription.value)
        }
        
        subscription.value = null
        isSubscribed.value = false
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }
  
  // Send subscription to server
  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      await $fetch('/api/push/subscribe', {
        method: 'POST',
        body: {
          subscription: subscription.toJSON(),
          preferences: preferences.value
        }
      })
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }
  
  // Remove subscription from server
  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    try {
      await $fetch('/api/push/unsubscribe', {
        method: 'POST',
        body: {
          subscription: subscription.toJSON()
        }
      })
    } catch (error) {
      console.error('Failed to remove subscription from server:', error)
    }
  }
  
  // Update notification preferences
  const updatePreferences = async (newPreferences: Partial<typeof preferences.value>) => {
    preferences.value = { ...preferences.value, ...newPreferences }
    
    if (isSubscribed.value && subscription.value) {
      try {
        await $fetch('/api/push/preferences', {
          method: 'PUT',
          body: {
            subscription: subscription.value.toJSON(),
            preferences: preferences.value
          }
        })
        
        savePreferences()
      } catch (error) {
        console.error('Failed to update preferences:', error)
      }
    }
  }
  
  // Subscribe to stock alerts for a specific product
  const subscribeToStockAlert = async (productId: number) => {
    if (!isSubscribed.value) return false
    
    try {
      await $fetch('/api/push/stock-alert', {
        method: 'POST',
        body: {
          productId,
          subscription: subscription.value?.toJSON()
        }
      })
      
      return true
    } catch (error) {
      console.error('Failed to subscribe to stock alert:', error)
      return false
    }
  }
  
  // Unsubscribe from stock alerts for a specific product
  const unsubscribeFromStockAlert = async (productId: number) => {
    if (!isSubscribed.value) return false
    
    try {
      await $fetch('/api/push/stock-alert', {
        method: 'DELETE',
        body: {
          productId,
          subscription: subscription.value?.toJSON()
        }
      })
      
      return true
    } catch (error) {
      console.error('Failed to unsubscribe from stock alert:', error)
      return false
    }
  }
  
  // Save preferences to localStorage
  const savePreferences = () => {
    if (process.client) {
      localStorage.setItem('push-preferences', JSON.stringify(preferences.value))
    }
  }
  
  // Load preferences from localStorage
  const loadPreferences = () => {
    if (process.client) {
      const saved = localStorage.getItem('push-preferences')
      if (saved) {
        try {
          preferences.value = { ...preferences.value, ...JSON.parse(saved) }
        } catch (error) {
          console.error('Failed to load push preferences:', error)
        }
      }
    }
  }
  
  // Initialize
  const initialize = async () => {
    isSupported.value = pushSupported.value
    loadPreferences()
    
    if (isSupported.value) {
      await checkSubscriptionStatus()
    }
  }
  
  // Initialize on mount
  onMounted(() => {
    initialize()
  })
  
  return {
    // State
    isSupported: readonly(isSupported),
    isSubscribed: readonly(isSubscribed),
    preferences: readonly(preferences),
    
    // Methods
    subscribe,
    unsubscribe,
    updatePreferences,
    subscribeToStockAlert,
    unsubscribeFromStockAlert
  }
}