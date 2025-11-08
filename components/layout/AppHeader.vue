<template>
  <header
    :class="[
      'fixed left-0 right-0 z-50 will-change-transform transition-all duration-300',
      scrolled
        ? 'top-0 bg-white/98 dark:bg-gray-950/98 backdrop-blur-sm shadow-sm dark:shadow-slate-900/20'
        : 'top-[44px] bg-transparent'
    ]">
    <div class="container">
      <div class="flex items-center justify-between h-16 md:h-20">
        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="flex items-center space-x-2 group">
          <span
            :class="[
              'text-xl md:text-2xl font-serif tracking-wide transition-colors duration-300',
              scrolled
                ? 'text-luxury-wine-red dark:text-primary-400'
                : 'text-white drop-shadow-lg'
            ]"
            style="font-family: 'Playfair Display', Georgia, serif; font-weight: 600; letter-spacing: 0.02em;">
            Moldova Direct
          </span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8 lg:space-x-10">
          <NuxtLink :to="localePath('/')"
            :class="[
              'text-xs uppercase tracking-widest font-medium transition-all duration-200 hover:text-luxury-wine-red',
              scrolled
                ? 'text-gray-700 dark:text-slate-300'
                : 'text-white drop-shadow-md'
            ]"
            style="letter-spacing: 0.15em;">
            {{ $t('common.home') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/products')"
            :class="[
              'text-xs uppercase tracking-widest font-medium transition-all duration-200 hover:text-luxury-wine-red',
              scrolled
                ? 'text-gray-700 dark:text-slate-300'
                : 'text-white drop-shadow-md'
            ]"
            style="letter-spacing: 0.15em;">
            {{ $t('common.shop') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/about')"
            :class="[
              'text-xs uppercase tracking-widest font-medium transition-all duration-200 hover:text-luxury-wine-red',
              scrolled
                ? 'text-gray-700 dark:text-slate-300'
                : 'text-white drop-shadow-md'
            ]"
            style="letter-spacing: 0.15em;">
            {{ $t('common.about') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/contact')"
            :class="[
              'text-xs uppercase tracking-widest font-medium transition-all duration-200 hover:text-luxury-wine-red',
              scrolled
                ? 'text-gray-700 dark:text-slate-300'
                : 'text-white drop-shadow-md'
            ]"
            style="letter-spacing: 0.15em;">
            {{ $t('common.contact') }}
          </NuxtLink>
        </nav>

        <!-- Right side actions -->
        <div class="flex items-center">
          <!-- Desktop actions -->
          <div class="hidden md:flex items-center space-x-3">
            <!-- Language Switcher -->
            <div :class="scrolled ? '' : 'text-white'">
              <LanguageSwitcher />
            </div>

            <!-- Theme Toggle -->
            <div :class="scrolled ? '' : 'text-white'">
              <ThemeToggle />
            </div>

            <!-- Search -->
            <Button
              type="button"
              variant="ghost"
              size="icon"
              :aria-label="`${t('common.search')} (${searchShortcut})`"
              :class="[
                'group relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 hover:opacity-70',
                scrolled
                  ? 'text-gray-700 dark:text-slate-300'
                  : 'text-white drop-shadow-md'
              ]"
              @click="goToSearch"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" aria-hidden="true" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>

            <!-- Account -->
            <NuxtLink
              :to="localePath('/account')"
              :aria-label="accountLabel"
              :class="[
                'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 rounded-lg hover:opacity-70',
                scrolled
                  ? 'text-gray-700 dark:text-slate-300'
                  : 'text-white drop-shadow-md'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" aria-hidden="true" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="sr-only">{{ accountLabel }}</span>
            </NuxtLink>

            <!-- Cart -->
            <NuxtLink
              :to="localePath('/cart')"
              :aria-label="cartAriaLabel"
              :class="[
                'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 relative rounded-lg hover:opacity-70',
                scrolled
                  ? 'text-gray-700 dark:text-slate-300'
                  : 'text-white drop-shadow-md'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" aria-hidden="true" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <!-- Cart count badge -->
              <span v-if="cartItemsCount > 0"
                class="absolute -top-1 -right-1 bg-luxury-wine-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                aria-hidden="true"
              >
                {{ cartItemsCount }}
              </span>
            </NuxtLink>
          </div>

          <!-- Simplified Mobile actions - Only essential elements -->
          <div class="flex md:hidden items-center space-x-2">

            <!-- Cart - Essential for e-commerce -->
            <NuxtLink
              :to="localePath('/cart')"
              :aria-label="cartAriaLabel"
              :class="[
                'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors relative rounded-lg',
                scrolled
                  ? 'text-gray-700 dark:text-slate-300'
                  : 'text-white drop-shadow-md'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" aria-hidden="true" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <!-- Cart count badge -->
              <span v-if="cartItemsCount > 0"
                class="absolute top-0 right-0 bg-luxury-wine-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                aria-hidden="true"
              >
                {{ cartItemsCount }}
              </span>
            </NuxtLink>

            <!-- Mobile menu button -->
            <Button
              type="button"
              variant="ghost"
              @click="toggleMobileMenu"
              :aria-label="mobileMenuLabel"
              :aria-expanded="mobileMenuOpen"
              :class="[
                'relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg',
                scrolled
                  ? 'text-gray-700 dark:text-slate-300'
                  : 'text-white drop-shadow-md',
                mobileMenuOpen && 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              ]"
            >
              <!-- Animated hamburger menu -->
              <div class="w-6 h-6 flex flex-col justify-center items-center">
                <span class="block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out"
                  :class="mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'"></span>
                <span class="block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out"
                  :class="mobileMenuOpen ? 'opacity-0' : 'opacity-100'"></span>
                <span class="block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out"
                  :class="mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'"></span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <MobileNav v-if="mobileMenuOpen" @close="mobileMenuOpen = false" />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import LanguageSwitcher from './LanguageSwitcher.vue'
import MobileNav from './MobileNav.vue'
import ThemeToggle from './ThemeToggle.vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const mobileMenuOpen = ref(false)
const scrolled = ref(false)

// Scroll detection for luxury transparent header
const handleScroll = () => {
  scrolled.value = window.scrollY > 100
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Check initial state
})

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  // Prevent body scroll when menu is open
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Clean up event listeners and body overflow on unmount
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})

// Cart functionality
const { itemCount } = useCart()
const cartItemsCount = computed(() => itemCount.value)

const cartAriaLabel = computed(() => {
  const base = t('common.cart')
  return cartItemsCount.value > 0 ? `${base} (${cartItemsCount.value})` : base
})

const accountLabel = computed(() => t('common.account'))

const mobileMenuLabel = computed(() => mobileMenuOpen.value ? t('common.close') : t('common.menu'))

const goToSearch = () => {
  navigateTo(localePath({ path: '/products', query: { focus: 'search' } }))
}

// Get keyboard shortcut display
const { getShortcutDisplay } = useKeyboardShortcuts()
const searchShortcut = computed(() => getShortcutDisplay('k', { ctrlOrCmd: true }))

</script>
