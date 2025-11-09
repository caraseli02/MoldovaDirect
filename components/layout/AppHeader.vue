<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="isScrolled ? 'bg-brand-light/95 backdrop-blur-md shadow-sm' : 'bg-transparent backdrop-blur-sm'"
  >
    <div class="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20 md:h-24">

        <!-- Left: Small Logo (To'ak style) -->
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center"
          aria-label="Moldova Direct"
        >
          <span
            class="text-lg md:text-xl font-serif font-semibold transition-colors duration-300"
            :class="isScrolled ? 'text-brand-dark' : 'text-brand-light'"
            style="font-family: 'Playfair Display', Georgia, serif; letter-spacing: 0.02em;">
            Moldova Direct
          </span>
        </NuxtLink>

        <!-- Right: User Actions (To'ak style - menu button is last) -->
        <div class="flex items-center space-x-2 md:space-x-4">

          <!-- Search Icon (To'ak SVG) -->
          <button
            type="button"
            @click="goToSearch"
            aria-label="Search"
            class="flex items-center justify-center w-11 h-11 hover:opacity-60 transition-all duration-300 focus:outline-none"
            :class="isScrolled ? 'text-brand-dark' : 'text-brand-light'"
          >
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.3047 21.25C17.5514 21.25 21.8047 16.9967 21.8047 11.75C21.8047 6.50329 17.5514 2.25 12.3047 2.25C7.05798 2.25 2.80469 6.50329 2.80469 11.75C2.80469 16.9967 7.05798 21.25 12.3047 21.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M22.8047 22.25L20.8047 20.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <span class="sr-only">Search</span>
          </button>

          <!-- Account Icon (To'ak SVG) -->
          <NuxtLink
            :to="localePath('/account')"
            aria-label="Account"
            class="flex items-center justify-center w-11 h-11 hover:opacity-60 transition-all duration-300"
            :class="isScrolled ? 'text-brand-dark' : 'text-brand-light'"
          >
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.8047 12.25C15.5661 12.25 17.8047 10.0114 17.8047 7.25C17.8047 4.48858 15.5661 2.25 12.8047 2.25C10.0433 2.25 7.80469 4.48858 7.80469 7.25C7.80469 10.0114 10.0433 12.25 12.8047 12.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M21.3948 22.25C21.3948 18.38 17.5448 15.25 12.8048 15.25C8.06484 15.25 4.21484 18.38 4.21484 22.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <span class="sr-only">Account</span>
          </NuxtLink>

          <!-- Cart Icon with Badge (To'ak SVG) -->
          <NuxtLink
            :to="localePath('/cart')"
            :aria-label="cartItemsCount > 0 ? `Cart (${cartItemsCount} items)` : 'Cart'"
            class="relative flex items-center justify-center w-11 h-11 hover:opacity-60 transition-all duration-300"
            :class="isScrolled ? 'text-brand-dark' : 'text-brand-light'"
          >
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.30469 7.91952V6.94952C8.30469 4.69952 10.1147 2.48952 12.3647 2.27952C15.0447 2.01952 17.3047 4.12952 17.3047 6.75952V8.13952" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M9.80451 22.25H15.8045C19.8245 22.25 20.5445 20.64 20.7545 18.68L21.5045 12.68C21.7745 10.24 21.0745 8.25 16.8045 8.25H8.80451C4.53451 8.25 3.83451 10.24 4.10451 12.68L4.85451 18.68C5.06451 20.64 5.78451 22.25 9.80451 22.25Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M16.3002 12.25H16.3092" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M9.29919 12.25H9.30818" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <!-- Cart count badge -->
            <span
              v-if="cartItemsCount > 0"
              class="absolute -top-1 -right-1 bg-brand-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-sm"
              aria-hidden="true"
            >
              {{ cartItemsCount }}
            </span>
            <span class="sr-only">Cart</span>
          </NuxtLink>

          <!-- Menu Button (Apple-style minimalist 2-bar - last element) -->
          <button
            type="button"
            @click="toggleMobileMenu"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
            :aria-expanded="mobileMenuOpen"
            aria-controls="nav-menu"
            class="flex items-center justify-center w-11 h-11 hover:opacity-60 transition-all duration-300 focus:outline-none"
            :class="isScrolled ? 'text-brand-dark' : 'text-brand-light'"
          >
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H17M1 9H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span class="sr-only">Menu</span>
          </button>

        </div>
      </div>
    </div>
  </header>

  <!-- Full-Screen Navigation Menu (To'ak style) - Outside header to prevent clipping -->
  <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        id="nav-menu"
        class="fixed inset-0 bg-brand-light/95 backdrop-blur-sm z-[100] overflow-y-auto"
      >
        <!-- Close Button (Fixed Top Right) -->
        <div class="fixed top-4 right-4 z-[110]">
          <button
            type="button"
            @click="toggleMobileMenu"
            aria-label="Close menu"
            class="flex items-center justify-center w-12 h-12 bg-brand-dark text-brand-light rounded-full hover:bg-brand-accent transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span class="sr-only">Close menu</span>
          </button>
        </div>

        <div class="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <nav class="max-w-4xl mx-auto" aria-label="Main navigation">

            <!-- Mobile: Simplified Links -->
            <div class="md:hidden space-y-1 mb-12">
              <NuxtLink
                :to="localePath('/')"
                @click="toggleMobileMenu"
                class="block py-4 text-2xl font-serif text-brand-dark hover:text-brand-accent transition-colors border-b border-brand-dark/10"
              >
                Home
              </NuxtLink>
              <NuxtLink
                :to="localePath('/products')"
                @click="toggleMobileMenu"
                class="block py-4 text-2xl font-serif text-brand-dark hover:text-brand-accent transition-colors border-b border-brand-dark/10"
              >
                Shop All Products
              </NuxtLink>
              <NuxtLink
                :to="localePath('/products?category=wine')"
                @click="toggleMobileMenu"
                class="block py-4 text-2xl font-serif text-brand-dark hover:text-brand-accent transition-colors border-b border-brand-dark/10"
              >
                Wines
              </NuxtLink>
              <NuxtLink
                to="/products?category=gourmet"
                @click="toggleMobileMenu"
                class="block py-4 text-2xl font-serif text-brand-dark hover:text-brand-accent transition-colors border-b border-brand-dark/10"
              >
                Gourmet Foods
              </NuxtLink>
              <NuxtLink
                to="/gifts"
                @click="toggleMobileMenu"
                class="block py-4 text-2xl font-serif text-brand-dark hover:text-brand-accent transition-colors border-b border-brand-dark/10"
              >
                Gifts
              </NuxtLink>
              <NuxtLink
                :to="localePath('/about')"
                @click="toggleMobileMenu"
                class="block py-4 text-2xl font-serif text-brand-dark hover:text-brand-accent transition-colors border-b border-brand-dark/10"
              >
                About
              </NuxtLink>
              <NuxtLink
                :to="localePath('/contact')"
                @click="toggleMobileMenu"
                class="block py-4 text-2xl font-serif text-brand-dark hover:text-brand-accent transition-colors border-b border-brand-dark/10"
              >
                Contact
              </NuxtLink>
            </div>

            <!-- Desktop: Full Navigation -->
            <div class="hidden md:block">
              <!-- Products Section -->
              <div class="mb-8 md:mb-12">
                <h2 class="text-xs uppercase tracking-[0.2em] font-medium text-brand-accent mb-6">
                  Products
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div>
                  <h3 class="text-sm font-semibold text-brand-dark mb-4">Collections</h3>
                  <ul class="space-y-2">
                    <li>
                      <NuxtLink
                        :to="localePath('/products')"
                        @click="toggleMobileMenu"
                        class="block py-2 text-sm text-brand-dark hover:text-brand-accent transition-colors"
                      >
                        All Products
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink
                        :to="localePath('/products?category=wine')"
                        @click="toggleMobileMenu"
                        class="text-sm text-brand-dark hover:text-brand-accent transition-colors"
                      >
                        Premium Wines
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink
                        to="/products?category=spirits"
                        @click="toggleMobileMenu"
                        class="text-sm text-brand-dark hover:text-brand-accent transition-colors"
                      >
                        Artisan Spirits
                      </NuxtLink>
                    </li>
                    <li>
                      <NuxtLink
                        to="/products?category=gourmet"
                        @click="toggleMobileMenu"
                        class="text-sm text-brand-dark hover:text-brand-accent transition-colors"
                      >
                        Gourmet Foods
                      </NuxtLink>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 class="text-sm font-semibold text-brand-dark mb-4">By Type</h3>
                  <ul class="space-y-3">
                    <li><NuxtLink to="/products?type=red" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Red Wine</NuxtLink></li>
                    <li><NuxtLink to="/products?type=white" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">White Wine</NuxtLink></li>
                    <li><NuxtLink to="/products?type=sparkling" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Sparkling Wine</NuxtLink></li>
                    <li><NuxtLink to="/products?type=dessert" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Dessert Wine</NuxtLink></li>
                  </ul>
                </div>

                <div>
                  <h3 class="text-sm font-semibold text-brand-dark mb-4">Price Range</h3>
                  <ul class="space-y-3">
                    <li><NuxtLink to="/products?price=0-50" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Under €50</NuxtLink></li>
                    <li><NuxtLink to="/products?price=50-100" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">€50 - €100</NuxtLink></li>
                    <li><NuxtLink to="/products?price=100-200" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">€100 - €200</NuxtLink></li>
                    <li><NuxtLink to="/products?price=200" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">€200+</NuxtLink></li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Gifting Section -->
            <div class="mb-8 md:mb-12 border-t border-brand-dark/10 pt-8 md:pt-12">
              <h2 class="text-xs uppercase tracking-[0.2em] font-medium text-brand-accent mb-6">
                Gifting
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div>
                  <h3 class="text-sm font-semibold text-brand-dark mb-4">Gift By Occasion</h3>
                  <ul class="space-y-3">
                    <li><NuxtLink to="/gifts/birthday" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Birthday Gifts</NuxtLink></li>
                    <li><NuxtLink to="/gifts/wedding" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Wedding Gifts</NuxtLink></li>
                    <li><NuxtLink to="/gifts/anniversary" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Anniversary Gifts</NuxtLink></li>
                    <li><NuxtLink to="/gifts/corporate" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Corporate Gifts</NuxtLink></li>
                  </ul>
                </div>

                <div>
                  <h3 class="text-sm font-semibold text-brand-dark mb-4">Gift Sets</h3>
                  <ul class="space-y-3">
                    <li><NuxtLink to="/gifts/wine-sets" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Wine Gift Sets</NuxtLink></li>
                    <li><NuxtLink to="/gifts/tasting" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Tasting Collections</NuxtLink></li>
                    <li><NuxtLink to="/gifts/luxury" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Luxury Gift Boxes</NuxtLink></li>
                    <li><NuxtLink to="/gifts/gift-card" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Gift Cards</NuxtLink></li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Learn Section -->
            <div class="mb-8 md:mb-12 border-t border-brand-dark/10 pt-8 md:pt-12">
              <h2 class="text-xs uppercase tracking-[0.2em] font-medium text-brand-accent mb-6">
                Learn
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div>
                  <h3 class="text-sm font-semibold text-brand-dark mb-4">Our Story</h3>
                  <ul class="space-y-3">
                    <li><NuxtLink :to="localePath('/about')" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">About Moldova Direct</NuxtLink></li>
                    <li><NuxtLink to="/heritage" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Moldovan Heritage</NuxtLink></li>
                    <li><NuxtLink to="/sustainability" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Sustainability</NuxtLink></li>
                    <li><NuxtLink to="/blog" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Our Blog</NuxtLink></li>
                  </ul>
                </div>

                <div>
                  <h3 class="text-sm font-semibold text-brand-dark mb-4">Education</h3>
                  <ul class="space-y-3">
                    <li><NuxtLink to="/wine-guide" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Wine Tasting Guide</NuxtLink></li>
                    <li><NuxtLink to="/food-pairing" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Food Pairing Guide</NuxtLink></li>
                    <li><NuxtLink to="/regions" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Moldovan Wine Regions</NuxtLink></li>
                    <li><NuxtLink to="/producers" @click="toggleMobileMenu" class="text-sm text-brand-dark hover:text-brand-accent transition-colors">Meet the Producers</NuxtLink></li>
                  </ul>
                </div>
              </div>
            </div>

              <!-- Contact -->
              <div class="border-t border-brand-dark/10 pt-8 md:pt-12">
                <NuxtLink
                  :to="localePath('/contact')"
                  @click="toggleMobileMenu"
                  class="text-xs uppercase tracking-[0.2em] font-medium text-brand-accent hover:opacity-70 transition-opacity inline-block"
                >
                  Contact
                </NuxtLink>
              </div>
            </div>
            <!-- End Desktop Navigation -->

          </nav>
        </div>
      </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const localePath = useLocalePath()
const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  // Prevent body scroll when menu is open
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Handle scroll to change header style
const handleScroll = () => {
  // Change header style after scrolling past hero section (approximately 100vh)
  isScrolled.value = window.scrollY > window.innerHeight * 0.5
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Check initial scroll position
})

// Clean up on unmount
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})

// Cart functionality
const { itemCount } = useCart()
const cartItemsCount = computed(() => itemCount.value)

const goToSearch = () => {
  navigateTo(localePath({ path: '/products', query: { focus: 'search' } }))
}
</script>

<style scoped>
/* Mobile Menu Optimizations */
#nav-menu ul li a {
  min-height: 44px; /* Apple's recommended minimum tap target size */
  display: flex;
  align-items: center;
}

@media (max-width: 767px) {
  #nav-menu ul {
    margin-bottom: 1.5rem;
  }

  #nav-menu h3 {
    margin-top: 1rem;
  }
}
</style>
