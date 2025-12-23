<template>
  <div class="checkout-page">
    <div class="p-4 md:p-6 lg:p-8">
      <Suspense>
        <template #default>
          <HybridCheckout />
        </template>
        <template #fallback>
          <div class="max-w-4xl mx-auto">
            <div class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span class="ml-3 text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</span>
            </div>
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import the hybrid checkout component
const HybridCheckout = defineAsyncComponent(() =>
  import('~/components/checkout/HybridCheckout.vue'),
)

// Layout
definePageMeta({
  layout: 'checkout-hybrid',
  middleware: ['checkout'],
})

// Page meta
useHead({
  title: 'Checkout - Moldova Direct',
  meta: [
    { name: 'description', content: 'Complete your purchase securely' },
  ],
})
</script>

<style scoped>
.checkout-page {
  min-height: 60vh;
}
</style>
