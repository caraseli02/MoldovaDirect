<template>
  <ConfigProvider :use-id="useIdFunction">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ConfigProvider>
</template>

<script setup>
import { ConfigProvider } from 'reka-ui'

const { locale } = useI18n()

// Inject Nuxt's useId into reka-ui for proper SSR hydration
// This fixes hydration errors with Portal components and other reka-ui components
const useIdFunction = () => useId()

useHead({
  htmlAttrs: {
    lang: () => locale.value
  }
})
</script>