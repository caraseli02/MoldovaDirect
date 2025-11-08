<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/98 dark:bg-gray-950/98 backdrop-blur-sm shadow-sm'
        : 'bg-[#FCFAF2] dark:bg-gray-950'
    ]">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16 md:h-20">

        <!-- Left: Mobile Menu Button -->
        <button
          type="button"
          @click="toggleMobileMenu"
          :aria-label="mobileMenuLabel"
          :aria-expanded="mobileMenuOpen"
          :aria-controls="mobileMenuOpen ? 'mobile-nav' : undefined"
          class="flex items-center justify-center w-11 h-11 -ml-2 md:hidden text-[#241405] dark:text-slate-300 hover:opacity-70 transition-opacity"
        >
          <svg width="23" height="11" viewBox="0 0 23 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.6922 9.51302H0.858887M21.6922 0.804688H0.858887" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
          </svg>
        </button>

        <!-- Center: Logo -->
        <NuxtLink :to="localePath('/')" class="absolute left-1/2 -translate-x-1/2 flex items-center group">
          <span
            class="text-2xl md:text-3xl font-serif tracking-wide text-[#722F37] dark:text-primary-400 transition-colors duration-300"
            style="font-family: 'Playfair Display', Georgia, serif; font-weight: 600; letter-spacing: 0.02em;">
            Moldova Direct
          </span>
        </NuxtLink>

        <!-- Desktop Navigation (Hidden on mobile) -->
        <nav class="hidden lg:flex items-center space-x-8 absolute left-4" aria-label="Main navigation">
          <div class="relative group" @mouseenter="openMegaMenu('products')" @mouseleave="closeMegaMenu">
            <button
              class="text-xs uppercase tracking-widest font-medium text-[#241405] dark:text-slate-300 hover:text-[#722F37] transition-colors py-2"
              style="letter-spacing: 0.15em;">
              {{ $t('common.shop') }}
              <svg class="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div class="relative group" @mouseenter="openMegaMenu('gifting')" @mouseleave="closeMegaMenu">
            <button
              class="text-xs uppercase tracking-widest font-medium text-[#241405] dark:text-slate-300 hover:text-[#722F37] transition-colors py-2"
              style="letter-spacing: 0.15em;">
              {{ $t('common.gifting') || 'Gifting' }}
              <svg class="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div class="relative group" @mouseenter="openMegaMenu('learn')" @mouseleave="closeMegaMenu">
            <button
              class="text-xs uppercase tracking-widest font-medium text-[#241405] dark:text-slate-300 hover:text-[#722F37] transition-colors py-2"
              style="letter-spacing: 0.15em;">
              {{ $t('common.learn') || 'Learn' }}
              <svg class="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <NuxtLink
            :to="localePath('/contact')"
            class="text-xs uppercase tracking-widest font-medium text-[#241405] dark:text-slate-300 hover:text-[#722F37] transition-colors py-2"
            style="letter-spacing: 0.15em;">
            {{ $t('common.contact') }}
          </NuxtLink>
        </nav>

        <!-- Right: User Actions -->
        <div class="flex items-center space-x-2 md:space-x-3">
          <!-- Search Icon -->
          <button
            type="button"
            @click="goToSearch"
            :aria-label="t('common.search')"
            class="flex items-center justify-center w-11 h-11 text-[#241405] dark:text-slate-300 hover:opacity-70 transition-opacity">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.3047 21.25C17.5514 21.25 21.8047 16.9967 21.8047 11.75C21.8047 6.50329 17.5514 2.25 12.3047 2.25C7.05798 2.25 2.80469 6.50329 2.80469 11.75C2.80469 16.9967 7.05798 21.25 12.3047 21.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M22.8047 22.25L20.8047 20.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>

          <!-- Account Icon -->
          <NuxtLink
            :to="localePath('/account')"
            :aria-label="accountLabel"
            class="flex items-center justify-center w-11 h-11 text-[#241405] dark:text-slate-300 hover:opacity-70 transition-opacity">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.8047 12.25C15.5661 12.25 17.8047 10.0114 17.8047 7.25C17.8047 4.48858 15.5661 2.25 12.8047 2.25C10.0433 2.25 7.80469 4.48858 7.80469 7.25C7.80469 10.0114 10.0433 12.25 12.8047 12.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M21.3948 22.25C21.3948 18.38 17.5448 15.25 12.8048 15.25C8.06484 15.25 4.21484 18.38 4.21484 22.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </NuxtLink>

          <!-- Cart Icon with Badge -->
          <NuxtLink
            :to="localePath('/cart')"
            :aria-label="cartAriaLabel"
            class="relative flex items-center justify-center w-11 h-11 text-[#241405] dark:text-slate-300 hover:opacity-70 transition-opacity">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.30469 7.91952V6.94952C8.30469 4.69952 10.1147 2.48952 12.3647 2.27952C15.0447 2.01952 17.3047 4.12952 17.3047 6.75952V8.13952" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M9.80451 22.25H15.8045C19.8245 22.25 20.5445 20.64 20.7545 18.68L21.5045 12.68C21.7745 10.24 21.0745 8.25 16.8045 8.25H8.80451C4.53451 8.25 3.83451 10.24 4.10451 12.68L4.85451 18.68C5.06451 20.64 5.78451 22.25 9.80451 22.25Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M16.3002 12.25H16.3092" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M9.29919 12.25H9.30818" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <span
              v-if="cartItemsCount > 0"
              class="absolute -top-1 -right-1 bg-[#722F37] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
              aria-hidden="true">
              {{ cartItemsCount }}
            </span>
          </NuxtLink>

          <!-- Language & Theme (Desktop only) -->
          <div class="hidden md:flex items-center space-x-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>

    <!-- Mega Menu Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="activeMegaMenu"
        @mouseenter="keepMegaMenuOpen"
        @mouseleave="closeMegaMenu"
        class="absolute top-full left-0 right-0 bg-white dark:bg-gray-950 shadow-lg border-t border-gray-100 dark:border-gray-800">
        <div class="container mx-auto px-4 py-12">
          <!-- Products Mega Menu -->
          <div v-if="activeMegaMenu === 'products'" class="grid grid-cols-4 gap-8">
            <div>
              <h3 class="text-sm font-semibold text-[#722F37] dark:text-primary-400 mb-4 uppercase tracking-wider">Collections</h3>
              <ul class="space-y-3">
                <li><NuxtLink :to="localePath('/products')" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">All Products</NuxtLink></li>
                <li><NuxtLink :to="localePath('/products?category=wine')" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Premium Wines</NuxtLink></li>
                <li><NuxtLink :to="localePath('/products?category=spirits')" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Artisan Spirits</NuxtLink></li>
                <li><NuxtLink :to="localePath('/products?category=gourmet')" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Gourmet Foods</NuxtLink></li>
              </ul>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-[#722F37] dark:text-primary-400 mb-4 uppercase tracking-wider">By Type</h3>
              <ul class="space-y-3">
                <li><NuxtLink to="/products?type=red" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Red Wine</NuxtLink></li>
                <li><NuxtLink to="/products?type=white" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">White Wine</NuxtLink></li>
                <li><NuxtLink to="/products?type=sparkling" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Sparkling Wine</NuxtLink></li>
                <li><NuxtLink to="/products?type=dessert" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Dessert Wine</NuxtLink></li>
              </ul>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-[#722F37] dark:text-primary-400 mb-4 uppercase tracking-wider">Price Range</h3>
              <ul class="space-y-3">
                <li><NuxtLink to="/products?price=0-50" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Under $50</NuxtLink></li>
                <li><NuxtLink to="/products?price=50-100" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">$50 - $100</NuxtLink></li>
                <li><NuxtLink to="/products?price=100-200" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">$100 - $200</NuxtLink></li>
                <li><NuxtLink to="/products?price=200" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">$200+</NuxtLink></li>
              </ul>
            </div>

            <div>
              <NuxtLink :to="localePath('/products')" class="block group">
                <div class="aspect-square rounded-lg overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=400&fit=crop"
                    alt="Featured Collection"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p class="text-sm font-medium text-[#722F37] dark:text-primary-400 hover:underline">
                  New: Premium Collection →
                </p>
              </NuxtLink>
            </div>
          </div>

          <!-- Gifting Mega Menu -->
          <div v-if="activeMegaMenu === 'gifting'" class="grid grid-cols-3 gap-8">
            <div>
              <h3 class="text-sm font-semibold text-[#722F37] dark:text-primary-400 mb-4 uppercase tracking-wider">Gift By Occasion</h3>
              <ul class="space-y-3">
                <li><NuxtLink to="/gifts/birthday" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Birthday Gifts</NuxtLink></li>
                <li><NuxtLink to="/gifts/wedding" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Wedding Gifts</NuxtLink></li>
                <li><NuxtLink to="/gifts/anniversary" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Anniversary Gifts</NuxtLink></li>
                <li><NuxtLink to="/gifts/corporate" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Corporate Gifts</NuxtLink></li>
              </ul>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-[#722F37] dark:text-primary-400 mb-4 uppercase tracking-wider">Gift Sets</h3>
              <ul class="space-y-3">
                <li><NuxtLink to="/gifts/wine-sets" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Wine Gift Sets</NuxtLink></li>
                <li><NuxtLink to="/gifts/tasting" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Tasting Collections</NuxtLink></li>
                <li><NuxtLink to="/gifts/luxury" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Luxury Gift Boxes</NuxtLink></li>
                <li><NuxtLink to="/gifts/gift-card" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Gift Cards</NuxtLink></li>
              </ul>
            </div>

            <div>
              <NuxtLink to="/gifts" class="block group">
                <div class="aspect-square rounded-lg overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1549228581-d5c7a01103a5?w=400&h=400&fit=crop"
                    alt="Gift Collection"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p class="text-sm font-medium text-[#722F37] dark:text-primary-400 hover:underline">
                  Explore Gift Collections →
                </p>
              </NuxtLink>
            </div>
          </div>

          <!-- Learn Mega Menu -->
          <div v-if="activeMegaMenu === 'learn'" class="grid grid-cols-3 gap-8">
            <div>
              <h3 class="text-sm font-semibold text-[#722F37] dark:text-primary-400 mb-4 uppercase tracking-wider">Our Story</h3>
              <ul class="space-y-3">
                <li><NuxtLink :to="localePath('/about')" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">About Moldova Direct</NuxtLink></li>
                <li><NuxtLink to="/heritage" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Moldovan Heritage</NuxtLink></li>
                <li><NuxtLink to="/sustainability" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Sustainability</NuxtLink></li>
                <li><NuxtLink to="/blog" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Our Blog</NuxtLink></li>
              </ul>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-[#722F37] dark:text-primary-400 mb-4 uppercase tracking-wider">Education</h3>
              <ul class="space-y-3">
                <li><NuxtLink to="/wine-guide" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Wine Tasting Guide</NuxtLink></li>
                <li><NuxtLink to="/food-pairing" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Food Pairing Guide</NuxtLink></li>
                <li><NuxtLink to="/regions" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Moldovan Wine Regions</NuxtLink></li>
                <li><NuxtLink to="/producers" class="text-sm text-gray-700 dark:text-slate-300 hover:text-[#722F37] transition-colors">Meet the Producers</NuxtLink></li>
              </ul>
            </div>

            <div>
              <NuxtLink :to="localePath('/about')" class="block group">
                <div class="aspect-square rounded-lg overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=400&fit=crop"
                    alt="Learn About Moldova"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p class="text-sm font-medium text-[#722F37] dark:text-primary-400 hover:underline">
                  Discover Moldovan Heritage →
                </p>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Mobile Navigation -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="mobileMenuOpen" class="lg:hidden">
        <MobileNav @close="toggleMobileMenu" />
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import MobileNav from './MobileNav.vue'
import ThemeToggle from './ThemeToggle.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const mobileMenuOpen = ref(false)
const scrolled = ref(false)
const activeMegaMenu = ref<string | null>(null)

// Scroll detection
const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})

// Mega menu control
const openMegaMenu = (menu: string) => {
  activeMegaMenu.value = menu
}

const closeMegaMenu = () => {
  activeMegaMenu.value = null
}

const keepMegaMenuOpen = () => {
  // Keep menu open when hovering over it
}

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
</script>
