<template>
  <div
    v-if="savedForLaterCount > 0"
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div class="p-4 md:p-6">
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        {{ $t('cart.savedForLater') }} ({{ savedForLaterCount }})
      </h3>

      <div class="space-y-4">
        <div
          v-for="item in savedForLater"
          :key="item.id"
          class="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <!-- Product Image -->
          <div class="flex-shrink-0">
            <NuxtImg
              :src="item.product.images?.[0] || '/placeholder-product.svg'"
              :alt="item.product.name"
              class="w-12 h-12 object-cover rounded-lg"
              loading="lazy"
            />
          </div>

          <!-- Product Details -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ item.product.name }}
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatPrice(item.product.price) }} × {{ item.quantity }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500">
              {{ $t('cart.savedOn') }} {{ formatDate(item.savedAt) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <Button
              variant="link"
              size="sm"
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline p-0 h-auto"
              @click="handleMoveToCart(item.id)"
            >
              {{ $t('cart.moveToCart') }}
            </Button>

            <Button
              variant="link"
              size="sm"
              class="text-xs text-red-600 dark:text-red-400 hover:underline p-0 h-auto"
              @click="handleRemoveFromSaved(item.id)"
            >
              {{ $t('common.remove') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

const toast = useToast()

// Cart functionality
const {
  savedForLater,
  savedForLaterCount,
  moveToCartFromSavedForLater,
  removeFromSavedForLater,
} = useCart()

// Utility functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))
}

// Handle saved for later operations
const handleMoveToCart = async (itemId: string) => {
  try {
    await moveToCartFromSavedForLater(itemId)
    toast.success('Producto añadido', 'El producto ha sido añadido al carrito')
  }
  catch (error) {
    console.error('Failed to move item to cart:', error)
    toast.error('Error', 'No se pudo añadir el producto al carrito')
  }
}

const handleRemoveFromSaved = async (itemId: string) => {
  try {
    await removeFromSavedForLater(itemId)
    toast.success('Producto eliminado', 'El producto ha sido eliminado de guardados')
  }
  catch (error) {
    console.error('Failed to remove item from saved:', error)
    toast.error('Error', 'No se pudo eliminar el producto de guardados')
  }
}
</script>
