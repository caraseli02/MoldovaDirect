<template>
  <ClientOnly>
    <UiTooltipProvider :delay-duration="300">
      <div class="min-h-screen flex flex-col">
        <LayoutAppHeader />
        <main class="flex-1 bg-white dark:bg-gray-950 text-gray-900 dark:text-white pb-16 md:pb-0">
          <slot></slot>
        </main>
        <LayoutAppFooter />
        <!-- Bottom Navigation for Mobile -->
        <LayoutBottomNav />
        <ClientOnly>
          <!-- Sonner toaster (shadcn-vue) -->
          <Sonner
            position="top-right"
            :rich-colors="true"
          />
          <!-- PWA Components -->
          <MobilePWAInstallPrompt />
          <MobilePWAUpdatePrompt />
          <MobileOfflineIndicator />
        </ClientOnly>
      </div>
    </UiTooltipProvider>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Sonner } from '@/components/ui/sonner'

const { registerShortcut } = useKeyboardShortcuts()
const localePath = useLocalePath()
const router = useRouter()

// Register global search shortcut (Ctrl/Cmd + K)
registerShortcut('k', () => {
  router.push(localePath({ path: '/products', query: { focus: 'search' } }))
}, {
  ctrlOrCmd: true,
  preventDefault: true,
  description: 'Open search',
})
</script>
