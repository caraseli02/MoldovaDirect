/**
 * Simple test to verify the refactored cart system works
 */

// Mock the required dependencies
global.$fetch = async () => ({ product: { id: 'test', name: 'Test Product', price: 10, stock: 5 } })
global.process = { client: true, env: { NODE_ENV: 'development' } }

// Import the cart store
const { useCartStore } = require('./stores/cart/index.ts')

async function testCartSystem() {
  console.log('🧪 Testing refactored cart system...')
  
  try {
    // Create cart store instance
    const cartStore = useCartStore()
    
    // Test basic properties
    console.log('✅ Cart store created')
    console.log('📊 Initial state:', {
      isEmpty: cartStore.isEmpty,
      itemCount: cartStore.itemCount,
      subtotal: cartStore.subtotal
    })
    
    // Test that all expected methods exist
    const expectedMethods = [
      'addItem', 'removeItem', 'updateQuantity', 'clearCart',
      'isItemSelected', 'toggleItemSelection', 'toggleSelectAll',
      'validateCart', 'loadRecommendations', 'addToSavedForLater'
    ]
    
    const missingMethods = expectedMethods.filter(method => 
      typeof cartStore[method] !== 'function'
    )
    
    if (missingMethods.length > 0) {
      console.error('❌ Missing methods:', missingMethods)
      return false
    }
    
    console.log('✅ All expected methods are available')
    
    // Test module access
    if (cartStore._modules) {
      const modules = Object.keys(cartStore._modules)
      console.log('✅ Modules available:', modules)
    }
    
    console.log('🎉 Cart system refactoring test passed!')
    return true
    
  } catch (error) {
    console.error('❌ Cart system test failed:', error.message)
    return false
  }
}

// Run the test
testCartSystem().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('Test execution failed:', error)
  process.exit(1)
})