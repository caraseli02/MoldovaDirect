<template>
  <div v-if="hasSelectedItems" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm font-medium text-blue-900">
          {{ selectedItemsCount }} {{ selectedItemsCount === 1 ? 'producto seleccionado' : 'productos seleccionados' }}
        </span>
        <span class="text-sm text-blue-700">
          ({{ formattedSelectedSubtotal }})
        </span>
      </div>
      
      <button 
        @click="clearSelection"
        class="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Deseleccionar todo
      </button>
    </div>

    <div class="flex flex-wrap gap-2">
      <!-- Bulk Remove -->
      <button
        @click="handleBulkRemove"
        :disabled="bulkOperationInProgress"
        class="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Eliminar seleccionados
      </button>

      <!-- Bulk Save for Later -->
      <button
        @click="handleBulkSaveForLater"
        :disabled="bulkOperationInProgress"
        class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        Guardar para después
      </button>

      <!-- Bulk Quantity Update -->
      <div class="flex items-center space-x-2">
        <label class="text-sm text-gray-700">Cantidad:</label>
        <select
          v-model="bulkQuantity"
          class="border border-gray-300 rounded-md px-2 py-1 text-sm"
        >
          <option v-for="qty in [1, 2, 3, 4, 5]" :key="qty" :value="qty">{{ qty }}</option>
        </select>
        <button
          @click="handleBulkQuantityUpdate"
          :disabled="bulkOperationInProgress"
          class="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Actualizar
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="bulkOperationInProgress" class="mt-3 flex items-center space-x-2 text-sm text-blue-600">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span>Procesando operación...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  hasSelectedItems,
  selectedItemsCount,
  formattedSelectedSubtotal,
  bulkOperationInProgress,
  clearSelection,
  bulkRemoveSelected,
  bulkSaveForLater,
  bulkUpdateQuantity
} = useCart()

const bulkQuantity = ref(1)

const handleBulkRemove = async () => {
  if (confirm(`¿Estás seguro de que quieres eliminar ${selectedItemsCount.value} productos del carrito?`)) {
    await bulkRemoveSelected()
  }
}

const handleBulkSaveForLater = async () => {
  await bulkSaveForLater()
}

const handleBulkQuantityUpdate = async () => {
  if (confirm(`¿Actualizar la cantidad de ${selectedItemsCount.value} productos a ${bulkQuantity.value}?`)) {
    await bulkUpdateQuantity(bulkQuantity.value)
  }
}
</script>