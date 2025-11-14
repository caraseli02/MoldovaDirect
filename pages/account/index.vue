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
                  :class="{ 'bg-gray-100 dark:bg-gray-700': route.path?.startsWith(localePath('/account/orders')) }"
                >
                  {{ $t('account.orders') }}
                </NuxtLink>
                <NuxtLink
                  :to="localePath('/account/profile')"
                  class="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  :class="{ 'bg-gray-100 dark:bg-gray-700': route.path === localePath('/account/profile') }"
                >
                  {{ $t('account.profile') }}
                </NuxtLink>
                <UiButton
                  @click="handleLogout"
                  variant="ghost"
                  class="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                  {{ $t('common.logout') }}
                </UiButton>
              </nav>
            </div>
          </div>
          
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 class="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">{{ $t('account.welcomeBack') }}</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <NuxtLink 
                  :to="localePath('/account/orders')"
                  class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-600 dark:text-gray-400">{{ $t('account.totalOrders') }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p v-if="orderStats.loading" class="text-2xl font-bold text-gray-400 dark:text-gray-500 animate-pulse">...</p>
                  <p v-else class="text-2xl font-bold text-gray-900 dark:text-white">{{ orderStats.totalOrders }}</p>
                </NuxtLink>
                
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
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('account.recentOrders') }}</h3>
                  <NuxtLink 
                    v-if="orderStats.recentOrders.length > 0"
                    :to="localePath('/account/orders')"
                    class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    {{ $t('orders.viewAllOrders') }}
                  </NuxtLink>
                </div>
                
                <!-- Loading state -->
                <div v-if="orderStats.loading" class="space-y-4">
                  <div v-for="i in 3" :key="i" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 animate-pulse">
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
                
                <!-- Recent orders list -->
                <div v-else-if="orderStats.recentOrders.length > 0" class="space-y-4">
                  <NuxtLink
                    v-for="order in orderStats.recentOrders"
                    :key="order.id"
                    :to="localePath(`/account/orders/${order.id}`)"
                    class="block bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-semibold text-gray-900 dark:text-white">{{ order.order_number }}</span>
                      <span 
                        class="px-2 py-1 text-xs rounded-full"
                        :class="{
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': order.status === 'pending',
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': order.status === 'processing',
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': order.status === 'shipped',
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': order.status === 'delivered',
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': order.status === 'cancelled'
                        }"
                      >
                        {{ $t(`orders.status.${order.status}`) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{{ new Date(order.created_at).toLocaleDateString() }}</span>
                      <span class="font-semibold">€{{ order.total_eur.toFixed(2) }}</span>
                    </div>
                  </NuxtLink>
                </div>
                
                <!-- Empty state -->
                <div v-else class="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
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

// Order summary state
const orderStats = ref({
  totalOrders: 0,
  recentOrders: [],
  loading: true
})

// Fetch order summary
const fetchOrderSummary = async () => {
  if (!user.value) return
  
  try {
    orderStats.value.loading = true
    
    // Fetch total orders count
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)
    
    if (countError) throw countError
    orderStats.value.totalOrders = count || 0
    
    // Fetch recent orders (last 3)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_eur,
        created_at,
        order_items (
          id,
          product_snapshot
        )
      `)
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (ordersError) throw ordersError
    orderStats.value.recentOrders = orders || []
  } catch (error) {
    console.error('Error fetching order summary:', error)
  } finally {
    orderStats.value.loading = false
  }
}

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    await navigateTo(localePath('/'))
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Fetch order summary on mount
onMounted(() => {
  if (user.value) {
    fetchOrderSummary()
  }
})

// Watch for user changes
watch(user, (newUser) => {
  if (newUser) {
    fetchOrderSummary()
  }
})

useHead({
  title: t('common.account')
})
</script>