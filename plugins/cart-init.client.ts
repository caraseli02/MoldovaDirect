export default defineNuxtPlugin(() => {
  // Initialize cart store on client-side
  const cartStore = useCartStore()
  
  // Initialize cart with error handling
  try {
    cartStore.initializeCart()
  } catch (error) {
    console.error('Failed to initialize cart:', error)
    
    // Use toast to show error
    const toast = useToast()
    toast.error('Error de inicialización', 'No se pudo cargar el carrito guardado')
  }
})