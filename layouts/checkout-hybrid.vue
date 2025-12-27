<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Simplified Checkout Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink
            :to="localePath('/')"
            class="flex items-center"
          >
            <span class="text-xl font-bold text-primary-600 dark:text-primary-400">
              Moldova Direct
            </span>
          </NuxtLink>

          <!-- Center: Checkout Title -->
          <div class="hidden sm:flex items-center">
            <span class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t('checkout.secureCheckout', 'Secure Checkout') }}
            </span>
            <svg
              class="w-5 h-5 ml-2 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <!-- Right: Cart indicator -->
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ cartItemCount }} {{ cartItemCount === 1 ? $t('common.item', 'item') : $t('common.items', 'items') }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6 lg:py-8">
      <div class="max-w-6xl mx-auto">
        <slot></slot>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
      <div class="container mx-auto px-4">
        <div class="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center space-x-4 mb-4 sm:mb-0">
            <span class="flex items-center">
              <svg
                class="w-4 h-4 mr-1 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ $t('checkout.securePayment', 'Secure Payment') }}
            </span>
            <span class="flex items-center">
              <svg
                class="w-4 h-4 mr-1 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ $t('checkout.moneyBackGuarantee', 'Money-back Guarantee') }}
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink
              :to="localePath('/contact')"
              class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {{ $t('checkout.needHelp', 'Need Help?') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/faq')"
              class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {{ $t('common.help', 'FAQ') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>

    <!-- Toast notifications -->
    <ClientOnly>
      <Sonner
        position="top-right"
        :rich-colors="true"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { Sonner } from '@/components/ui/sonner'
import { useCartStore } from '~/stores/cart'

const localePath = useLocalePath()
const cartStore = useCartStore()

const cartItemCount = computed(() => cartStore.itemCount || 0)
</script>
