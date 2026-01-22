<template>
  <div>
    <LayoutAppHeader />
    <main
      class="flex-1 text-gray-900 dark:text-white pb-16 md:pb-0"
      :class="{ 'pt-16': !hasDarkHero }"
    >
      <div id="layout-content-wrapper">
        <ClientOnly>
          <TooltipProvider :delay-duration="300">
            <slot></slot>
          </TooltipProvider>

          <!-- Fallback for SSR: same content without tooltip functionality -->
          <template #fallback>
            <slot></slot>
          </template>
        </ClientOnly>
      </div>
    </main>
    <LayoutAppFooter />
    <LayoutBottomNav />
    <div id="layout-client-portals">
      <ClientOnly>
        <Sonner
          position="top-right"
          :rich-colors="true"
        />
        <MobilePWAInstallPrompt />
        <MobilePWAUpdatePrompt />
        <MobileOfflineIndicator />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from 'reka-ui'

const { registerShortcut } = useKeyboardShortcuts()
const localePath = useLocalePath()
const router = useRouter()
const route = useRoute()

// Logic tailored to match AppHeader.vue for consistency
const currentPath = computed(() => route.path?.replace(/\/(en|ro|ru)/, '') || '/')
const pagesWithDarkHero = ['/']
const hasDarkHero = computed(() => pagesWithDarkHero.includes(currentPath.value))

// Register global search shortcut (Ctrl/Cmd + K)
registerShortcut('k', () => {
  router.push(localePath({ path: '/products', query: { focus: 'search' } }))
}, {
  ctrlOrCmd: true,
  preventDefault: true,
  description: 'Open search',
})
</script>
