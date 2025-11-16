<template>
  <div class="min-h-screen flex flex-col">
    <LayoutAppHeader />
    <main class="flex-1 bg-white dark:bg-gray-950 text-gray-900 dark:text-white pb-16 md:pb-0">
      <slot />
    </main>
    <LayoutAppFooter />
    <!-- Bottom Navigation for Mobile -->
    <LayoutBottomNav />
    <ClientOnly>
      <!-- PWA Components -->
      <MobilePWAInstallPrompt />
      <MobilePWAUpdatePrompt />
      <MobileOfflineIndicator />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
// Wrap keyboard shortcuts in onMounted to avoid hydration issues
onMounted(() => {
  const { registerShortcut } = useKeyboardShortcuts()
  const localePath = useLocalePath()
  const router = useRouter()

  // Register global search shortcut (Ctrl/Cmd + K)
  registerShortcut('k', () => {
    router.push(localePath({ path: '/products', query: { focus: 'search' } }))
  }, {
    ctrlOrCmd: true,
    preventDefault: true,
    description: 'Open search'
  })
})
</script>
