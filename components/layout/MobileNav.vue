<template>
  <div class="md:hidden fixed inset-0 z-40 flex">
    <!-- Backdrop -->
    <div 
      @click="$emit('close')"
      class="fixed inset-0 bg-black bg-opacity-50"
    ></div>
    
    <!-- Sidebar -->
    <div class="relative flex w-full max-w-xs flex-col bg-white">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-4 border-b">
        <span class="text-lg font-semibold">Menu</span>
        <button 
          @click="$emit('close')"
          class="p-2 -mr-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto px-4 py-4">
        <div class="space-y-1">
          <NuxtLink 
            :to="localePath('/')" 
            @click="$emit('close')"
            class="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            {{ $t('common.home') }}
          </NuxtLink>
          <NuxtLink 
            :to="localePath('/products')" 
            @click="$emit('close')"
            class="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            {{ $t('common.shop') }}
          </NuxtLink>
          <NuxtLink 
            :to="localePath('/about')" 
            @click="$emit('close')"
            class="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            {{ $t('common.about') }}
          </NuxtLink>
          <NuxtLink 
            :to="localePath('/contact')" 
            @click="$emit('close')"
            class="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            {{ $t('common.contact') }}
          </NuxtLink>
        </div>
        
        <div class="mt-6 pt-6 border-t">
          <NuxtLink 
            :to="localePath('/account')" 
            @click="$emit('close')"
            class="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            {{ $t('common.account') }}
          </NuxtLink>
          <NuxtLink 
            :to="localePath('/cart')" 
            @click="$emit('close')"
            class="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            {{ $t('common.cart') }}
            <span v-if="cartItemsCount > 0" class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
              {{ cartItemsCount }}
            </span>
          </NuxtLink>
        </div>
        
        <div class="mt-6 pt-6 border-t">
          <button 
            class="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            {{ $t('common.login') }}
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const localePath = useLocalePath()

// Mock cart items count - will be replaced with actual store
const cartItemsCount = ref(0)

defineEmits<{
  close: []
}>()
</script>