<template>
  <header
    :class="[
      'luxury-header fixed left-0 right-0 z-50 transition-all duration-400',
      scrolled
        ? 'header-scrolled top-0'
        : 'header-transparent top-[42px] md:top-[46px]',
    ]"
  >
    <div class="nav-container">
      <!-- Logo with serif typography -->
      <NuxtLink
        :to="localePath('/')"
        class="nav-logo"
      >
        Moldova Direct
      </NuxtLink>

      <!-- Desktop Navigation with luxury styling -->
      <nav class="nav-links">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="localePath(link.path)"
          class="nav-link"
        >
          {{ $t(link.label) }}
        </NuxtLink>
      </nav>

      <!-- Right side actions -->
      <div class="nav-actions">
        <!-- Desktop actions -->
        <div class="hidden md:flex items-center gap-4">
          <!-- Language Switcher -->
          <LanguageSwitcher />

          <!-- Theme Toggle -->
          <ThemeToggle />

          <!-- Search -->
          <button
            type="button"
            :aria-label="`${t('common.search')} (Ctrl+K)`"
            class="nav-icon-btn"
            @click="goToSearch"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
              />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          <!-- Account -->
          <NuxtLink
            :to="localePath('/account')"
            :aria-label="accountLabel"
            class="nav-icon-btn"
            data-testid="user-menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle
                cx="12"
                cy="7"
                r="4"
              />
            </svg>
          </NuxtLink>

          <!-- Cart -->
          <NuxtLink
            :to="localePath('/cart')"
            :aria-label="cartAriaLabel"
            class="nav-cart"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
              />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <ClientOnly>
              <span
                v-if="cartItemsCount > 0"
                data-testid="cart-count"
                class="cart-count"
              >
                {{ cartItemsCount }}
              </span>
            </ClientOnly>
          </NuxtLink>
        </div>

        <!-- Mobile actions -->
        <div class="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
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

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Navigation links
const navLinks = [
  { path: '/products', label: 'common.shop' },
  { path: '/products?category=wines', label: 'nav.wines' },
  { path: '/products?category=gourmet', label: 'nav.gourmet' },
  { path: '/about', label: 'common.about' },
]

// Scroll detection for luxury header transparency
const scrolled = ref(true)
const SCROLL_THRESHOLD = 50

// Pages that have dark hero sections and support transparent header
const pagesWithDarkHero = ['/']

const handleScroll = useThrottleFn(() => {
  const currentPath = route.path?.replace(/\/(en|ro|ru)/, '') || '/'
  const hasDarkHero = pagesWithDarkHero.includes(currentPath)

  scrolled.value = hasDarkHero
    ? window.scrollY > SCROLL_THRESHOLD
    : true
}, 50)

onMounted(() => {
  if (typeof window !== 'undefined') {
    nextTick(() => {
      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
    })
  }
})

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
</script>

<style scoped>
/* ============================================
 * LUXURY HEADER STYLES
 * Moldova Direct - Premium Design System
 * ============================================ */

.luxury-header {
  --header-cream: #F8F5EE;
  --header-black: #0A0A0A;
  --header-charcoal: #151515;
  --header-gold: #C9A227;
  --header-gold-light: #DDB93D;
  --header-wine: #8B2E3B;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 4rem;
  transition: padding 0.3s ease;
}

/* Transparent state (on hero) */
.header-transparent {
  background: transparent;
}

.header-transparent .nav-logo {
  color: var(--md-cream);
}

.header-transparent .nav-link {
  color: rgba(248, 245, 238, 0.85);
}

.header-transparent .nav-link:hover {
  color: var(--header-gold-light);
}

.header-transparent .nav-icon-btn,
.header-transparent .nav-cart {
  color: var(--md-cream);
}

/* Scrolled state (solid background) */
.header-scrolled {
  background: var(--md-cream);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}

.header-scrolled .nav-container {
  padding: 1rem 4rem;
}

.header-scrolled .nav-logo {
  color: var(--header-black);
}

.header-scrolled .nav-link {
  color: var(--md-charcoal);
}

.header-scrolled .nav-link:hover {
  color: var(--md-gold);
}

.header-scrolled .nav-icon-btn,
.header-scrolled .nav-cart {
  color: var(--header-black);
}

/* Logo */
.nav-logo {
  font-family: var(--md-font-serif);
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-decoration: none;
  transition: color 0.4s ease;
}

/* Navigation Links */
.nav-links {
  display: flex;
  gap: 3rem;
  list-style: none;
}

.nav-link {
  font-family: var(--md-font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  position: relative;
  padding: 0.5rem 0;
  transition: color 0.4s var(--transition-smooth);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1px;
  background: var(--md-gold);
  transition: width 0.4s var(--transition-smooth), left 0.4s var(--transition-smooth);
}

.nav-link:hover::after {
  width: 100%;
  left: 0;
}

/* Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.4s ease, transform 0.3s ease;
}

.nav-icon-btn:hover {
  color: var(--md-gold);
  transform: translateY(-1px);
}

/* Cart */
.nav-cart {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  text-decoration: none;
  transition: color 0.4s ease;
}

.nav-cart:hover {
  color: var(--md-gold);
}

.cart-count {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: var(--md-wine);
  color: white;
  font-family: var(--md-font-sans);
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* Dark mode adjustments */
.dark .header-scrolled {
  background: var(--md-charcoal);
}

.dark .header-scrolled .nav-logo,
.dark .header-scrolled .nav-link,
.dark .header-scrolled .nav-icon-btn,
.dark .header-scrolled .nav-cart {
  color: var(--md-cream);
}

.dark .header-scrolled .nav-link:hover,
.dark .header-scrolled .nav-icon-btn:hover,
.dark .header-scrolled .nav-cart:hover {
  color: var(--header-gold-light);
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .nav-container {
    padding: 1rem 1.5rem;
  }

  .header-scrolled .nav-container {
    padding: 0.75rem 1.5rem;
  }

  .nav-links {
    display: none;
  }

  .nav-logo {
    font-size: 1.5rem;
  }
}
</style>
