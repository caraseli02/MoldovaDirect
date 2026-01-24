<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    <!-- Not Authenticated State -->
    <div
      v-if="!isAuthenticated"
      class="container py-20"
    >
      <div class="max-w-md mx-auto text-center">
        <div class="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-zinc-400 dark:text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
          {{ $t('auth.signInRequired') }}
        </h2>
        <p class="text-base text-zinc-600 dark:text-zinc-400 mb-8">
          {{ $t('auth.signInToViewAccount') }}
        </p>
        <div class="flex gap-4 justify-center">
          <NuxtLink
            :to="localePath('/auth/login')"
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 font-semibold"
          >
            {{ $t('auth.signIn') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/auth/register')"
            class="px-6 py-2 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-semibold"
          >
            {{ $t('auth.signUp') }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Authenticated State - Option D Design -->
    <div
      v-else
      class="container py-8 max-w-2xl mx-auto"
    >
      <!-- Compact Header -->
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center">
              <span class="text-xl font-bold text-white dark:text-zinc-900">
                {{ (userProfile?.name?.charAt(0) || 'U').toUpperCase() }}
              </span>
            </div>
            <div class="ml-4">
              <h2 class="text-base font-bold text-zinc-900 dark:text-white">
                {{ userProfile?.name }}
              </h2>
              <NuxtLink
                :to="localePath('/account/profile')"
                class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {{ $t('account.viewProfile') }}
              </NuxtLink>
            </div>
          </div>
          <UiButton aria-label="Notifications">
            <svg
              class="w-6 h-6 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </UiButton>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <!-- Total Orders Card -->
        <NuxtLink
          :to="localePath('/account/orders')"
          data-testid="stats-total-orders"
          class="bg-white dark:bg-zinc-800 border-2 border-primary-200 dark:border-primary-900 rounded-xl p-4 hover:border-primary-300 dark:hover:border-primary-800 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {{ $t('account.totalOrders') }}
            </span>
            <div class="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <svg
                class="w-4 h-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>
          <p
            v-if="orderStats.loading"
            class="text-3xl font-bold text-zinc-400 dark:text-zinc-500 animate-pulse"
          >
            ...
          </p>
          <p
            v-else
            class="text-3xl font-bold text-zinc-900 dark:text-white"
          >
            {{ orderStats.totalOrders }}
          </p>
        </NuxtLink>

        <!-- Wishlist Card -->
        <div
          data-testid="stats-wishlist"
          class="bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {{ $t('account.wishlistItems') }}
            </span>
            <div class="w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
              <svg
                class="w-4 h-4 text-zinc-600 dark:text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-zinc-900 dark:text-white">
            0
          </p>
        </div>
      </div>

      <!-- Recent Orders Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-zinc-900 dark:text-white">
            {{ $t('account.recentOrders') }}
          </h3>
          <NuxtLink
            v-if="orderStats.recentOrders.length > 0"
            :to="localePath('/account/orders')"
            class="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors px-2 py-1 rounded focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
          >
            {{ $t('orders.viewAllOrders') }}
          </NuxtLink>
        </div>

        <!-- Loading State -->
        <div
          v-if="orderStats.loading"
          class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-8"
        >
          <div class="space-y-4">
            <div
              v-for="i in 3"
              :key="i"
              class="animate-pulse"
            >
              <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 mb-2"></div>
              <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="orderStats.error"
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center"
        >
          <div
            class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p class="text-sm text-red-700 dark:text-red-300 mb-4">
            {{ orderStats.error }}
          </p>
          <UiButton @click="fetchOrderSummary">
            {{ $t('common.tryAgain') }}
          </UiButton>
        </div>

        <!-- Recent Orders List -->
        <div
          v-else-if="orderStats.recentOrders.length > 0"
          class="space-y-3"
        >
          <NuxtLink
            v-for="order in orderStats.recentOrders"
            :key="order.id"
            :to="localePath(`/account/orders/${order.id}`)"
            class="block bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-zinc-900 dark:text-white">{{ order.order_number }}</span>
              <span
                class="px-2 py-1 text-xs font-medium rounded-md"
                :class="{
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': order.status === 'pending',
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': order.status === 'processing',
                  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400': order.status === 'shipped',
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': order.status === 'delivered',
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': order.status === 'cancelled',
                }"
              >
                {{ $t(`orders.status.${order.status}`) }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>{{ new Date(order.created_at).toLocaleDateString() }}</span>
              <span class="font-semibold">€{{ order.total_eur.toFixed(2) }}</span>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-12 text-center"
        >
          <div
            class="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-zinc-400 dark:text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <p class="text-base text-zinc-600 dark:text-zinc-400 mb-6">
            {{ $t('account.noOrdersYet') }}
          </p>
          <NuxtLink
            :to="localePath('/products')"
            class="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 font-semibold"
          >
            {{ $t('common.shop') }}
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          {{ $t('account.quickAccess') }}
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <!-- Profile Button -->
          <NuxtLink
            :to="localePath('/account/profile')"
            data-testid="quick-profile"
            class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
          >
            <div class="flex flex-col items-center text-center">
              <div class="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-3">
                <svg
                  class="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span class="text-sm font-semibold text-zinc-900 dark:text-white">
                {{ $t('account.myProfile') }}
              </span>
            </div>
          </NuxtLink>

          <!-- Addresses Button -->
          <NuxtLink
            :to="localePath('/account/profile')"
            data-testid="quick-addresses"
            class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
          >
            <div class="flex flex-col items-center text-center">
              <div class="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-3">
                <svg
                  class="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <span class="text-sm font-semibold text-zinc-900 dark:text-white">
                {{ $t('account.addresses') }}
              </span>
            </div>
          </NuxtLink>

          <!-- Payment Methods Button -->
          <UiButton
            data-testid="quick-payment"
            disabled
          >
            <div class="flex flex-col items-center text-center">
              <div class="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-3">
                <svg
                  class="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <span class="text-sm font-semibold text-zinc-900 dark:text-white">
                {{ $t('account.paymentMethods') }}
              </span>
            </div>
          </UiButton>

          <!-- Returns Button -->
          <NuxtLink
            :to="localePath('/account/orders')"
            data-testid="quick-returns"
            class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
          >
            <div class="flex flex-col items-center text-center">
              <div class="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-3">
                <svg
                  class="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </div>
              <span class="text-sm font-semibold text-zinc-900 dark:text-white">
                {{ $t('account.returns') }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Logout Button -->
      <UiButton
        data-testid="logout-button"
        @click="handleLogout"
      >
        <span class="text-base font-semibold text-primary-600 dark:text-primary-400">
          {{ $t('common.logout') }}
        </span>
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
// Apply authentication middleware
definePageMeta({
  middleware: 'auth',
})

interface OrderSummary {
  id: number
  order_number: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_eur: number
  created_at: string
}

interface OrderStats {
  totalOrders: number
  recentOrders: OrderSummary[]
  loading: boolean
  error: string | null
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()
const localePath = useLocalePath()

// Computed properties
const isAuthenticated = computed(() => !!user.value)
const userProfile = computed(() => user.value
  ? {
      name: user.value.user_metadata?.name || user.value.email?.split('@')[0] || 'User',
      email: user.value.email,
      phone: user.value.user_metadata?.phone,
    }
  : null)

// Order summary state
const orderStats = ref<OrderStats>({
  totalOrders: 0,
  recentOrders: [],
  loading: true,
  error: null,
})

// Constants
const RECENT_ORDERS_LIMIT = 3

// Fetch order summary with parallel queries for better performance
const fetchOrderSummary = async () => {
  if (!user.value) return

  try {
    orderStats.value.loading = true
    orderStats.value.error = null

    // Ensure we have a valid session before querying
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.warn('No active session found when fetching orders')
      orderStats.value.loading = false
      orderStats.value.error = t('auth.errors.sessionExpired')
      return
    }

    // Run both queries in parallel for better performance
    const [countResult, ordersResult] = await Promise.all([
      // Fetch total orders count
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.value.id),
      // Fetch recent orders (last 3)
      supabase
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
        .limit(RECENT_ORDERS_LIMIT),
    ])

    if (countResult.error) throw countResult.error
    if (ordersResult.error) throw ordersResult.error

    orderStats.value.totalOrders = countResult.count || 0
    orderStats.value.recentOrders = (ordersResult.data as OrderSummary[]) || []
  }
  catch (error: unknown) {
    console.error('Error fetching order summary:', getErrorMessage(error))
    orderStats.value.error = getErrorMessage(error) || t('common.errorOccurred')
  }
  finally {
    orderStats.value.loading = false
  }
}

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    await navigateTo(localePath('/'))
  }
  catch (error: unknown) {
    console.error('Logout error:', getErrorMessage(error))
    // Show user-facing error message
    orderStats.value.error = t('auth.errors.logoutFailed')
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
  title: t('seo.account.title'),
  meta: [
    {
      name: 'description',
      content: t('seo.account.description'),
    },
  ],
})
</script>
