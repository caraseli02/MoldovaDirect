<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center space-x-4 mb-4">
        <nuxt-link
          to="/admin/products"
          class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </nuxt-link>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create New Product</h1>
          <p class="text-gray-600 dark:text-gray-400">Add a new product to your catalog</p>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800 dark:text-green-200">
            {{ successMessage }}
          </p>
        </div>
        <div class="ml-auto pl-3">
          <Button
            @click="successMessage = ''"
            variant="ghost"
            size="icon"
            class="text-green-400 hover:text-green-600"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800 dark:text-red-200">
            {{ errorMessage }}
          </p>
        </div>
        <div class="ml-auto pl-3">
          <Button
            @click="errorMessage = ''"
            variant="ghost"
            size="icon"
            class="text-red-400 hover:text-red-600"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>
    </div>

    <!-- Product Form -->
    <AdminProductsForm
      :categories="categories"
      :is-editing="false"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { CategoryWithChildren } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

// Lazy load admin product form component to reduce main bundle size
const AdminProductsForm = useAsyncAdminComponent('Products/Form')

// State
const successMessage = ref('')
const errorMessage = ref('')

// Fetch categories
const { data: categoriesData } = await useFetch<{ categories: CategoryWithChildren[] }>('/api/categories')
const categories = computed(() => categoriesData.value?.categories || [])

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
        featured: formData.attributes.featured
      },
      is_active: formData.isActive
    }

    const response = await $fetch<{ success: boolean; data: any }>('/api/admin/products', {
      method: 'POST',
      body: productData
    })

    if (response.success) {
      successMessage.value = 'Product created successfully!'
      
      // Redirect to product list after a short delay
      setTimeout(() => {
        navigateTo('/admin/products')
      }, 2000)
    } else {
      throw new Error('Failed to create product')
    }
  } catch (error) {
    console.error('Create product error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to create product'
  }
}

const handleCancel = () => {
  navigateTo('/admin/products')
}

// SEO
useHead({
  title: 'Create Product - Admin - Moldova Direct',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})
</script>