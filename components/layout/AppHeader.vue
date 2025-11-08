<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-white/72 dark:bg-black/72 backdrop-blur-xl backdrop-saturate-[180%] border-b border-gray-200/20 dark:border-gray-700/20"
    style="-webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);"
  >
    <div class="max-w-[980px] mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-[44px]">
        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="flex items-center -ml-2 flex-shrink-0">
          <span class="text-[21px] font-semibold tracking-tight text-gray-900 dark:text-white">
            Moldova
          </span>
        </NuxtLink>

        <!-- Desktop Navigation - Apple exact style with all categories -->
        <nav class="hidden lg:flex items-center space-x-7 xl:space-x-8">
          <NuxtLink
            :to="localePath('/products?category=wines')"
            class="text-[12px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            Wines
          </NuxtLink>
          <NuxtLink
            :to="localePath('/products?category=foods')"
            class="text-[12px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            Foods
          </NuxtLink>
          <NuxtLink
            :to="localePath('/products?category=gifts')"
            class="text-[12px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            Gifts
          </NuxtLink>
          <NuxtLink
            :to="localePath('/products')"
            class="text-[12px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            Collections
          </NuxtLink>
          <NuxtLink
            :to="localePath('/about')"
            class="text-[12px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            About
          </NuxtLink>
          <NuxtLink
            :to="localePath('/contact')"
            class="text-[12px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            Support
          </NuxtLink>
        </nav>

        <!-- Right side icons - Apple minimal -->
        <div class="flex items-center gap-4 flex-shrink-0">
          <div class="hidden lg:flex items-center gap-4">
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

          <!-- Mobile & Tablet -->
          <div class="flex lg:hidden items-center gap-3">
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

    <!-- Mobile Navigation Menu -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="lg:hidden absolute top-[44px] left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20"
        style="-webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);"
      >
        <nav class="max-w-[980px] mx-auto px-4 sm:px-6 py-4">
          <div class="flex flex-col space-y-1">
            <NuxtLink
              :to="localePath('/products?category=wines')"
              @click="closeMobileMenu"
              class="text-[17px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-3 border-b border-gray-200 dark:border-gray-800"
            >
              Wines
            </NuxtLink>
            <NuxtLink
              :to="localePath('/products?category=foods')"
              @click="closeMobileMenu"
              class="text-[17px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-3 border-b border-gray-200 dark:border-gray-800"
            >
              Foods
            </NuxtLink>
            <NuxtLink
              :to="localePath('/products?category=gifts')"
              @click="closeMobileMenu"
              class="text-[17px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-3 border-b border-gray-200 dark:border-gray-800"
            >
              Gifts
            </NuxtLink>
            <NuxtLink
              :to="localePath('/products')"
              @click="closeMobileMenu"
              class="text-[17px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-3 border-b border-gray-200 dark:border-gray-800"
            >
              Collections
            </NuxtLink>
            <NuxtLink
              :to="localePath('/about')"
              @click="closeMobileMenu"
              class="text-[17px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-3 border-b border-gray-200 dark:border-gray-800"
            >
              About
            </NuxtLink>
            <NuxtLink
              :to="localePath('/contact')"
              @click="closeMobileMenu"
              class="text-[17px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-3 border-b border-gray-200 dark:border-gray-800"
            >
              Support
            </NuxtLink>

            <!-- Mobile Search & Account -->
            <div class="flex items-center gap-4 pt-3">
              <button
                @click="goToSearchAndCloseMenu"
                class="flex items-center gap-2 text-[17px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              <NuxtLink
                :to="localePath('/account')"
                @click="closeMobileMenu"
                class="flex items-center gap-2 text-[17px] font-normal text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
              </NuxtLink>
            </div>

            <!-- Language & Theme in mobile -->
            <div class="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-800 mt-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </div>
    </transition>

    <!-- Backdrop overlay for mobile menu -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        @click="closeMobileMenu"
        class="lg:hidden fixed inset-0 bg-black/20 dark:bg-black/40 top-[44px]"
        style="backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);"
      />
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeToggle from './ThemeToggle.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
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

const goToSearchAndCloseMenu = () => {
  closeMobileMenu()
  goToSearch()
}
</script>
