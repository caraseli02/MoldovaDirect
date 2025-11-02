<template>
  <div
    class="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 text-white"
    role="banner"
    aria-label="Promotional announcement"
  >
    <div class="container">
      <div class="flex items-center justify-center gap-3 py-3 text-sm font-medium md:text-base">
        <commonIcon name="lucide:sparkles" class="h-4 w-4 flex-shrink-0" />
        <p class="text-center">
          <span class="font-semibold">{{ t('home.announcement.highlight') }}</span>
          <span class="mx-2 hidden sm:inline">•</span>
          <span class="block sm:inline">{{ t('home.announcement.description') }}</span>
        </p>
        <NuxtLink
          v-if="showCta"
          :to="localePath('/products')"
          class="ml-2 hidden whitespace-nowrap rounded-full bg-white/20 px-4 py-1 text-xs font-semibold transition hover:bg-white/30 md:inline-flex"
        >
          {{ t('home.announcement.cta') }}
          <commonIcon name="lucide:arrow-right" class="ml-1 h-3 w-3" />
        </NuxtLink>
      </div>
    </div>

    <!-- Decorative gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-30 pointer-events-none"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showCta?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
