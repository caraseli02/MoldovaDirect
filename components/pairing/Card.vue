<template>
  <article
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :visible="{
      opacity: 1,
      y: 0,
      transition: { duration: 500 },
    }"
    class="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
    @click="$emit('click', pairing)"
  >
    <!-- Split Image Layout -->
    <div class="relative grid h-64 grid-cols-2">
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
        <div class="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium capitalize text-slate-900 backdrop-blur">
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
        <div class="rounded-full bg-white p-3 shadow-lg">
          <commonIcon name="lucide:plus" class="h-5 w-5 text-gold-500" />
        </div>
      </div>

      <!-- Hover Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <div class="absolute bottom-4 left-4 right-4">
          <p class="text-sm font-medium text-white">
            {{ t('wineStory.pairings.viewPairing') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Wine + Dish Names -->
      <div class="space-y-1">
        <h3 class="text-lg font-bold text-slate-900">
          {{ getLocalizedText(pairing.wineName) }}
        </h3>
        <p class="flex items-center gap-2 text-sm font-medium text-slate-600">
          <commonIcon name="lucide:utensils" class="h-4 w-4" />
          {{ getLocalizedText(pairing.dishName) }}
        </p>
      </div>

      <!-- Pairing Reason -->
      <div class="mt-3">
        <div class="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          <commonIcon name="lucide:lightbulb" class="h-3.5 w-3.5" />
          {{ t('wineStory.pairings.whyItWorks') }}
        </div>
        <p class="line-clamp-2 text-base leading-relaxed text-slate-600">
          {{ getLocalizedText(pairing.pairingReason) }}
        </p>
      </div>

      <!-- Occasions & Seasons Tags -->
      <div class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="occasion in pairing.occasions.slice(0, 2)"
          :key="occasion"
          class="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
        >
          <commonIcon name="lucide:calendar" class="h-3 w-3" />
          {{ t(`wineStory.pairings.occasions.${occasion}`) }}
        </span>

        <span
          v-if="pairing.seasons.length > 0"
          class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
        >
          <commonIcon name="lucide:sun" class="h-3 w-3" />
          {{ t(`wineStory.pairings.seasons.${pairing.seasons[0]}`) }}
        </span>
      </div>

      <!-- View Details Button -->
      <button
        class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        @click.stop="$emit('click', pairing)"
      >
        {{ t('wineStory.pairings.viewPairing') }}
        <commonIcon name="lucide:arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>

    <!-- Intensity Indicator -->
    <div class="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-md backdrop-blur">
      <div
        class="flex items-center gap-1"
        :title="t(`wineStory.pairings.intensity.${pairing.characteristics.intensity}`)"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="h-1.5 w-1.5 rounded-full"
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
const getLocalizedText = (translations: any): string => {
  if (!translations) return ''
  return translations[locale.value] || translations.en || Object.values(translations)[0] || ''
}

// Get intensity indicator colors
const getIntensityColor = (position: number, intensity: 'light' | 'medium' | 'bold'): string => {
  const intensityMap = {
    light: 1,
    medium: 2,
    bold: 3
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
