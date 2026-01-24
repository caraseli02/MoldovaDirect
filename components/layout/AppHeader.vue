<template>
  <header
    :class="[
      'fixed top-0 w-full z-50 transition-all duration-300 will-change-transform',
      scrolled
        ? 'bg-brand-light/95 backdrop-blur-md shadow-elevated-sm dark:bg-brand-dark/95 dark:shadow-brand-light/5'
        : 'bg-transparent dark:bg-transparent',
    ]"
  >
    <HomeAnnouncementBar
      v-if="hasDarkHero"
      :show-cta="true"
    />
    <div class="container">
      <div class="flex items-center justify-between h-16">
        <!-- Logo with dynamic color based on scroll state -->
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center space-x-2"
        >
          <span
            :class="[
              'text-xl font-bold tracking-tight transition-colors duration-300',
              scrolled
                ? 'text-brand-dark dark:text-brand-light'
                : 'text-brand-light dark:text-brand-light drop-shadow-lg',
            ]"
          >
            Moldova Direct
          </span>
        </NuxtLink>

        <!-- Desktop Navigation with dynamic colors -->
        <nav class="hidden lg:flex items-center space-x-8">
          <NuxtLink
            :to="localePath('/')"
            :class="navLinkClass"
          >
            {{ $t('common.home') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/products')"
            :class="navLinkClass"
          >
            {{ $t('common.shop') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/about')"
            :class="navLinkClass"
          >
            {{ $t('common.about') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/contact')"
            :class="navLinkClass"
          >
            {{ $t('common.contact') }}
          </NuxtLink>
        </nav>

        <!-- Right side actions -->
        <div class="flex items-center">
          <!-- Desktop actions -->
          <div class="hidden lg:flex items-center space-x-4">
            <!-- Language Switcher -->
            <ClientOnly>
              <LanguageSwitcher />
            </ClientOnly>

            <!-- Theme Toggle -->
            <ClientOnly>
              <ThemeToggle />
            </ClientOnly>

            <!-- Search with dynamic color -->
            <UiButton
              type="button"
              variant="ghost"
              size="icon"
              :aria-label="`${t('common.search')} (Ctrl+K)`"
              :class="iconButtonClass"
              @click="goToSearch"
            >
              <commonIcon
                name="search"
                :size="20"
              />
              <!-- Keyboard shortcut hint - client only to prevent hydration mismatch -->
              <ClientOnly>
                <span
                  class="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded pointer-events-none"
                >
                  {{ searchShortcut }}
                </span>
              </ClientOnly>
            </UiButton>

            <!-- Account with dynamic color -->
            <NuxtLink
              :to="localePath('/account')"
              :aria-label="accountLabel"
              :class="iconButtonClass"
              data-testid="user-menu"
            >
              <commonIcon
                name="user"
                :size="20"
              />
              <span class="sr-only">{{ accountLabel }}</span>
            </NuxtLink>

            <!-- Cart with dynamic color -->
            <NuxtLink
              :to="localePath('/cart')"
              :aria-label="cartAriaLabel"
              :class="iconButtonClass"
            >
              <commonIcon
                name="shopping-cart"
                :size="20"
              />
              <!-- Cart count badge - client only to prevent hydration mismatch -->
              <ClientOnly>
                <span
                  v-if="cartItemsCount > 0"
                  data-testid="cart-count"
                  class="absolute -top-1 -right-1 bg-primary-600 dark:bg-primary-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm"
                  style="width: 20px; height: 20px; min-width: 20px; min-height: 20px;"
                  aria-hidden="true"
                >
                  {{ cartItemsCount }}
                </span>
              </ClientOnly>
            </NuxtLink>
          </div>

          <!-- Mobile actions - Language and Theme -->
          <div class="flex lg:hidden items-center space-x-3">
            <ClientOnly>
              <!-- Language Switcher -->
              <LanguageSwitcher />
            </ClientOnly>

            <ClientOnly>
              <!-- Theme Toggle -->
              <ThemeToggle />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useThrottleFn } from '@vueuse/core'

import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeToggle from './ThemeToggle.vue'

const { t, locale: _locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Scroll detection for luxury header transparency
// SSR-safe initialization based on route
const currentPath = computed(() => route.path?.replace(/\/(en|ro|ru)/, '') || '/')
const pagesWithDarkHero = ['/']
const hasDarkHero = computed(() => pagesWithDarkHero.includes(currentPath.value))

// Initialize scrolled based on route - same on server and client
// Homepage starts transparent (false), other pages start solid (true)
const scrolled = ref(!hasDarkHero.value)
const SCROLL_THRESHOLD = 20 // px - threshold for header transparency

const handleScroll = useThrottleFn(() => {
  // Only allow transparent header on pages with dark hero sections
  if (hasDarkHero.value) {
    scrolled.value = window.scrollY > SCROLL_THRESHOLD
  }
  else {
    scrolled.value = true
  }
}, 50) // Throttle to 50ms (20 updates/second) for optimal performance

onMounted(() => {
  if (typeof window !== 'undefined') {
    // Initial state is already correct from SSR
    // Just attach scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

// Dynamic classes based on scroll state
const navLinkClass = computed(() => [
  'font-medium tracking-wide transition-colors duration-300',
  scrolled.value
    ? 'text-brand-dark/80 hover:text-brand-accent dark:text-brand-light/80 dark:hover:text-brand-accent'
    : 'text-brand-light/90 hover:text-brand-light drop-shadow-md dark:text-brand-light/90 dark:hover:text-brand-light',
])

const iconButtonClass = computed(() => [
  'group relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2',
  scrolled.value
    ? 'text-brand-dark/70 hover:text-brand-accent dark:text-brand-light/70 dark:hover:text-brand-accent'
    : 'text-brand-light/80 hover:text-brand-light drop-shadow-lg dark:text-brand-light/80 dark:hover:text-brand-light',
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
