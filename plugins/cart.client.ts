export default defineNuxtPlugin(() => {
  // Initialize cart on client side
  const { initializeCart } = useCartStore()
  
  // Initialize cart when the plugin loads
  initializeCart()
})