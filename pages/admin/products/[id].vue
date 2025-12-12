<template>
  <div>
    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex items-center justify-center min-h-96"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="text-center py-12"
    >
      <svg
        class="h-12 w-12 text-red-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Product not found
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        The product you're looking for doesn't exist or has been deleted.
      </p>
      <nuxt-link
        to="/admin/products"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Back to Products
      </nuxt-link>
    </div>

    <!-- Product Form -->
    <div v-else>
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <nuxt-link
            to="/admin/products"
            class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </nuxt-link>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Product
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              {{ getLocalizedText((product as { name?: Record<string, string> })?.name) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-green-400"
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
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800 dark:text-green-200">
              {{ successMessage }}
            </p>
          </div>
          <div class="ml-auto pl-3">
            <Button
              variant="ghost"
              size="icon"
              class="text-green-400 hover:text-green-600"
              @click="successMessage = ''"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800 dark:text-red-200">
              {{ errorMessage }}
            </p>
          </div>
          <div class="ml-auto pl-3">
            <Button
              variant="ghost"
              size="icon"
              class="text-red-400 hover:text-red-600"
              @click="errorMessage = ''"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <!-- Product Form -->
      <AdminProductsForm
        :product="product"
        :categories="categories"
        :is-editing="true"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { CategoryWithChildren } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

// Lazy load admin product form component to reduce main bundle size
const AdminProductsForm = useAsyncAdminComponent('Products/Form')

// Get product ID from route
const route = useRoute()
const productId = route.params.id as string

// State
const successMessage = ref('')
const errorMessage = ref('')

// Fetch product data
const { data: productData, pending, error } = await useLazyFetch<{ product: unknown }>(`/api/admin/products/${productId}`)
const product = computed(() => productData.value?.product)

// Fetch categories
const { data: categoriesData } = await useFetch<{ categories: CategoryWithChildren[] }>('/api/categories')
const categories = computed(() => categoriesData.value?.categories || [])

// Utility functions
const getLocalizedText = (text: Record<string, string> | null) => {
  if (!text) return ''
  return text.es || Object.values(text)[0] || ''
}

// Event handlers
const handleSubmit = async (formData: any) => {
  try {
    errorMessage.value = ''

    // Transform form data to API format
    const productData = {
      sku: formData.sku,
      name_translations: formData.name,
      description_translations: formData.description,
      price_eur: formData.price,
      compare_at_price_eur: formData.comparePrice,
      stock_quantity: formData.stockQuantity,
      low_stock_threshold: formData.lowStockThreshold,
      category_id: formData.categoryId,
      images: formData.images,
      attributes: {
        origin: formData.attributes.origin,
        volume: formData.attributes.volume?.toString(),
        alcohol_content: formData.attributes.alcoholContent?.toString(),
        featured: formData.attributes.featured,
      },
      is_active: formData.isActive,
    }

    const response = await $fetch<{ success: boolean, data: unknown }>(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: productData,
    })

    if (response.success) {
      successMessage.value = 'Product updated successfully!'

      // Refresh product data
      await refreshCookie('productData')
    }
    else {
      throw new Error('Failed to update product')
    }
  }
  catch (error: any) {
    console.error('Update product error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update product'
  }
}

const handleCancel = () => {
  navigateTo('/admin/products')
}

// SEO
useHead({
  title: computed(() => {
    const productName = getLocalizedText((product.value as { name?: Record<string, string> })?.name)
    return `Edit ${productName || 'Product'} - Admin - Moldova Direct`
  }),
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
})
</script>
