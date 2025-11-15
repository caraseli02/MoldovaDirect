<template>
  <SheetContent side="left" class="w-[300px] sm:w-[400px]">
    <SheetHeader>
      <SheetTitle class="text-left">{{ $t('common.menu') }}</SheetTitle>
    </SheetHeader>

    <!-- Main Navigation -->
    <nav class="flex flex-col space-y-4 mt-6">
      <!-- Primary Navigation Links -->
      <div class="space-y-1">
        <NuxtLink
          :to="localePath('/')"
          @click="handleClose"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
        >
          <svg class="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {{ $t('common.home') }}
        </NuxtLink>

        <NuxtLink
          :to="localePath('/products')"
          @click="handleClose"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
        >
          <svg class="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {{ $t('common.shop') }}
        </NuxtLink>

        <NuxtLink
          :to="localePath('/about')"
          @click="handleClose"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
        >
          <svg class="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ $t('common.about') }}
        </NuxtLink>

        <NuxtLink
          :to="localePath('/contact')"
          @click="handleClose"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
        >
          <svg class="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {{ $t('common.contact') }}
        </NuxtLink>
      </div>

      <!-- Separator -->
      <div class="border-t border-border"></div>

      <!-- Secondary Navigation -->
      <div class="space-y-1">
        <NuxtLink
          :to="localePath('/account')"
          @click="handleClose"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
        >
          <svg class="w-5 h-5 mr-3 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ $t('common.account') }}
        </NuxtLink>

        <NuxtLink
          :to="localePath('/cart')"
          @click="handleClose"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
        >
          <div class="relative mr-3">
            <svg class="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span v-if="cartItemsCount > 0" class="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold" aria-label="Cart items count">
              {{ cartItemsCount }}
            </span>
          </div>
          {{ $t('common.cart') }}
        </NuxtLink>

        <Button
          variant="ghost"
          @click="goToSearch"
          class="w-full justify-start px-3 py-2 h-auto font-medium text-sm"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {{ $t('common.search') }}
        </Button>
      </div>

      <!-- Separator -->
      <div class="border-t border-border"></div>

      <!-- Preferences -->
      <div class="space-y-3">
        <div class="px-3 text-sm font-medium text-muted-foreground">
          {{ $t('common.preferences') }}
        </div>
        <div class="flex items-center justify-between px-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </nav>

    <SheetFooter class="mt-6">
      <Button
        :as-child="true"
        class="w-full"
      >
        <NuxtLink :to="localePath('/auth/login')" @click="handleClose">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          {{ $t('common.login') }}
        </NuxtLink>
      </Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup lang="ts">
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeToggle from './ThemeToggle.vue'

const localePath = useLocalePath()
const { t } = useI18n()

// Cart functionality
const { itemCount } = useCart()
const cartItemsCount = computed(() => itemCount.value)

// Emit close event
const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

const goToSearch = () => {
  navigateTo(localePath({ path: '/products', query: { focus: 'search' } }))
  emit('close')
}
</script>
