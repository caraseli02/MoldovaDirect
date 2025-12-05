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
              <commonIcon :name="item.icon" class="h-5 w-5" />
              <span>{{ $t(item.labelKey) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="lg:ml-64">
      <header class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center justify-between px-6 py-4">
          <UiButton
            @click="toggleSidebar"
            variant="ghost"
            size="icon"
            class="lg:hidden"
            :aria-label="$t('admin.navigation.toggleSidebar')"
          >
            <commonIcon name="lucide:menu" class="h-6 w-6" />
          </UiButton>

          <div class="hidden lg:block">
            <nav class="flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-4">
                <li>
                  <div class="flex items-center">
                    <commonIcon name="lucide:home" class="h-4 w-4 text-gray-400" />
                    <span class="ml-2 text-sm text-gray-500">{{ $t('account.sections.admin') }}</span>
                  </div>
                </li>
                <li v-if="currentPageName">
                  <div class="flex items-center">
                    <commonIcon name="lucide:chevron-right" class="h-4 w-4 text-gray-400" />
                    <span class="ml-2 text-sm font-medium text-gray-900 dark:text-white">{{ currentPageName }}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <div class="flex items-center space-x-4">
            <UiButton
              variant="ghost"
              size="icon"
              :aria-label="$t('admin.navigation.notifications')"
            >
              <commonIcon name="lucide:bell" class="h-5 w-5" />
            </UiButton>

            <!-- Admin User Menu -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="toggleUserMenu"
                class="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                :aria-expanded="userMenuOpen"
                aria-haspopup="true"
              >
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <commonIcon name="lucide:user" class="h-5 w-5 text-white" />
                </div>
                <div class="hidden md:block text-left">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('account.sections.adminUser') }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('account.sections.administrator') }}</p>
                </div>
                <commonIcon
                  name="lucide:chevron-down"
                  class="h-4 w-4 text-gray-500 transition-transform"
                  :class="{ 'rotate-180': userMenuOpen }"
                />
              </button>

              <!-- Dropdown Menu -->
              <Transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="userMenuOpen"
                  class="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700"
                >
                  <div class="py-1">
                    <NuxtLink
                      :to="localePath('/account')"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      @click="userMenuOpen = false"
                    >
                      <commonIcon name="lucide:user" class="h-4 w-4" />
                      <span>{{ $t('common.account') }}</span>
                    </NuxtLink>
                    <NuxtLink
                      :to="localePath('/account/profile')"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      @click="userMenuOpen = false"
                    >
                      <commonIcon name="lucide:settings" class="h-4 w-4" />
                      <span>{{ $t('account.profile') }}</span>
                    </NuxtLink>
                    <div class="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <button
                      @click="handleLogout"
                      class="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <commonIcon name="lucide:log-out" class="h-4 w-4" />
                      <span>{{ $t('common.logout') }}</span>
                    </button>
                  </div>
                </div>
              </Transition>
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
      @click="sidebarOpen = false"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
    ></div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const authStore = useAuthStore()
const toast = useToast()

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const navItems = [
  { to: '/admin', icon: 'lucide:layout-dashboard', labelKey: 'admin.navigation.dashboard', match: (path: string) => path === '/admin' || path === '/admin/' || path.startsWith('/admin/dashboard') },
  { to: '/admin/products', icon: 'lucide:package', labelKey: 'admin.navigation.products', match: (path: string) => path.startsWith('/admin/products') },
  { to: '/admin/inventory', icon: 'lucide:boxes', labelKey: 'admin.navigation.inventory', match: (path: string) => path.startsWith('/admin/inventory') },
  { to: '/admin/orders', icon: 'lucide:shopping-cart', labelKey: 'admin.navigation.orders', match: (path: string) => path.startsWith('/admin/orders') },
  { to: '/admin/users', icon: 'lucide:users', labelKey: 'admin.navigation.users', match: (path: string) => path.startsWith('/admin/users') },
  { to: '/admin/analytics', icon: 'lucide:bar-chart-2', labelKey: 'admin.navigation.analytics', match: (path: string) => path.startsWith('/admin/analytics') },
  { to: '/admin/testing', icon: 'lucide:flask-conical', labelKey: 'admin.navigation.testing', match: (path: string) => path.startsWith('/admin/testing') },
  { to: '/admin/tools/email-testing', icon: 'lucide:wrench', labelKey: 'admin.navigation.tools', match: (path: string) => path.startsWith('/admin/tools') }
]

const currentPageName = computed(() => {
  const path = route.path
  const active = navItems.find(item => item.match(path))
  return active ? t(active.labelKey) : null
})

function toggleSidebar(): void {
  sidebarOpen.value = !sidebarOpen.value
}

function toggleUserMenu(): void {
  userMenuOpen.value = !userMenuOpen.value
}

function closeAllMenus(): void {
  sidebarOpen.value = false
  userMenuOpen.value = false
}

function isActiveRoute(item: { match: (path: string) => boolean }): boolean {
  return item.match(route.path)
}

async function handleLogout(): Promise<void> {
  try {
    closeAllMenus()
    await authStore.logout()
  } catch (error) {
    console.error('[Admin] Logout failed:', error)

    // Re-open menu so user can try again
    userMenuOpen.value = true

    // Show error toast
    toast.toast({
      title: t('admin.errors.logoutFailed'),
      description: error instanceof Error ? error.message : t('admin.errors.unknownError'),
      variant: 'destructive'
    })
  }
}

// Close menu when clicking outside
function handleClickOutside(event: MouseEvent): void {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    userMenuOpen.value = false
  }
}

// Close all menus when route changes
watch(() => route.path, closeAllMenus)

// Add/remove click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
