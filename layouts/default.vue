<template>
  <div class="min-h-screen flex flex-col">
    <LayoutAppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <LayoutAppFooter />
    <ClientOnly>
      <UiToastContainer />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
</script>