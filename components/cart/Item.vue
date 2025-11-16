<template>
  <div class="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
    <!-- Selection Checkbox -->
    <div class="flex items-center">
      <UiCheckbox
        :checked="isSelected"
        @update:checked="$emit('toggle-selection', item.id)"
        :aria-label="$t('common.select')"
      />
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
        <Button
          variant="link"
          size="sm"
          @click="$emit('save-for-later', item.id)"
          class="text-xs p-0 h-auto"
        >
          {{ $t('cart.saveForLater') }}
        </Button>
      </div>
    </div>

    <!-- Quantity Controls -->
    <div class="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        @click="updateQuantity(item.quantity - 1)"
        :disabled="loading || item.quantity <= 1"
        :aria-label="$t('cart.decreaseQuantity')"
        class="w-11 h-11"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </Button>

      <span class="min-w-[2rem] text-center text-sm font-medium text-gray-900 dark:text-white" :aria-label="$t('cart.quantity', { count: item.quantity })">
        {{ item.quantity }}
      </span>

      <Button
        variant="outline"
        size="icon"
        @click="updateQuantity(item.quantity + 1)"
        :disabled="loading || item.quantity >= item.product.stock"
        :aria-label="$t('cart.increaseQuantity')"
        class="w-11 h-11"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </Button>
    </div>

    <!-- Item Total -->
    <div class="text-right">
      <div class="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
        {{ formatPrice(item.product.price * item.quantity) }}
      </div>
    </div>

    <!-- Remove Button -->
    <div class="flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        @click="$emit('remove-item', item.id)"
        :disabled="loading"
        :aria-label="$t('cart.removeItem')"
        class="w-11 h-11 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

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
