<template>
  <header
    :class="[
      'sticky top-0 z-50 transition-all duration-300 will-change-transform',
      scrolled
        ? 'bg-brand-light/95 backdrop-blur-md shadow-elevated-sm dark:bg-brand-dark/95 dark:shadow-brand-light/5'
        : 'bg-transparent dark:bg-transparent'
    ]"
  >
    <div class="container">
      <div class="flex items-center justify-between h-16">
        <!-- Logo with dynamic color based on scroll state -->
        <NuxtLink :to="localePath('/')" class="flex items-center space-x-2">
          <span
            :class="[
              'text-xl font-bold tracking-tight transition-colors duration-300',
              scrolled
                ? 'text-brand-dark dark:text-brand-light'
                : 'text-brand-light dark:text-brand-light drop-shadow-lg'
            ]"
          >
            Moldova Direct
          </span>
        </NuxtLink>

        <!-- Desktop Navigation with dynamic colors -->
        <nav class="hidden md:flex items-center space-x-8">
          <NuxtLink :to="localePath('/')" :class="navLinkClass">
            {{ $t('common.home') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/products')" :class="navLinkClass">
            {{ $t('common.shop') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/about')" :class="navLinkClass">
            {{ $t('common.about') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/contact')" :class="navLinkClass">
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

            <!-- Search with dynamic color -->
            <Button
              type="button"
              variant="ghost"
              size="icon"
              :aria-label="`${t('common.search')} (${searchShortcut})`"
              :class="iconButtonClass"
              @click="goToSearch"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <!-- Keyboard shortcut hint -->
              <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded pointer-events-none">
                {{ searchShortcut }}
              </span>
            </Button>

            <!-- Account with dynamic color -->
            <NuxtLink
              :to="localePath('/account')"
              :aria-label="accountLabel"
              :class="iconButtonClass"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="sr-only">{{ accountLabel }}</span>
            </NuxtLink>

            <!-- Cart with dynamic color -->
            <NuxtLink
              :to="localePath('/cart')"
              :aria-label="cartAriaLabel"
              :class="iconButtonClass"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <!-- Cart count badge -->
              <span v-if="cartItemsCount > 0"
                class="absolute -top-1 -right-1 bg-primary-600 dark:bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                aria-hidden="true"
              >
                {{ cartItemsCount }}
              </span>
            </NuxtLink>
          </div>

          <!-- Mobile actions - Language and Theme -->
          <div class="flex md:hidden items-center space-x-1">
            <!-- Language Switcher -->
            <LanguageSwitcher />

            <!-- Theme Toggle -->
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeToggle from './ThemeToggle.vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Scroll detection for luxury header transparency
// Initialize as true to prevent hydration mismatch
// We'll update it immediately on client side in onMounted
const scrolled = ref(true)
const SCROLL_THRESHOLD = 20 // px - threshold for header transparency

// Pages that have dark hero sections and support transparent header
const pagesWithDarkHero = ['/']

const handleScroll = useThrottleFn(() => {
  const currentPath = route.path?.replace(/\/(en|ro|ru)/, '') || '/'
  const hasDarkHero = pagesWithDarkHero.includes(currentPath)

  // Only allow transparent header on pages with dark hero sections
  scrolled.value = hasDarkHero
    ? window.scrollY > SCROLL_THRESHOLD
    : true
}, 50) // Throttle to 50ms (20 updates/second) for optimal performance

onMounted(() => {
  if (typeof window !== 'undefined') {
    // Wait for next tick to avoid hydration mismatch
    nextTick(() => {
      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // Initial check after hydration
    })
  }
})

// Dynamic classes based on scroll state
const navLinkClass = computed(() => [
  'font-medium tracking-wide transition-colors duration-300',
  scrolled.value
    ? 'text-brand-dark/80 hover:text-brand-accent dark:text-brand-light/80 dark:hover:text-brand-accent'
    : 'text-brand-light/90 hover:text-brand-light drop-shadow-md dark:text-brand-light/90 dark:hover:text-brand-light'
])

const iconButtonClass = computed(() => [
  'group relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2',
  scrolled.value
    ? 'text-brand-dark/70 hover:text-brand-accent dark:text-brand-light/70 dark:hover:text-brand-accent'
    : 'text-brand-light/80 hover:text-brand-light drop-shadow-lg dark:text-brand-light/80 dark:hover:text-brand-light'
])

// Clean up on unmount
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
  }
})

// Cart functionality
const { itemCount } = useCart()
const cartItemsCount = computed(() => itemCount.value)

const cartAriaLabel = computed(() => {
  const base = t('common.cart')
  return cartItemsCount.value > 0 ? `${base} (${cartItemsCount.value})` : base
})

const accountLabel = computed(() => t('common.account'))

const goToSearch = () => {
  navigateTo(localePath({ path: '/products', query: { focus: 'search' } }))
}

// Get keyboard shortcut display
const { getShortcutDisplay } = useKeyboardShortcuts()
const searchShortcut = computed(() => getShortcutDisplay('k', { ctrlOrCmd: true }))

</script>
