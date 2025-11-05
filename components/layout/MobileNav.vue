<template>
  <Transition name="mobile-nav">
    <div class="md:hidden fixed inset-0 z-50 flex">
      <!-- Backdrop with blur effect -->
      <div 
        @click="$emit('close')"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm"
      ></div>
      
      <!-- Modern sidebar -->
      <div
        ref="drawerRef"
        class="relative flex w-full max-w-sm flex-col bg-white dark:bg-gray-800 shadow-2xl"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
      >
        <!-- Modern header with gradient -->
        <div class="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <span class="text-lg font-semibold text-white">{{ $t('common.menu') }}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            @click="$emit('close')"
            ref="closeBtnRef"
            :aria-label="$t('common.close')"
            class="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      
        <!-- Navigation Links with icons -->
        <nav class="flex-1 overflow-y-auto px-6 py-6">
          <div class="space-y-2">
            <NuxtLink 
              :to="localePath('/')" 
              @click="$emit('close')"
              class="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
            >
              <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {{ $t('common.home') }}
            </NuxtLink>
            <NuxtLink 
              :to="localePath('/products')" 
              @click="$emit('close')"
              class="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
            >
              <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {{ $t('common.shop') }}
            </NuxtLink>
            <NuxtLink 
              :to="localePath('/about')" 
              @click="$emit('close')"
              class="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
            >
              <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ $t('common.about') }}
            </NuxtLink>
            <NuxtLink 
              :to="localePath('/contact')" 
              @click="$emit('close')"
              class="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
            >
              <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {{ $t('common.contact') }}
            </NuxtLink>
          </div>
        
          <!-- Secondary navigation -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div class="space-y-2">
              <NuxtLink 
                :to="localePath('/account')" 
                @click="$emit('close')"
                class="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
              >
                <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {{ $t('common.account') }}
              </NuxtLink>
              <NuxtLink 
                :to="localePath('/cart')" 
                @click="$emit('close')"
                class="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
              >
                <div class="relative mr-3">
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span v-if="cartItemsCount > 0" class="absolute -top-2 -right-2 bg-primary-600 dark:bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{ cartItemsCount }}
                  </span>
                </div>
                {{ $t('common.cart') }}
              </NuxtLink>
            </div>
          </div>
        
          <!-- Actions section -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div class="space-y-2">
              <!-- Search - moved from header -->
              <Button
                variant="ghost"
                class="flex items-center w-full justify-start px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
                @click="goToSearch"
              >
                <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {{ $t('common.search') }}
              </Button>
              
              <!-- Theme & Language toggles -->
              <div class="flex items-center justify-between px-4 py-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ $t('common.preferences') }}</span>
                <div class="flex items-center space-x-2">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              </div>
              
              <!-- Login/Auth button -->
              <NuxtLink 
                :to="localePath('/auth/login')"
                @click="$emit('close')"
                class="flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 transition-all group"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {{ $t('common.login') }}
              </NuxtLink>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeToggle from './ThemeToggle.vue'
import { Button } from '@/components/ui/button'

const localePath = useLocalePath()
const { t } = useI18n()

// Cart functionality
const { itemCount } = useCart()
const cartItemsCount = computed(() => itemCount.value)

// Accessibility: focus trap and ESC close
const emit = defineEmits(['close'])
const drawerRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLElement | null>(null)
let previousActiveElement: HTMLElement | null = null

const focusFirst = () => {
  closeBtnRef.value?.focus()
}

const getFocusable = () => {
  if (!drawerRef.value) return [] as HTMLElement[]
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]
  return Array.from(drawerRef.value.querySelectorAll<HTMLElement>(selectors.join(',')))
    .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null)
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === 'Tab') {
    const focusables = getFocusable()
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const current = document.activeElement as HTMLElement | null
    if (e.shiftKey) {
      if (current === first || !drawerRef.value?.contains(current)) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (current === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
}

onMounted(() => {
  previousActiveElement = document.activeElement as HTMLElement | null
  nextTick(() => {
    focusFirst()
    drawerRef.value?.addEventListener('keydown', onKeydown)
    drawerRef.value?.focus()
  })
})

onUnmounted(() => {
  drawerRef.value?.removeEventListener('keydown', onKeydown)
  previousActiveElement?.focus?.()
})

const goToSearch = () => {
  navigateTo(localePath({ path: '/products', query: { focus: 'search' } }))
  emit('close')
}
</script>
