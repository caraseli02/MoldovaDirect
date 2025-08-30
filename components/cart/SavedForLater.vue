<template>
  <div v-if="savedForLaterCount > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
    <div class="p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">
          Guardado para después ({{ savedForLaterCount }})
        </h2>
        <button
          @click="handleClearAll"
          class="text-sm text-red-600 hover:text-red-800 underline"
        >
          Eliminar todo
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="item in savedForLater"
          :key="item.id"
          class="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <!-- Product Image -->
          <div class="flex-shrink-0">
            <img 
              :src="item.product.images[0] || '/placeholder-product.jpg'" 
              :alt="item.product.name"
              class="w-16 h-16 object-cover rounded-lg"
            >
          </div>
          
          <!-- Product Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-gray-900 truncate">
              {{ item.product.name }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ formatPrice(item.product.price) }} each
            </p>
            <p class="text-xs text-gray-400">
              Guardado {{ formatSavedDate(item.savedAt) }}
            </p>
          </div>
          
          <!-- Quantity -->
          <div class="text-sm text-gray-600">
            Cantidad: {{ item.quantity }}
          </div>
          
          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <button
              @click="moveToCart(item.id)"
              class="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Mover al carrito
            </button>
            
            <button
              @click="removeItem(item.id)"
              class="text-red-500 hover:text-red-700 p-2"
              :title="'Eliminar ' + item.product.name"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  savedForLater,
  savedForLaterCount,
  moveFromSavedToCart,
  removeFromSavedForLater,
  clearSavedForLater,
  formatPrice
} = useCart()

const moveToCart = async (savedItemId: string) => {
  await moveFromSavedToCart(savedItemId)
}

const removeItem = async (savedItemId: string) => {
  const item = savedForLater.value.find(item => item.id === savedItemId)
  if (item && confirm(`¿Eliminar ${item.product.name} de guardados?`)) {
    await removeFromSavedForLater(savedItemId)
  }
}

const handleClearAll = async () => {
  if (confirm(`¿Eliminar todos los ${savedForLaterCount.value} productos guardados?`)) {
    await clearSavedForLater()
  }
}

const formatSavedDate = (date: Date) => {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'hace unos minutos'
  } else if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`
  }
}
</script>