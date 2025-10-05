<template>
  <div class="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
    <!-- Selection Checkbox -->
    <div class="flex items-center">
      <input
        type="checkbox"
        :checked="isSelected"
        @change="$emit('toggle-selection', item.id)"
        class="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700"
      >
    </div>

    <!-- Product Image -->
    <div class="flex-shrink-0">
      <NuxtImg
        :src="item.product.images?.[0] || '/placeholder-product.svg'"
        :alt="item.product.name"
        class="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
        loading="lazy"
      />
    </div>

    <!-- Product Details -->
    <div class="flex-1 min-w-0">
      <h3 class="text-sm md:text-base font-medium text-gray-900 dark:text-white truncate">
        {{ item.product.name }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ formatPrice(item.product.price) }} {{ $t('common.each') }}
      </p>
      <div class="flex items-center space-x-4 mt-2">
        <button
          @click="$emit('save-for-later', item.id)"
          class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {{ $t('cart.saveForLater') }}
        </button>
      </div>
    </div>

    <!-- Quantity Controls -->
    <div class="flex items-center space-x-2">
      <button
        @click="updateQuantity(item.quantity - 1)"
        :disabled="loading || item.quantity <= 1"
        class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      
      <span class="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
        {{ item.quantity }}
      </span>
      
      <button
        @click="updateQuantity(item.quantity + 1)"
        :disabled="loading || item.quantity >= item.product.stock"
        class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>

    <!-- Item Total -->
    <div class="text-right">
      <div class="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
        {{ formatPrice(item.product.price * item.quantity) }}
      </div>
    </div>

    <!-- Remove Button -->
    <div class="flex-shrink-0">
      <button
        @click="$emit('remove-item', item.id)"
        :disabled="loading"
        class="w-8 h-8 flex items-center justify-center rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  item: {
    id: string
    product: {
      id: string
      name: string
      price: number
      images: string[]
      stock: number
    }
    quantity: number
  }
  loading?: boolean
}

interface Emits {
  (e: 'update-quantity', itemId: string, quantity: number): void
  (e: 'remove-item', itemId: string): void
  (e: 'save-for-later', itemId: string): void
  (e: 'toggle-selection', itemId: string): void
  (e: 'swipe-remove', itemId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// Check if item is selected (this would come from the cart store)
const { isItemSelected } = useCart()
const isSelected = computed(() => isItemSelected(props.item.id))

// Utility functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const updateQuantity = (newQuantity: number) => {
  if (newQuantity > 0 && newQuantity <= props.item.product.stock) {
    emit('update-quantity', props.item.id, newQuantity)
  }
}
</script>