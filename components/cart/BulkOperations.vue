<template>
  <div
    v-if="hasSelectedItems"
    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <svg
          class="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
          {{ selectedItemsCount }} {{ $t('cart.itemsSelected') }}
        </span>
        <span class="text-sm text-blue-700 dark:text-blue-300">
          ({{ formatPrice(selectedItemsSubtotal) }})
        </span>
      </div>

      <div class="flex items-center space-x-2">
        <Button
          variant="link"
          size="sm"
          :disabled="bulkOperationInProgress"
          class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed p-0 h-auto"
          @click="handleMoveToSavedForLater"
        >
          {{ $t('cart.saveForLater') }}
        </Button>

        <Button
          variant="link"
          size="sm"
          :disabled="bulkOperationInProgress"
          class="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed p-0 h-auto"
          @click="handleRemoveSelected"
        >
          {{ $t('cart.removeSelected') }}
        </Button>
      </div>
    </div>

    <!-- Loading indicator for bulk operations -->
    <div
      v-if="bulkOperationInProgress"
      class="mt-3 flex items-center space-x-2"
    >
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span class="text-sm text-blue-700 dark:text-blue-300">{{ $t('cart.processingBulkOperation') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

const toast = useToast()

// Cart functionality
const {
  hasSelectedItems,
  selectedItemsCount,
  selectedItemsSubtotal,
  bulkOperationInProgress,
  removeSelectedItems,
  moveSelectedToSavedForLater,
} = useCart()

// Utility functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Handle bulk operations
const handleRemoveSelected = async () => {
  try {
    await removeSelectedItems()
    toast.success('Productos eliminados', 'Los productos seleccionados han sido eliminados del carrito')
  }
  catch (error: unknown) {
    console.error('Failed to remove selected items:', error)
    toast.error('Error', 'No se pudieron eliminar los productos seleccionados')
  }
}

const handleMoveToSavedForLater = async () => {
  try {
    await moveSelectedToSavedForLater()
    toast.success('Productos guardados', 'Los productos seleccionados han sido guardados para más tarde')
  }
  catch (error: unknown) {
    console.error('Failed to move selected items to saved for later:', error)
    toast.error('Error', 'No se pudieron guardar los productos para más tarde')
  }
}
</script>
