export default defineNuxtPlugin(() => {
  // CRITICAL: Ensure cart store is initialized immediately on client
  // This fixes the Vercel hydration issue where addItem is undefined
  if (import.meta.client) {
    try {
      // Wait for next tick to ensure Pinia is fully hydrated
      nextTick(() => {
        try {
          const cartStore = useCartStore()
          if (!cartStore.sessionId) {
            console.log('🛒 Initializing cart store from plugin')
            cartStore.initializeCart()
          } else {
            console.log('🛒 Cart store already initialized, sessionId:', cartStore.sessionId)
          }
        } catch (error) {
          console.error('❌ Cart initialization failed in nextTick:', error)
        }
      })
    } catch (error) {
      console.error('❌ Cart plugin initialization failed:', error)
    }
  }
})