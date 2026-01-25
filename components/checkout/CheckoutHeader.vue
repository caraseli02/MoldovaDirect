<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and Back Link -->
        <div class="flex items-center space-x-4">
          <NuxtLink
            :to="localePath('/')"
            class="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <span class="text-xl font-bold">Moldova Direct</span>
          </NuxtLink>

          <!-- Breadcrumb separator -->
          <span class="text-gray-400 dark:text-gray-500">/</span>

          <!-- Checkout title -->
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('checkout.title') }}
          </h1>
        </div>

        <!-- Desktop Actions -->
        <div class="hidden md:flex items-center space-x-6">
          <!-- Trust Badges -->
          <CheckoutTrustBadges variant="compact" />

          <!-- Help Link -->
          <NuxtLink
            :to="localePath('/contact')"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
          >
            {{ $t('common.help') }}
          </NuxtLink>
        </div>

        <!-- Mobile Actions -->
        <div class="flex md:hidden items-center space-x-2">
          <!-- Security Icon -->
          <svg
            class="w-5 h-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Mobile Menu Button -->
          <UiButton
            :aria-expanded="showMobileMenu"
            aria-label="Toggle menu"
            @click="showMobileMenu = !showMobileMenu"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </UiButton>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="showMobileMenu"
        class="md:hidden border-t border-gray-200 dark:border-gray-700 py-4"
      >
        <div class="flex flex-col space-y-3">
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <svg
              class="w-4 h-4 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ $t('checkout.secureCheckout') }}</span>
          </div>

          <NuxtLink
            :to="localePath('/contact')"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
            @click="showMobileMenu = false"
          >
            {{ $t('common.help') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const showMobileMenu = ref(false)

// Mobile menu will close when user navigates or clicks menu items
</script>
