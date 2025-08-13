<template>
  <div v-if="pending" class="py-12">
    <div class="container">
      <div class="animate-pulse">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div class="aspect-square bg-gray-200 rounded-lg"></div>
            <div class="grid grid-cols-4 gap-2">
              <div v-for="n in 4" :key="n" class="aspect-square bg-gray-200 rounded"></div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="h-8 bg-gray-200 rounded w-3/4"></div>
            <div class="h-6 bg-gray-200 rounded w-1/2"></div>
            <div class="h-20 bg-gray-200 rounded"></div>
            <div class="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="error" class="py-12">
    <div class="container text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ $t('products.notFound') }}</h1>
      <p class="text-gray-600 mb-8">{{ $t('products.notFoundDescription') }}</p>
      <nuxt-link
        to="/products"
        class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {{ $t('products.backToProducts') }}
      </nuxt-link>
    </div>
  </div>

  <div v-else-if="product" class="py-6 lg:py-12">
    <div class="container">
      <!-- Breadcrumb -->
      <nav class="flex mb-8 text-sm">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li>
            <nuxt-link to="/" class="text-gray-500 hover:text-gray-700">
              {{ $t('common.home') }}
            </nuxt-link>
          </li>
          <li>
            <span class="mx-2 text-gray-400">/</span>
            <nuxt-link to="/products" class="text-gray-500 hover:text-gray-700">
              {{ $t('common.shop') }}
            </nuxt-link>
          </li>
          <li v-if="product.category">
            <span class="mx-2 text-gray-400">/</span>
            <nuxt-link :to="`/products?category=${product.category.id}`" class="text-gray-500 hover:text-gray-700">
              {{ getLocalizedText(product.category.name) }}
            </nuxt-link>
          </li>
          <li>
            <span class="mx-2 text-gray-400">/</span>
            <span class="text-gray-900">{{ getLocalizedText(product.name) }}</span>
          </li>
        </ol>
      </nav>

      <!-- Product Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Product Images -->
        <div class="space-y-4">
          <!-- Main Image -->
          <div class="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
            <img
              v-if="selectedImage"
              :src="selectedImage.url"
              :alt="getLocalizedText(selectedImage.altText) || getLocalizedText(product.name)"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- Badges -->
            <div v-if="product.isFeatured" class="absolute top-4 left-4">
              <span class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {{ $t('products.featured') }}
              </span>
            </div>
            <div v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="absolute top-4 right-4">
              <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {{ $t('products.sale') }}
              </span>
            </div>
          </div>

          <!-- Thumbnail Images -->
          <div v-if="product.images?.length > 1" class="grid grid-cols-4 gap-2">
            <button
              v-for="(image, index) in product.images"
              :key="image.id"
              :class="[
                'aspect-square overflow-hidden rounded border-2 transition-colors',
                selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
              ]"
              @click="selectedImageIndex = index"
            >
              <img
                :src="image.url"
                :alt="getLocalizedText(image.altText)"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Product Information -->
        <div class="space-y-6">
          <!-- Category -->
          <div v-if="product.category">
            <nuxt-link
              :to="`/products?category=${product.category.id}`"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {{ getLocalizedText(product.category.name) }}
            </nuxt-link>
          </div>

          <!-- Product Name -->
          <h1 class="text-3xl lg:text-4xl font-bold text-gray-900">
            {{ getLocalizedText(product.name) }}
          </h1>

          <!-- Price -->
          <div class="flex items-center space-x-4">
            <span class="text-3xl font-bold text-gray-900">
              €{{ formatPrice(product.price) }}
            </span>
            <span v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="text-xl text-gray-500 line-through">
              €{{ formatPrice(product.comparePrice) }}
            </span>
            <span v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
              {{ Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100) }}% {{ $t('products.off') }}
            </span>
          </div>

          <!-- Short Description -->
          <p v-if="product.shortDescription" class="text-lg text-gray-600">
            {{ getLocalizedText(product.shortDescription) }}
          </p>

          <!-- Product Details -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-semibold mb-4">{{ $t('products.details') }}</h3>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div v-if="product.origin">
                <dt class="font-medium text-gray-900">{{ $t('products.origin') }}</dt>
                <dd class="text-gray-600">{{ product.origin }}</dd>
              </div>
              <div v-if="product.volume">
                <dt class="font-medium text-gray-900">{{ $t('products.volume') }}</dt>
                <dd class="text-gray-600">{{ product.volume }}ml</dd>
              </div>
              <div v-if="product.alcoholContent">
                <dt class="font-medium text-gray-900">{{ $t('products.alcoholContent') }}</dt>
                <dd class="text-gray-600">{{ product.alcoholContent }}%</dd>
              </div>
              <div v-if="product.weight">
                <dt class="font-medium text-gray-900">{{ $t('products.weight') }}</dt>
                <dd class="text-gray-600">{{ product.weight }}kg</dd>
              </div>
              <div v-if="product.sku">
                <dt class="font-medium text-gray-900">SKU</dt>
                <dd class="text-gray-600">{{ product.sku }}</dd>
              </div>
            </dl>
          </div>

          <!-- Tags -->
          <div v-if="product.tags?.length" class="flex flex-wrap gap-2">
            <span
              v-for="tag in product.tags"
              :key="tag"
              class="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Stock Status -->
          <div class="border-t border-gray-200 pt-6">
            <div class="flex items-center space-x-4">
              <span class="text-sm font-medium text-gray-900">{{ $t('products.availability') }}:</span>
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                  stockStatusClass
                ]"
              >
                {{ stockStatusText }}
              </span>
            </div>
          </div>

          <!-- Add to Cart -->
          <div class="border-t border-gray-200 pt-6">
            <div class="flex items-center space-x-4 mb-4">
              <label for="quantity" class="text-sm font-medium text-gray-900">
                {{ $t('common.quantity') }}:
              </label>
              <select
                id="quantity"
                v-model="selectedQuantity"
                :disabled="product.stockQuantity <= 0"
                class="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option v-for="n in Math.min(10, product.stockQuantity)" :key="n" :value="n">
                  {{ n }}
                </option>
              </select>
            </div>
            
            <button
              :disabled="product.stockQuantity <= 0"
              class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
              @click="addToCart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21h13M7 13v4a1 1 0 001 1h9a1 1 0 001-1v-4M7 13L6 9" />
              </svg>
              <span>
                {{ product.stockQuantity > 0 ? $t('products.addToCart') : $t('products.outOfStock') }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="product.description" class="mt-12 border-t border-gray-200 pt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('products.description') }}</h2>
        <div class="prose max-w-none text-gray-600">
          <p v-for="paragraph in getLocalizedText(product.description).split('\n')" :key="paragraph" class="mb-4">
            {{ paragraph }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithDetails } from '~/types/database'

// Get the product slug from route
const route = useRoute()
const slug = route.params.slug as string

// Fetch product data
const { data: product, pending, error } = await useLazyFetch<ProductWithDetails>(`/api/products/${slug}`)

// Reactive state
const selectedImageIndex = ref(0)
const selectedQuantity = ref(1)

// Computed properties
const selectedImage = computed(() => {
  return product.value?.images?.[selectedImageIndex.value]
})

const stockStatusClass = computed(() => {
  if (!product.value) return ''
  const stock = product.value.stockQuantity
  if (stock > 10) return 'bg-green-100 text-green-800'
  if (stock > 0) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
})

const stockStatusText = computed(() => {
  if (!product.value) return ''
  const stock = product.value.stockQuantity
  if (stock > 10) return 'En stock' // TODO: Translate
  if (stock > 0) return `${stock} restantes`
  return 'Agotado'
})

// Composables
const { locale } = useI18n()

// Utility functions
const getLocalizedText = (text: Record<string, string> | null | undefined) => {
  if (!text) return ''
  return text[locale.value] || text.es || Object.values(text)[0] || ''
}

const formatPrice = (price: string | number) => {
  return Number(price).toFixed(2)
}

// Actions
const addToCart = () => {
  // TODO: Implement add to cart functionality
  console.log('Add to cart:', {
    productId: product.value?.id,
    quantity: selectedQuantity.value
  })
  // This will be implemented in Phase 4 (Shopping Cart)
}

// SEO Meta
watch(product, (newProduct) => {
  if (newProduct) {
    useHead({
      title: `${getLocalizedText(newProduct.name)} - Moldova Direct`,
      meta: [
        {
          name: 'description',
          content: getLocalizedText(newProduct.metaDescription) || getLocalizedText(newProduct.shortDescription) || getLocalizedText(newProduct.description) || `${getLocalizedText(newProduct.name)} - Authentic Moldovan product`
        },
        {
          property: 'og:title',
          content: getLocalizedText(newProduct.name)
        },
        {
          property: 'og:description',
          content: getLocalizedText(newProduct.shortDescription) || getLocalizedText(newProduct.description)
        },
        {
          property: 'og:image',
          content: newProduct.images?.[0]?.url
        },
        {
          property: 'og:type',
          content: 'product'
        },
        {
          property: 'product:price:amount',
          content: newProduct.price
        },
        {
          property: 'product:price:currency',
          content: 'EUR'
        }
      ]
    })
  }
}, { immediate: true })

// Handle 404
if (error.value?.statusCode === 404) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found'
  })
}
</script>