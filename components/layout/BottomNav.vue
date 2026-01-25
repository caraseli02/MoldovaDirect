<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50 safe-area-bottom lg:hidden"
    role="navigation"
    aria-label="Primary mobile navigation"
    data-testid="bottom-nav"
  >
    <div class="flex items-center justify-around h-14 px-1">
      <!-- Home -->
      <NuxtLink
        :to="localePath('/')"
        class="flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-colors"
        :class="isActive('/') ? 'text-slate-600 dark:text-slate-400' : 'text-gray-500 dark:text-gray-400'"
        :aria-current="isActive('/') ? 'page' : undefined"
      >
        <commonIcon
          name="home"
          :size="20"
          class="mb-0.5"
        />
        <span class="text-[9px] font-semibold uppercase tracking-tight truncate w-full text-center px-1">{{
          $t('common.home') }}</span>
      </NuxtLink>

      <!-- Shop -->
      <NuxtLink
        :to="localePath('/products')"
        class="flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-colors"
        :class="isActive('/products') ? 'text-slate-600 dark:text-slate-400' : 'text-gray-500 dark:text-gray-400'"
        :aria-current="isActive('/products') ? 'page' : undefined"
      >
        <commonIcon
          name="shopping-bag"
          :size="20"
          class="mb-0.5"
        />
        <span class="text-[9px] font-semibold uppercase tracking-tight truncate w-full text-center px-1">{{
          $t('common.shop') }}</span>
      </NuxtLink>

      <!-- Cart -->
      <NuxtLink
        :to="localePath('/cart')"
        class="flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-colors relative"
        :class="isActive('/cart') ? 'text-slate-600 dark:text-slate-400' : 'text-gray-500 dark:text-gray-400'"
        :aria-current="isActive('/cart') ? 'page' : undefined"
      >
        <div class="relative">
          <commonIcon
            name="shopping-cart"
            :size="20"
            class="mb-0.5"
          />
          <ClientOnly>
            <span
              v-if="itemCount > 0"
              data-testid="cart-count"
              class="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[14px] h-[14px] px-1 text-[8px] font-bold text-white bg-slate-600 rounded-full"
            >
              {{ itemCount > 99 ? '99+' : itemCount }}
            </span>
          </ClientOnly>
        </div>
        <span class="text-[9px] font-semibold uppercase tracking-tight truncate w-full text-center px-1">{{
          $t('common.cart') }}</span>
      </NuxtLink>

      <!-- Search -->
      <NuxtLink
        :to="localePath('/products') + '?focus=search'"
        class="flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-colors"
        :class="searchActive ? 'text-slate-600 dark:text-slate-400' : 'text-gray-500 dark:text-gray-400'"
      >
        <commonIcon
          name="search"
          :size="20"
          class="mb-0.5"
        />
        <span class="text-[9px] font-semibold uppercase tracking-tight truncate w-full text-center px-1">{{
          $t('common.search') }}</span>
      </NuxtLink>

      <!-- Account -->
      <NuxtLink
        :to="localePath('/account')"
        class="flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-colors"
        :class="isActive('/account') ? 'text-slate-600 dark:text-slate-400' : 'text-gray-500 dark:text-gray-400'"
        :aria-current="isActive('/account') ? 'page' : undefined"
      >
        <commonIcon
          name="user"
          :size="20"
          class="mb-0.5"
        />
        <span class="text-[9px] font-semibold uppercase tracking-tight truncate w-full text-center px-1">{{
          $t('common.account') }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useLocalePath } from '#imports'

const route = useRoute()
const localePath = useLocalePath()
const { itemCount } = useCart()

// Check if current route matches (ignoring locale prefix)
const isActive = (path: string) => {
  const localizedPath = localePath(path)
  if (path === '/') {
    return route.path === localizedPath || route.path === localizedPath + '/'
  }
  return route.path.startsWith(localizedPath)
}

// Check if search is focused
const searchActive = computed(() => {
  const productsPath = localePath('/products')
  return (route.path === productsPath || route.path === productsPath + '/') && route.query.focus === 'search'
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
