<template>
  <!-- TooltipProvider wrapped conditionally to avoid CE crash on SSR while preserving SSR for content -->
  <component
    :is="tooltipWrapper"
    :delay-duration="300"
  >
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
  </component>
</template>

<script setup lang="ts">
import { Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from 'reka-ui'

const { registerShortcut } = useKeyboardShortcuts()
const localePath = useLocalePath()
const router = useRouter()

// Use TooltipProvider on client, plain div on server to avoid CE crash during SSR
const tooltipWrapper = import.meta.client ? TooltipProvider : 'div'

// Register global search shortcut (Ctrl/Cmd + K)
registerShortcut('k', () => {
  router.push(localePath({ path: '/products', query: { focus: 'search' } }))
}, {
  ctrlOrCmd: true,
  preventDefault: true,
  description: 'Open search',
})
</script>
