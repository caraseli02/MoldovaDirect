<template>
  <div
    class="relative overflow-hidden bg-gradient-to-r from-brand-dark via-brand-accent to-brand-dark text-brand-light"
    role="banner"
    aria-label="Promotional announcement"
  >
    <div class="container">
      <div class="flex items-center justify-center gap-3 py-3 text-sm font-medium md:text-base">
        <commonIcon
          name="lucide:sparkles"
          class="h-4 w-4 flex-shrink-0"
        />
        <p class="text-center">
          <span class="font-semibold">{{ t('home.announcement.highlight') }}</span>
          <span class="mx-2 hidden sm:inline">•</span>
          <span class="block sm:inline">{{ t('home.announcement.description') }}</span>
        </p>
        <NuxtLink
          v-if="showCta"
          :to="localePath('/products')"
          class="ml-2 hidden whitespace-nowrap rounded-full border border-brand-light/25 bg-brand-light/15 px-4 py-1 text-xs font-medium tracking-wide backdrop-blur-sm transition-all hover:border-brand-light/35 hover:bg-brand-light/25 md:inline-flex"
        >
          {{ t('home.announcement.cta') }}
          <commonIcon
            name="lucide:arrow-right"
            class="ml-1 h-3 w-3"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Refined luxury overlay -->
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-brand-light/5 to-transparent opacity-40"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showCta?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
