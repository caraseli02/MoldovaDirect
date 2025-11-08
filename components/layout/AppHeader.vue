<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-white/72 dark:bg-black/72 backdrop-blur-xl backdrop-saturate-[180%] border-b border-gray-200/20 dark:border-gray-700/20"
    style="-webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);"
  >
    <div class="max-w-[980px] mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-[44px]">
        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="flex items-center -ml-2">
          <span class="text-[21px] font-semibold tracking-tight text-gray-900 dark:text-white">
            Moldova
          </span>
        </NuxtLink>

        <!-- Desktop Navigation - Apple exact center -->
        <nav class="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
          <NuxtLink
            :to="localePath('/products')"
            class="text-[12px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {{ $t('common.shop') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/about')"
            class="text-[12px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {{ $t('common.about') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/contact')"
            class="text-[12px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {{ $t('common.contact') }}
          </NuxtLink>
        </nav>

        <!-- Right side icons - Apple minimal -->
        <div class="flex items-center gap-4">
          <div class="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />

            <button
              @click="goToSearch"
              :aria-label="t('common.search')"
              class="w-[15px] h-[15px] p-0 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors bg-transparent border-0"
            >
              <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <NuxtLink
              :to="localePath('/cart')"
              :aria-label="cartAriaLabel"
              class="relative w-[17px] h-[17px] p-0 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span
                v-if="cartItemsCount > 0"
                class="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center"
              >
                {{ cartItemsCount }}
              </span>
            </NuxtLink>
          </div>

          <!-- Mobile -->
          <div class="flex md:hidden items-center gap-3">
            <NuxtLink
              :to="localePath('/cart')"
              :aria-label="cartAriaLabel"
              class="relative w-[17px] h-[17px] text-gray-700 dark:text-gray-300"
            >
              <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span
                v-if="cartItemsCount > 0"
                class="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center"
              >
                {{ cartItemsCount }}
              </span>
            </NuxtLink>

            <button
              @click="toggleMobileMenu"
              :aria-label="mobileMenuLabel"
              class="w-[17px] h-[11px] p-0 flex flex-col justify-between bg-transparent border-0 text-gray-700 dark:text-gray-300"
            >
              <span class="block w-full h-[1px] bg-current transition-all duration-300" :class="mobileMenuOpen ? 'rotate-45 translate-y-[5px]' : ''" />
              <span class="block w-full h-[1px] bg-current transition-all duration-300" :class="mobileMenuOpen ? 'opacity-0' : ''" />
              <span class="block w-full h-[1px] bg-current transition-all duration-300" :class="mobileMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <MobileNav v-if="mobileMenuOpen" @close="mobileMenuOpen = false" />
  </header>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import MobileNav from './MobileNav.vue'
import ThemeToggle from './ThemeToggle.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
}

onUnmounted(() => {
  document.body.style.overflow = ''
})

const { itemCount } = useCart()
const cartItemsCount = computed(() => itemCount.value)

const cartAriaLabel = computed(() => {
  const base = t('common.cart')
  return cartItemsCount.value > 0 ? `${base} (${cartItemsCount.value})` : base
})

const mobileMenuLabel = computed(() => mobileMenuOpen.value ? t('common.close') : t('common.menu'))

const goToSearch = () => {
  navigateTo(localePath({ path: '/products', query: { focus: 'search' } }))
}
</script>
