<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Global Sonner toaster (shadcn-vue) - available across all layouts -->
    <ClientOnly>
      <UiSonner position="top-right" :rich-colors="true" />
    </ClientOnly>
  </div>
</template>

<script setup>
const { locale } = useI18n()

useHead({
  htmlAttrs: {
    lang: () => locale.value
  }
})
</script>