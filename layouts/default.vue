<template>
  <div class="min-h-screen flex flex-col">
    <LayoutAppHeader />
    <main class="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <slot />
    </main>
    <LayoutAppFooter />
    <ClientOnly>
      <CustomToastContainer />
      <!-- PWA Components -->
      <MobilePWAInstallPrompt />
      <MobilePWAUpdatePrompt />
      <MobileOfflineIndicator />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
</script>