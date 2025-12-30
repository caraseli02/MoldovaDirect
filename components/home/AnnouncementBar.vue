<template>
  <div
    class="fixed left-0 right-0 top-0 z-[60] overflow-hidden border-b border-[#C9A227]/20"
    role="banner"
    aria-label="Promotional announcement"
    :style="{
      background: 'linear-gradient(135deg, #151515 0%, #8B2E3B 50%, #151515 100%)',
    }"
  >
    <!-- Subtle gold accent line at top -->
    <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227] to-transparent opacity-60"></div>

    <div class="container">
      <div
        class="flex items-center justify-center gap-3 py-2.5 text-sm font-medium md:py-3 md:text-base"
        style="font-family: 'Inter', system-ui, sans-serif; color: #F8F5EE;"
      >
        <commonIcon
          name="lucide:sparkles"
          class="h-4 w-4 flex-shrink-0"
          style="color: #C9A227;"
        />
        <p
          class="text-center"
          style="letter-spacing: 0.025em;"
        >
          <span
            class="font-semibold"
            style="color: #C9A227;"
          >{{ t('home.announcement.highlight') }}</span>
          <span class="mx-2 hidden opacity-60 sm:inline">|</span>
          <span class="block sm:inline">{{ t('home.announcement.description') }}</span>
        </p>
        <NuxtLink
          v-if="showCta"
          :to="localePath('/products')"
          class="ml-2 hidden items-center whitespace-nowrap rounded-sm px-4 py-1.5 text-xs font-medium uppercase transition-all duration-300 md:inline-flex"
          style="
            font-family: 'Inter', system-ui, sans-serif;
            letter-spacing: 0.1em;
            background: linear-gradient(135deg, #C9A227 0%, #D4AF37 50%, #C9A227 100%);
            color: #151515;
            border: 1px solid #C9A227;
          "
          @mouseenter="($event.target as HTMLElement).style.background = 'linear-gradient(135deg, #D4AF37 0%, #E5C158 50%, #D4AF37 100%)'"
          @mouseleave="($event.target as HTMLElement).style.background = 'linear-gradient(135deg, #C9A227 0%, #D4AF37 50%, #C9A227 100%)'"
        >
          {{ t('home.announcement.cta') }}
          <commonIcon
            name="lucide:arrow-right"
            class="ml-1.5 h-3 w-3"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Refined luxury shimmer overlay -->
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A227]/5 to-transparent opacity-30"></div>

    <!-- Subtle gold accent line at bottom -->
    <div class="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showCta?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>
