<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:translate-x-0"
      :class="{ '-translate-x-full': !sidebarOpen }"
    >
      <div class="flex h-16 items-center justify-center bg-blue-600 px-4">
        <h1 class="text-xl font-bold text-white">Moldova Direct</h1>
      </div>

      <nav class="mt-8 px-4">
        <ul class="space-y-2">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              :class="[
                'flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                isActiveRoute(item)
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-700 hover:text-white'
              ]"
            >
              <Icon :name="item.icon" class="h-5 w-5" />
              <span>{{ $t(item.labelKey) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="lg:ml-64">
      <header class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center justify-between px-6 py-4">
          <button
            @click="toggleSidebar"
            class="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          >
            <Icon name="lucide:menu" class="h-6 w-6" />
          </button>

          <div class="hidden lg:block">
            <nav class="flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-4">
                <li>
                  <div class="flex items-center">
                    <Icon name="lucide:home" class="h-4 w-4 text-gray-400" />
                    <span class="ml-2 text-sm text-gray-500">{{ $t('account.sections.admin') }}</span>
                  </div>
                </li>
                <li v-if="currentPageName">
                  <div class="flex items-center">
                    <Icon name="lucide:chevron-right" class="h-4 w-4 text-gray-400" />
                    <span class="ml-2 text-sm font-medium text-gray-900 dark:text-white">{{ currentPageName }}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <div class="flex items-center space-x-4">
            <button class="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <Icon name="lucide:bell" class="h-5 w-5" />
            </button>

            <div class="flex items-center space-x-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                <Icon name="lucide:user" class="h-5 w-5 text-white" />
              </div>
              <div class="hidden md:block">
                <p class="text-sm font-medium text-gray-900">{{ $t('account.sections.adminUser') }}</p>
                <p class="text-xs text-gray-500">{{ $t('account.sections.administrator') }}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="p-6">
        <slot />
      </main>
    </div>

    <div
      v-if="sidebarOpen"
      @click="closeSidebar"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
    ></div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const sidebarOpen = ref(false)

const navItems = [
  { to: '/admin', icon: 'lucide:layout-dashboard', labelKey: 'admin.navigation.dashboard', match: (path: string) => path === '/admin' || path === '/admin/' || path.startsWith('/admin/dashboard') },
  { to: '/admin/products', icon: 'lucide:package', labelKey: 'admin.navigation.products', match: (path: string) => path.startsWith('/admin/products') },
  { to: '/admin/inventory', icon: 'lucide:boxes', labelKey: 'admin.navigation.inventory', match: (path: string) => path.startsWith('/admin/inventory') },
  { to: '/admin/orders', icon: 'lucide:shopping-cart', labelKey: 'admin.navigation.orders', match: (path: string) => path.startsWith('/admin/orders') },
  { to: '/admin/users', icon: 'lucide:users', labelKey: 'admin.navigation.users', match: (path: string) => path.startsWith('/admin/users') },
  { to: '/admin/analytics', icon: 'lucide:bar-chart-2', labelKey: 'admin.navigation.analytics', match: (path: string) => path.startsWith('/admin/analytics') },
  { to: '/admin/tools/email-testing', icon: 'lucide:wrench', labelKey: 'admin.navigation.tools', match: (path: string) => path.startsWith('/admin/tools') }
]

const currentPageName = computed(() => {
  const path = route.path
  const active = navItems.find(item => item.match(path))
  return active ? t(active.labelKey) : null
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const isActiveRoute = (item: { match: (path: string) => boolean }) => {
  return item.match(route.path)
}

watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  }
)
</script>
