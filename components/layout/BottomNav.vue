<template>
  <nav
    v-if="isMobile"
    class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom md:hidden"
    role="navigation"
    aria-label="Primary mobile navigation"
  >
    <div class="flex items-center justify-around h-16 px-2">
      <!-- Home -->
      <NuxtLink
        to="/"
        class="flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors"
        :class="isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'"
        :aria-current="isActive('/') ? 'page' : undefined"
      >
        <svg
          class="w-6 h-6 mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span class="text-xs font-medium">{{ $t('common.home') }}</span>
      </NuxtLink>

      <!-- Shop -->
      <NuxtLink
        to="/products"
        class="flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors"
        :class="isActive('/products') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'"
        :aria-current="isActive('/products') ? 'page' : undefined"
      >
        <svg
          class="w-6 h-6 mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <span class="text-xs font-medium">{{ $t('common.shop') }}</span>
      </NuxtLink>

      <!-- Cart -->
      <NuxtLink
        to="/cart"
        class="flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors relative"
        :class="isActive('/cart') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'"
        :aria-current="isActive('/cart') ? 'page' : undefined"
        :aria-label="`${$t('common.cart')}${itemCount > 0 ? ` (${itemCount} items)` : ''}`"
      >
        <div class="relative">
          <svg
            class="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span
            v-if="itemCount > 0"
            class="absolute -top-1 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-primary-600 rounded-full"
            aria-hidden="true"
          >
            {{ itemCount > 99 ? '99+' : itemCount }}
          </span>
        </div>
        <span class="text-xs font-medium">{{ $t('common.cart') }}</span>
      </NuxtLink>

      <!-- Search -->
      <NuxtLink
        to="/products?focus=search"
        class="flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors"
        :class="searchActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'"
      >
        <svg
          class="w-6 h-6 mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span class="text-xs font-medium">{{ $t('common.search') }}</span>
      </NuxtLink>

      <!-- Account -->
      <NuxtLink
        to="/account"
        class="flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors"
        :class="isActive('/account') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'"
        :aria-current="isActive('/account') ? 'page' : undefined"
      >
        <svg
          class="w-6 h-6 mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span class="text-xs font-medium">{{ $t('common.account') }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useDevice } from '@/composables/useDevice'

const route = useRoute()
const { itemCount } = useCart()
const { isMobile } = useDevice()

// Check if current route matches
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// Check if search is focused
const searchActive = computed(() => {
  return route.path === '/products' && route.query.focus === 'search'
})
</script>

<style scoped>
/* Safe area support for devices with notches/home indicators */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Prevent text selection on navigation items */
nav a {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* Ensure minimum touch target size for accessibility */
nav a {
  min-height: 44px;
  min-width: 44px;
}

/* Smooth color transitions */
nav a {
  transition: color 0.2s ease-in-out;
}

/* Active state enhancement */
nav a[aria-current="page"] {
  font-weight: 600;
}
</style>
