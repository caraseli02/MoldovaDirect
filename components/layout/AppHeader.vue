<template>
  <header
    class="bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/20 sticky top-0 z-50 transition-colors duration-300">
    <div class="container">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="flex items-center space-x-2">
          <span class="text-xl font-bold text-primary-600 dark:text-primary-400">Moldova Direct</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <NuxtLink :to="localePath('/')"
            class="text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {{ $t('common.home') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/products')"
            class="text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {{ $t('common.shop') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/about')"
            class="text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {{ $t('common.about') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/contact')"
            class="text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {{ $t('common.contact') }}
          </NuxtLink>
        </nav>

        <!-- Right side actions -->
        <div class="flex items-center">
          <!-- Desktop actions -->
          <div class="hidden md:flex items-center space-x-4">
            <!-- Language Switcher -->
            <LanguageSwitcher />

            <!-- Theme Toggle -->
            <ThemeToggle />

            <!-- Search -->
            <button
              class="p-2 text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <!-- Account -->
            <NuxtLink :to="localePath('/account')"
              class="p-2 text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </NuxtLink>

            <!-- Cart -->
            <NuxtLink :to="localePath('/cart')"
              class="p-2 text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <!-- Cart count badge -->
              <span v-if="cartItemsCount > 0"
                class="absolute -top-1 -right-1 bg-primary-600 dark:bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartItemsCount }}
              </span>
            </NuxtLink>
          </div>

          <!-- Simplified Mobile actions - Only essential elements -->
          <div class="flex md:hidden items-center space-x-4">

            <!-- Cart - Essential for e-commerce -->
            <NuxtLink :to="localePath('/cart')"
              class="p-2 text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <!-- Cart count badge -->
              <span v-if="cartItemsCount > 0"
                class="absolute -top-1 -right-1 bg-primary-600 dark:bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                {{ cartItemsCount }}
              </span>
            </NuxtLink>

            <!-- Mobile menu button -->
            <button @click="toggleMobileMenu"
              class="relative p-2 text-gray-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
              :class="{ 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': mobileMenuOpen }">
              <!-- Animated hamburger menu -->
              <div class="w-6 h-6 flex flex-col justify-center items-center">
                <span class="block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out"
                  :class="mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'"></span>
                <span class="block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out"
                  :class="mobileMenuOpen ? 'opacity-0' : 'opacity-100'"></span>
                <span class="block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out"
                  :class="mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'"></span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <MobileNav v-if="mobileMenuOpen" @close="mobileMenuOpen = false" />
  </header>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import MobileNav from './MobileNav.vue'
import ThemeToggle from './ThemeToggle.vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  // Prevent body scroll when menu is open
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Clean up body overflow on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})

// Cart functionality
const { itemCount } = useCart()
const cartItemsCount = computed(() => itemCount.value)

</script>