<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="container">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="flex items-center space-x-2">
          <span class="text-xl font-bold text-primary-600">Moldova Direct</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <NuxtLink 
            :to="localePath('/')" 
            class="text-gray-700 hover:text-primary-600 transition-colors"
          >
            {{ $t('common.home') }}
          </NuxtLink>
          <NuxtLink 
            :to="localePath('/products')" 
            class="text-gray-700 hover:text-primary-600 transition-colors"
          >
            {{ $t('common.shop') }}
          </NuxtLink>
          <NuxtLink 
            :to="localePath('/about')" 
            class="text-gray-700 hover:text-primary-600 transition-colors"
          >
            {{ $t('common.about') }}
          </NuxtLink>
          <NuxtLink 
            :to="localePath('/contact')" 
            class="text-gray-700 hover:text-primary-600 transition-colors"
          >
            {{ $t('common.contact') }}
          </NuxtLink>
        </nav>

        <!-- Right side actions -->
        <div class="flex items-center space-x-4">
          <!-- Language Switcher -->
          <LanguageSwitcher />
          
          <!-- Search -->
          <button class="p-2 text-gray-700 hover:text-primary-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <!-- Account -->
          <NuxtLink 
            :to="localePath('/account')" 
            class="p-2 text-gray-700 hover:text-primary-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </NuxtLink>
          
          <!-- Cart -->
          <NuxtLink 
            :to="localePath('/cart')" 
            class="p-2 text-gray-700 hover:text-primary-600 transition-colors relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <!-- Cart count badge -->
            <span v-if="cartItemsCount > 0" class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ cartItemsCount }}
            </span>
          </NuxtLink>
          
          <!-- Mobile menu button -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mobile Navigation -->
    <MobileNav v-if="mobileMenuOpen" @close="mobileMenuOpen = false" />
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import MobileNav from './MobileNav.vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const mobileMenuOpen = ref(false)

// Mock cart items count - will be replaced with actual store
const cartItemsCount = ref(0)
</script>