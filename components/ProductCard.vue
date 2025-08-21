<template>
  <div class="relative bg-white dark:bg-slate-800 rounded-lg shadow-sm dark:shadow-slate-900/20 border border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-900/30 transition-shadow duration-300">
    <!-- Product Image -->
    <div class="aspect-square overflow-hidden rounded-t-lg bg-gray-100 dark:bg-slate-700">
      <nuxt-link :to="`/products/${product.slug}`">
        <img
          v-if="primaryImage"
          :src="primaryImage.url"
          :alt="getLocalizedText(primaryImage.altText) || getLocalizedText(product.name)"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </nuxt-link>
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <!-- Category -->
      <p class="text-sm text-gray-500 dark:text-slate-400 mb-2">
        {{ getLocalizedText(product.category?.name) }}
      </p>

      <!-- Product Name -->
      <h3 class="font-semibold text-gray-900 dark:text-slate-100 mb-2 line-clamp-2">
        <nuxt-link :to="`/products/${product.slug}`" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {{ getLocalizedText(product.name) }}
        </nuxt-link>
      </h3>

      <!-- Short Description -->
      <p v-if="product.shortDescription" class="text-sm text-gray-600 dark:text-slate-300 mb-3 line-clamp-2">
        {{ getLocalizedText(product.shortDescription) }}
      </p>

      <!-- Tags -->
      <div v-if="product.tags?.length" class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="tag in product.tags.slice(0, 2)"
          :key="tag"
          class="inline-block bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full"
        >
          {{ tag }}
        </span>
        <span v-if="product.tags.length > 2" class="text-xs text-gray-500 dark:text-slate-400">
          +{{ product.tags.length - 2 }}
        </span>
      </div>

      <!-- Product Details -->
      <div class="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-slate-400 mb-3">
        <span v-if="product.origin" class="flex items-center">
          🌍 {{ product.origin }}
        </span>
        <span v-if="product.volume" class="flex items-center">
          📏 {{ product.volume }}ml
        </span>
        <span v-if="product.alcoholContent" class="flex items-center">
          🍷 {{ product.alcoholContent }}%
        </span>
      </div>

      <!-- Price and Stock -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <!-- Current Price -->
          <span class="font-bold text-lg text-gray-900 dark:text-slate-100">
            €{{ formatPrice(product.price) }}
          </span>
          
          <!-- Compare Price (if on sale) -->
          <span v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="text-sm text-gray-500 dark:text-slate-400 line-through">
            €{{ formatPrice(product.comparePrice) }}
          </span>
        </div>

        <!-- Stock Status -->
        <div class="text-right">
          <span
            v-if="product.stockQuantity > 0"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs"
            :class="stockStatusClass"
          >
            {{ stockStatusText }}
          </span>
          <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            {{ $t('products.outOfStock') }}
          </span>
        </div>
      </div>

      <!-- Add to Cart Button -->
      <button
        :disabled="product.stockQuantity <= 0 || cartLoading"
        class="w-full mt-4 py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        :class="[
          isInCart(product.id) 
            ? 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600' 
            : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600',
          (product.stockQuantity <= 0 || cartLoading) 
            ? 'bg-gray-300 dark:bg-slate-600 cursor-not-allowed' 
            : ''
        ]"
        @click="addToCart"
      >
        <!-- Loading Spinner -->
        <svg v-if="cartLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        
        <!-- Cart Icon -->
        <svg v-else-if="!isInCart(product.id)" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21h13M7 13v4a1 1 0 001 1h9a1 1 0 001-1v-4M7 13L6 9" />
        </svg>
        
        <!-- Check Icon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        
        <span>
          {{ 
            cartLoading ? $t('products.adding') :
            product.stockQuantity <= 0 ? $t('products.outOfStock') :
            isInCart(product.id) ? $t('products.inCart') : 
            $t('products.addToCart') 
          }}
        </span>
      </button>

      <!-- Featured Badge -->
      <div v-if="product.isFeatured" class="absolute top-2 left-2">
        <span class="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          {{ $t('products.featured') }}
        </span>
      </div>

      <!-- Sale Badge -->
      <div v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="absolute top-2 right-2">
        <span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          {{ $t('products.sale') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types/database'

interface Props {
  product: ProductWithRelations
}

const props = defineProps<Props>()

// Composables
const { locale } = useI18n()

// Computed properties
const primaryImage = computed(() => {
  return props.product.images?.find(img => img.isPrimary) || props.product.images?.[0]
})

const stockStatusClass = computed(() => {
  const stock = props.product.stockQuantity
  if (stock > 10) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
  if (stock > 0) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
  return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
})

const stockStatusText = computed(() => {
  const stock = props.product.stockQuantity
  if (stock > 10) return 'En stock' // TODO: Translate
  if (stock > 0) return `${stock} restantes`
  return 'Agotado'
})

// Utility functions
const getLocalizedText = (text: Record<string, string> | null | undefined) => {
  if (!text) return ''
  return text[locale.value] || text.es || Object.values(text)[0] || ''
}

const formatPrice = (price: string | number) => {
  return Number(price).toFixed(2)
}

// Cart functionality
const { addItem, loading: cartLoading, isInCart } = useCart()

// Actions
const addToCart = async () => {
  try {
    // Convert the product to the format expected by the cart
    const cartProduct = {
      id: props.product.id,
      slug: props.product.slug,
      name: getLocalizedText(props.product.name),
      price: Number(props.product.price),
      images: props.product.images?.map(img => img.url) || [],
      stock: props.product.stockQuantity
    }
    
    await addItem(cartProduct, 1)
  } catch (error) {
    console.error('Failed to add item to cart:', error)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>