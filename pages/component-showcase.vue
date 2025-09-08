<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Component Showcase</h1>
        <p class="text-gray-600 dark:text-gray-300">Testing refactored components without authentication</p>
      </div>

      <!-- ProductCard Grid -->
      <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">ProductCard Components</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard 
            :product="{
              id: '1',
              name: 'Sample Product',
              description: 'A sample product for testing',
              price: 29.99,
              originalPrice: 39.99,
              category: 'Test Category',
              status: 'in_stock',
              featured: true,
              onSale: true,
              images: []
            }"
          />
          <ProductCard 
            :product="{
              id: '2',
              name: 'Mobile Optimized Item',
              description: 'Testing mobile touch interactions and 44px minimum targets',
              price: 19.99,
              originalPrice: null,
              category: 'Mobile Test',
              status: 'in_stock',
              featured: false,
              onSale: false,
              images: []
            }"
          />
        </div>
      </section>

      <!-- Price Range Component -->
      <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Price Range Slider</h2>
        <div class="max-w-md">
          <ProductPriceRangeSlider 
            :min="0" 
            :max="200" 
            :step="5"
            @range-change="() => {}"
          />
        </div>
      </section>

      <!-- Mobile Touch Test Buttons -->
      <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Mobile Touch Targets (44px minimum)</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button class="min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg touch-manipulation active:scale-95 transition-transform">
            Primary Action
          </button>
          <button class="min-h-[44px] px-4 py-2 bg-green-600 text-white rounded-lg touch-manipulation active:scale-95 transition-transform">
            Success Action
          </button>
          <button class="min-h-[44px] px-4 py-2 bg-red-600 text-white rounded-lg touch-manipulation active:scale-95 transition-transform">
            Delete Action
          </button>
          <button class="min-h-[44px] px-4 py-2 bg-gray-600 text-white rounded-lg touch-manipulation active:scale-95 transition-transform">
            Secondary
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: false,
  layout: false
})

useHead({
  title: 'Component Showcase - Moldova Direct',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
</style>
