<template>
  <!-- Teleport loading indicator to body - prevents layout shift and hydration mismatch -->
  <Teleport to="body">
    <div class="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none">
      <ClientOnly>
        <NuxtLoadingIndicator
          color="repeating-linear-gradient(to right, hsl(222.2 47.4% 11.2%) 0%, hsl(215 20.2% 65.1%) 50%, hsl(222.2 47.4% 11.2%) 100%)"
          :height="3"
        />
      </ClientOnly>
    </div>
  </Teleport>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const { locale } = useI18n()

// Get the selected hero video to preload the correct poster
const { currentVideo } = useHeroVideos()

// Create a safe computed for the poster URL with fallback
const heroPosterUrl = computed(() => currentVideo.value?.poster || '/hero-fallback.jpg')

useHead({
  htmlAttrs: {
    lang: () => locale.value,
  },
  bodyAttrs: {
    // Static class - prevents hydration mismatch
    class: 'min-h-screen flex flex-col bg-white dark:bg-gray-950 selection:bg-primary-100 dark:selection:bg-primary-900/30',
  },
  link: computed(() => {
    // Only add preload if poster URL is valid and not fallback
    if (!heroPosterUrl.value || heroPosterUrl.value === '/hero-fallback.jpg') {
      return []
    }
    return [{
      rel: 'preload',
      as: 'image',
      href: heroPosterUrl.value,
      fetchpriority: 'high',
    }]
  }),
})
</script>
