<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <!-- Illustration -->
    <div class="relative mb-8">
      <div class="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center">
        <svg class="w-12 h-12 md:w-16 md:h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <!-- Decorative elements -->
      <div class="absolute -top-2 -right-2 w-8 h-8 bg-blue-200 dark:bg-blue-700 rounded-full opacity-50 animate-pulse"></div>
      <div class="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-300 dark:bg-blue-600 rounded-full opacity-50 animate-pulse" style="animation-delay: 0.5s"></div>
    </div>

    <!-- Heading -->
    <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
      {{ $t('admin.products.emptyState.title', 'Welcome! Let\'s add your first product') }}
    </h2>

    <!-- Description -->
    <p class="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
      {{ $t('admin.products.emptyState.description', 'Products are at the heart of your store. Let\'s get started by adding your first wine or spirit to the catalog.') }}
    </p>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
      <nuxt-link
        to="/admin/products/new"
        class="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-sm"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('admin.products.emptyState.addProduct', 'Add Your First Product') }}
      </nuxt-link>
    </div>

    <!-- Quick Tips -->
    <div class="mt-12 w-full max-w-2xl">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
        {{ $t('admin.products.emptyState.quickTips', 'Quick Tips to Get Started') }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1">
            {{ $t('admin.products.emptyState.tip1Title', 'High-Quality Images') }}
          </h4>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ $t('admin.products.emptyState.tip1Text', 'Use clear product photos with neutral backgrounds (min 1000x1000px)') }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1">
            {{ $t('admin.products.emptyState.tip2Title', 'Detailed Descriptions') }}
          </h4>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ $t('admin.products.emptyState.tip2Text', 'Include origin, tasting notes, and pairing suggestions') }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1">
            {{ $t('admin.products.emptyState.tip3Title', 'Organize with Categories') }}
          </h4>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ $t('admin.products.emptyState.tip3Text', 'Group products by type (Red Wine, White Wine, Spirits) for easy browsing') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Optional: Import Products -->
    <div v-if="showImportOption" class="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {{ $t('admin.products.emptyState.bulkImport', 'Have multiple products to add?') }}
      </p>
      <button
        type="button"
        class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center"
        @click="$emit('show-import')"
      >
        {{ $t('admin.products.emptyState.bulkImportLink', 'Try bulk import with CSV') }}
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showImportOption?: boolean
}

withDefaults(defineProps<Props>(), {
  showImportOption: false
})

defineEmits<{
  (e: 'show-import'): void
}>()
</script>
