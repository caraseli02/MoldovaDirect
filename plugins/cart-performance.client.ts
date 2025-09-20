export default defineNuxtPlugin(async () => {
  // Initialize cart performance optimizations
  try {
    const cartCache = useCartCache()
    await cartCache.initializeCartCache()
    console.log('Cart performance optimizations initialized')
  } catch (error) {
    console.error('Failed to initialize cart performance optimizations:', error)
  }
})