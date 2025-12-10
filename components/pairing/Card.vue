<template>
  <article
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :visible="{
      opacity: 1,
      y: 0,
      transition: { duration: 500 },
    }"
    class="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
    @click="$emit('click', pairing)"
  >
    <!-- Split Image Layout - FIXED: Optimized height for mobile -->
    <div class="relative grid h-48 grid-cols-2 md:h-56">
      <!-- Wine Image (Left) -->
      <div class="relative overflow-hidden bg-slate-100">
        <NuxtImg
          :src="pairing.wineImage"
          :alt="getLocalizedText(pairing.wineName)"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          sizes="25vw"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"></div>

        <!-- Wine Type Badge -->
        <div class="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium capitalize text-slate-900 backdrop-blur md:bottom-3 md:left-3 md:px-3">
          {{ t(`wineStory.pairings.wineTypes.${pairing.wineType}`) }}
        </div>
      </div>

      <!-- Food Image (Right) -->
      <div class="relative overflow-hidden bg-slate-100">
        <NuxtImg
          :src="pairing.foodImage"
          :alt="getLocalizedText(pairing.dishName)"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          sizes="25vw"
        />
        <div class="absolute inset-0 bg-gradient-to-l from-transparent to-black/20"></div>
      </div>

      <!-- Center Divider with Plus Icon -->
      <div class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div class="rounded-full bg-white p-2.5 shadow-lg md:p-3">
          <commonIcon
            name="lucide:plus"
            class="h-4 w-4 text-gold-500 md:h-5 md:w-5"
          />
        </div>
      </div>

      <!-- Hover Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <div class="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4">
          <p class="text-xs font-medium text-white md:text-sm">
            {{ t('wineStory.pairings.viewPairing') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Content - FIXED: Better mobile padding and spacing -->
    <div class="flex flex-1 flex-col p-4 md:p-5">
      <!-- Wine + Dish Names -->
      <div class="space-y-1">
        <h3 class="text-base font-bold text-slate-900 md:text-lg">
          {{ getLocalizedText(pairing.wineName) }}
        </h3>
        <p class="flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <commonIcon
            name="lucide:utensils"
            class="h-3.5 w-3.5"
          />
          {{ getLocalizedText(pairing.dishName) }}
        </p>
      </div>

      <!-- Pairing Reason -->
      <div class="mt-3 flex-1">
        <div class="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          <commonIcon
            name="lucide:lightbulb"
            class="h-3 w-3"
          />
          {{ t('wineStory.pairings.whyItWorks') }}
        </div>
        <p class="line-clamp-2 text-sm leading-relaxed text-slate-600">
          {{ getLocalizedText(pairing.pairingReason) }}
        </p>
      </div>

      <!-- Occasions & Seasons Tags -->
      <div class="mt-3 flex flex-wrap gap-1.5 md:gap-2">
        <span
          v-for="occasion in pairing.occasions.slice(0, 2)"
          :key="occasion"
          class="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary"
        >
          <commonIcon
            name="lucide:calendar"
            class="h-2.5 w-2.5"
          />
          {{ t(`wineStory.pairings.occasions.${occasion}`) }}
        </span>

        <span
          v-if="pairing.seasons.length > 0"
          class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
        >
          <commonIcon
            name="lucide:sun"
            class="h-2.5 w-2.5"
          />
          {{ t(`wineStory.pairings.seasons.${pairing.seasons[0]}`) }}
        </span>
      </div>

      <!-- View Details Button -->
      <button
        class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 md:mt-4 md:px-4 md:py-2.5"
        @click.stop="$emit('click', pairing)"
      >
        {{ t('wineStory.pairings.viewPairing') }}
        <commonIcon
          name="lucide:arrow-right"
          class="h-4 w-4 transition-transform group-hover:translate-x-1"
        />
      </button>
    </div>

    <!-- Intensity Indicator -->
    <div class="absolute right-2.5 top-2.5 rounded-full bg-white/90 p-1.5 shadow-md backdrop-blur md:right-3 md:top-3 md:p-2">
      <div
        class="flex items-center gap-0.5 md:gap-1"
        :title="t(`wineStory.pairings.intensity.${pairing.characteristics.intensity}`)"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="h-1 w-1 rounded-full md:h-1.5 md:w-1.5"
          :class="getIntensityColor(i, pairing.characteristics.intensity)"
        ></div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PairingGuide } from '~/types'

interface Props {
  pairing: PairingGuide
}

defineProps<Props>()
defineEmits<{
  click: [pairing: PairingGuide]
}>()

const { t, locale } = useI18n()

// Get localized text from Translations object
const getLocalizedText = (translations: Record<string, unknown>): string => {
  if (!translations) return ''
  return translations[locale.value] || translations.en || Object.values(translations)[0] || ''
}

// Get intensity indicator colors
const getIntensityColor = (position: number, intensity: 'light' | 'medium' | 'bold'): string => {
  const intensityMap = {
    light: 1,
    medium: 2,
    bold: 3,
  }

  const level = intensityMap[intensity]
  return position <= level ? 'bg-primary' : 'bg-slate-200'
}
</script>

<style scoped>
/* Focus visible styles for accessibility */
article:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--color-primary), 0 0 0 4px white;
}

/* Smooth transitions */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
