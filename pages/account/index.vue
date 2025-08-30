<template>
  <div class="py-12">
    <div class="container">
      <div v-if="!isAuthenticated" class="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{{ $t('auth.signInRequired') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ $t('auth.signInToViewAccount') }}</p>
        <div class="flex gap-4 justify-center">
          <NuxtLink 
            :to="localePath('/auth/login')"
            class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {{ $t('auth.signIn') }}
          </NuxtLink>
          <NuxtLink 
            :to="localePath('/auth/register')"
            class="px-6 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50"
          >
            {{ $t('auth.signUp') }}
          </NuxtLink>
        </div>
      </div>
      
      <div v-else>
        <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">{{ $t('common.account') }}</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center mb-4">
                <div class="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl font-semibold text-primary-600">
                    {{ userProfile?.name?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="ml-4">
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ userProfile?.name }}</h2>
                  <p class="text-gray-600 dark:text-gray-400">{{ userProfile?.email }}</p>
                </div>
              </div>
              
              <nav class="mt-6 space-y-2">
                <NuxtLink 
                  :to="localePath('/account')"
                  class="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  :class="{ 'bg-gray-100 dark:bg-gray-700': route.path === localePath('/account') }"
                >
                  {{ $t('account.dashboard') }}
                </NuxtLink>
                <NuxtLink 
                  :to="localePath('/account/orders')"
                  class="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {{ $t('account.orders') }}
                </NuxtLink>
                <NuxtLink 
                  :to="localePath('/account/addresses')"
                  class="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {{ $t('account.addresses') }}
                </NuxtLink>
                <NuxtLink 
                  :to="localePath('/account/settings')"
                  class="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {{ $t('account.settings') }}
                </NuxtLink>
                <button 
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  {{ $t('common.logout') }}
                </button>
              </nav>
            </div>
          </div>
          
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 class="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">{{ $t('account.welcomeBack') }}</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-600 dark:text-gray-400">{{ $t('account.totalOrders') }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-600 dark:text-gray-400">{{ $t('account.wishlistItems') }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
              </div>
              
              <div>
                <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{{ $t('account.recentOrders') }}</h3>
                <div class="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p class="text-gray-600 dark:text-gray-400">{{ $t('account.noOrdersYet') }}</p>
                  <NuxtLink 
                    :to="localePath('/products')"
                    class="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {{ $t('common.shop') }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Apply authentication middleware
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Computed properties to replace auth store functionality
const isAuthenticated = computed(() => !!user.value)
const userProfile = computed(() => user.value ? {
  name: user.value.user_metadata?.name || user.value.email?.split('@')[0] || 'User',
  email: user.value.email,
  phone: user.value.user_metadata?.phone
} : null)

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    await navigateTo(localePath('/'))
  } catch (error) {
    console.error('Logout error:', error)
  }
}

useHead({
  title: t('common.account')
})
</script>