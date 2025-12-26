<template>
  <div
    :class="[
      'bg-white dark:bg-zinc-800/60 rounded-2xl border p-4 md:p-5 transition-all duration-200',
      isLowStock ? 'border-amber-300 dark:border-amber-500/50' : 'border-zinc-200 dark:border-zinc-700/50',
      'hover:shadow-md dark:hover:shadow-zinc-900/20',
    ]"
  >
    <div class="flex gap-4">
      <!-- Product Image -->
      <div class="w-20 h-20 md:w-24 md:h-24 bg-zinc-100 dark:bg-zinc-700 rounded-xl flex-shrink-0 overflow-hidden">
        <NuxtImg
          :src="productImage"
          :alt="getLocalizedText(item.product.name)"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <!-- Product Details -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 mb-1">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-zinc-900 dark:text-white text-base leading-tight truncate">
              {{ getLocalizedText(item.product.name) }}
            </h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              {{ formatPrice(item.product.price) }} {{ $t('common.each') }}
            </p>
          </div>

          <!-- Remove Button -->
          <button
            :disabled="loading"
            :aria-label="$t('cart.removeItem')"
            class="p-2 -mr-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="$emit('remove-item', item.id)"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        <!-- Stock Indicator -->
        <div class="flex items-center gap-2 mt-2">
          <span
            v-if="isLowStock"
            class="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/20 px-2 py-1 rounded-md font-medium"
          >
            <span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            {{ $t('cart.stock.low', { count: item.product.stock }) }}
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-1 rounded-md font-medium"
          >
            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            {{ $t('cart.stock.inStock') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Quantity & Price -->
    <div class="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700/50">
      <!-- Quantity Controls -->
      <div class="flex items-center bg-zinc-100 dark:bg-zinc-700/50 rounded-lg p-1">
        <button
          :disabled="loading || item.quantity <= 1"
          :aria-label="$t('cart.decreaseQuantity')"
          class="w-10 h-10 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          @click="updateQuantity(item.quantity - 1)"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 12H4"
            />
          </svg>
        </button>

        <span
          class="w-10 text-center font-semibold text-zinc-900 dark:text-white"
          :aria-label="$t('cart.quantity', { count: item.quantity })"
        >
          {{ item.quantity }}
        </span>

        <button
          :disabled="loading || item.quantity >= item.product.stock"
          :aria-label="$t('cart.increaseQuantity')"
          class="w-10 h-10 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          @click="updateQuantity(item.quantity + 1)"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v12m6-6H6"
            />
          </svg>
        </button>
      </div>

      <!-- Item Total -->
      <div class="text-right">
        <div class="text-xl font-bold text-zinc-900 dark:text-white">
          {{ formatPrice(item.product.price * item.quantity) }}
        </div>
        <div
          v-if="item.quantity > 1"
          class="text-xs text-zinc-400 dark:text-zinc-500"
        >
          {{ formatPrice(item.product.price) }} {{ $t('common.each') }}
        </div>
      </div>
    </div>

    <!-- Actions Row -->
    <div class="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700/50">
      <button
        class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1 font-medium"
        @click="$emit('save-for-later', item.id)"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        {{ $t('cart.saveForLater') }}
      </button>

      <!-- Selection Checkbox (hidden on mobile for cleaner UI) -->
      <div class="hidden md:flex items-center gap-2">
        <UiCheckbox
          :id="`select-${item.id}`"
          :checked="isSelected"
          :aria-label="$t('common.select')"
          @update:checked="$emit('toggle-selection', item.id)"
        />
        <UiLabel
          :for="`select-${item.id}`"
          class="text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer"
        >
          {{ $t('common.select') }}
        </UiLabel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  item: {
    id: string
    product: {
      id: string
      name: any
      price: number
      images: any[]
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
  loading: false,
})

const emit = defineEmits<Emits>()
const { locale } = useI18n()

// Check if item is selected
const { isItemSelected } = useCart()
const isSelected = computed(() => isItemSelected(props.item.id))

// Low stock threshold
const LOW_STOCK_THRESHOLD = 5
const isLowStock = computed(() => props.item.product.stock <= LOW_STOCK_THRESHOLD)

// Product image
const productImage = computed(() => {
  const firstImage = props.item.product.images?.[0]
  if (typeof firstImage === 'object' && firstImage?.url) {
    return firstImage.url
  }
  return firstImage || '/placeholder-product.svg'
})

// Utility functions
const getLocalizedText = (text: any): string => {
  if (!text) return ''
  if (typeof text === 'string') return text
  const localeText = text[locale.value]
  if (localeText) return localeText
  const esText = text.es
  if (esText) return esText
  const values = Object.values(text).filter((v): v is string => typeof v === 'string')
  return values[0] || ''
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const updateQuantity = (newQuantity: number) => {
  if (newQuantity > 0 && newQuantity <= props.item.product.stock) {
    emit('update-quantity', props.item.id, newQuantity)
  }
}
</script>
