<template>
  <Teleport to="body">
    <div
      class="fixed left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl lg:hidden safe-area-bottom"
      style="bottom: 0"
    >
      <div class="container mx-auto px-4 py-1.5">
        <div class="flex items-center gap-3">
          <!-- Product Info (Compact) -->
          <div
            class="flex-1 min-w-0"
            aria-hidden="true"
          >
            <p class="text-xs text-gray-600 dark:text-gray-300 truncate">
              {{ productName }}
            </p>
            <p class="text-lg font-bold text-gray-900 dark:text-white">
              €{{ formatPrice(price) }}
            </p>
          </div>

          <!-- Quantity Selector (Compact) -->
          <div class="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-10">
            <UiButton
              variant="ghost"
              size="icon"
              class="h-full w-8 rounded-none"
              :disabled="selectedQuantity <= 1"
              @click="$emit('update:selectedQuantity', Math.max(1, selectedQuantity - 1))"
            >
              <span class="text-gray-500 dark:text-gray-400">-</span>
            </UiButton>
            <span class="w-6 text-center text-sm font-semibold text-gray-900 dark:text-white">
              {{ selectedQuantity }}
            </span>
            <UiButton
              variant="ghost"
              size="icon"
              class="h-full w-8 rounded-none"
              :disabled="selectedQuantity >= stockQuantity"
              @click="$emit('update:selectedQuantity', Math.min(stockQuantity, selectedQuantity + 1))"
            >
              <span class="text-gray-500 dark:text-gray-400">+</span>
            </UiButton>
          </div>

          <!-- Add to Cart Button (Thumb-Friendly) -->
          <UiButton
            :disabled="stockQuantity <= 0 || cartLoading"
            class="flex items-center justify-center gap-2 rounded-xl px-6 py-2 text-base font-semibold text-white transition h-10 min-w-[140px]"
            :class="[
              isProductInCart ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700',
              cartLoading ? 'cursor-progress' : '',
            ]"
            @click="$emit('add-to-cart')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21h13M7 13v4a1 1 0 001 1h9a1 1 0 001-1v-4M7 13L6 9"
              />
            </svg>
            <span>
              <template v-if="stockQuantity > 0">
                {{ isProductInCart ? $t('products.inCart') : $t('products.addToCart') }}
              </template>
              <template v-else>
                {{ $t('products.outOfStock') }}
              </template>
            </span>
          </UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useProductUtils } from '~/composables/useProductUtils'

defineProps<{
  productName: string
  price: number | string
  stockQuantity: number
  selectedQuantity: number
  cartLoading: boolean
  isProductInCart: boolean
}>()

defineEmits<{
  (e: 'add-to-cart'): void
  (e: 'update:selectedQuantity', value: number): void
}>()

const { formatPrice } = useProductUtils()
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
