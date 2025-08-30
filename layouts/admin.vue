<!--
  Admin Layout Component
  
  Requirements addressed:
  - 6.1: Responsive admin layout with sidebar navigation
  - 6.3: Admin header component with user info
  
  Basic admin layout with:
  - Sidebar navigation
  - Header with user info
  - Main content area
  - Responsive design
-->

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0"
         :class="{ '-translate-x-full': !sidebarOpen }">
      
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 px-4 bg-blue-600">
        <h1 class="text-xl font-bold text-white">Moldova Direct</h1>
      </div>

      <!-- Navigation -->
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <NuxtLink
            to="/admin"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-700"
          >
            <Icon name="heroicons:home" class="w-5 h-5 mr-3" />
            {{ $t('admin.navigation.dashboard') }}
          </NuxtLink>
          
          <NuxtLink
            to="/admin/products"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-700"
          >
            <Icon name="heroicons:cube" class="w-5 h-5 mr-3" />
            {{ $t('admin.navigation.products') }}
          </NuxtLink>
          
          <NuxtLink
            to="/admin/orders"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-700"
          >
            <Icon name="heroicons:shopping-bag" class="w-5 h-5 mr-3" />
            {{ $t('admin.navigation.orders') }}
          </NuxtLink>
          
          <NuxtLink
            to="/admin/users"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-700"
          >
            <Icon name="heroicons:users" class="w-5 h-5 mr-3" />
            {{ $t('admin.navigation.users') }}
          </NuxtLink>
          
          <NuxtLink
            to="/admin/analytics"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-700"
          >
            <Icon name="heroicons:chart-bar" class="w-5 h-5 mr-3" />
            {{ $t('admin.navigation.analytics') }}
          </NuxtLink>
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="lg:ml-64">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between px-6 py-4">
          <!-- Mobile menu button -->
          <button
            @click="toggleSidebar"
            class="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Icon name="heroicons:bars-3" class="w-6 h-6" />
          </button>

          <!-- Breadcrumb -->
          <div class="hidden lg:block">
            <nav class="flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-4">
                <li>
                  <div class="flex items-center">
                    <Icon name="heroicons:home" class="w-4 h-4 text-gray-400" />
                    <span class="ml-2 text-sm text-gray-500">{{ $t('account.sections.admin') }}</span>
                  </div>
                </li>
                <li v-if="currentPageName">
                  <div class="flex items-center">
                    <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
                    <span class="ml-2 text-sm font-medium text-gray-900">{{ currentPageName }}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <!-- User menu -->
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              <Icon name="heroicons:bell" class="w-5 h-5" />
            </button>

            <!-- User profile -->
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Icon name="heroicons:user" class="w-5 h-5 text-white" />
              </div>
              <div class="hidden md:block">
                <p class="text-sm font-medium text-gray-900">{{ $t('account.sections.adminUser') }}</p>
                <p class="text-xs text-gray-500">{{ $t('account.sections.administrator') }}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      @click="closeSidebar"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
    ></div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// State
const sidebarOpen = ref(false)

// Computed
const route = useRoute()
const currentPageName = computed(() => {
  const path = route.path
  if (path === '/admin' || path === '/admin/') return t('admin.navigation.dashboard')
  if (path.startsWith('/admin/products')) return t('admin.navigation.products')
  if (path.startsWith('/admin/orders')) return t('admin.navigation.orders')
  if (path.startsWith('/admin/users')) return t('admin.navigation.users')
  if (path.startsWith('/admin/analytics')) return t('admin.navigation.analytics')
  return null
})

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>