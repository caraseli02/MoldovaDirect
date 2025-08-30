<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div class="container py-20 md:py-32">
        <div class="max-w-3xl">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            {{ $t('home.hero.title') }}
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-primary-100">
            {{ $t('home.hero.subtitle') }}
          </p>
          <NuxtLink 
            :to="localePath('/products')" 
            class="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {{ $t('home.hero.cta') }}
          </NuxtLink>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-16 md:py-24">
      <div class="container">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Quality Feature -->
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{{ $t('home.features.quality.title') }}</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ $t('home.features.quality.description') }}</p>
          </div>
          
          <!-- Delivery Feature -->
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{{ $t('home.features.delivery.title') }}</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ $t('home.features.delivery.description') }}</p>
          </div>
          
          <!-- Authentic Feature -->
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{{ $t('home.features.authentic.title') }}</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ $t('home.features.authentic.description') }}</p>
          </div>
          
          <!-- Support Feature -->
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{{ $t('home.features.support.title') }}</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ $t('home.features.support.description') }}</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Featured Products Section -->
    <section class="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div class="container">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">{{ $t('home.featuredProducts.title') }}</h2>
        
        <!-- Loading State -->
        <div v-if="featuredPending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
            <div class="h-48 bg-gray-200"></div>
            <div class="p-4 space-y-2">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
              <div class="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <!-- Featured Products -->
        <div v-else-if="featuredProducts?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
        
        <!-- No Products Fallback -->
        <div v-else class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400 mb-4">{{ $t('home.featuredProducts.noProducts') }}</p>
          <NuxtLink 
            :to="localePath('/products')" 
            class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {{ $t('home.featuredProducts.viewAll') }}
          </NuxtLink>
        </div>
        
        <!-- Error State -->
        <div v-if="featuredError" class="text-center py-8">
          <p class="text-red-500 dark:text-red-400 mb-4">{{ $t('home.featuredProducts.error') }}</p>
          <button 
            @click="refreshFeatured"
            class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {{ $t('common.retry') }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { locale } = useI18n()

// Fetch featured products
const { data: featuredData, pending: featuredPending, error: featuredError, refresh: refreshFeatured } = await useFetch('/api/products/featured', {
  query: {
    limit: 4,
    locale: locale.value
  },
  server: true,
  lazy: false
})

// Extract products from the API response
const featuredProducts = computed(() => featuredData.value?.products || [])

// SEO Meta
useHead({
  title: 'Moldova Direct - Authentic Moldovan Products',
  meta: [
    {
      name: 'description',
      content: 'Discover authentic Moldovan food and wine products with home delivery in Spain. Premium quality directly from Moldova.'
    }
  ]
})
</script>