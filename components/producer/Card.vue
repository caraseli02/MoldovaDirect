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
    @click="$emit('click', producer)"
  >
    <!-- Portrait Image - FIXED: Changed from aspect-square to 4:5 for better mobile fit -->
    <div class="relative aspect-[4/5] overflow-hidden bg-slate-100">
      <NuxtImg
        :src="producer.portraitImage"
        :alt="producer.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        sizes="sm:100vw md:50vw lg:33vw"
      />

      <!-- Region Badge -->
      <div class="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
        {{ regionName }}
      </div>

      <!-- Hover Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <div class="absolute bottom-4 left-4 right-4">
          <p class="text-sm font-medium text-white">
            {{ t('wineStory.producers.viewStory') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Content - FIXED: Better padding and spacing for mobile -->
    <div class="flex flex-1 flex-col p-4 md:p-6">
      <!-- Name -->
      <h3 class="text-lg font-bold text-slate-900 md:text-xl">
        {{ producer.name }}
      </h3>

      <!-- Specialty -->
      <p class="mt-1 text-sm font-medium text-primary">
        {{ getLocalizedText(producer.specialty) }}
      </p>

      <!-- Meta Info - More compact on mobile -->
      <div class="mt-2 space-y-1 text-xs text-slate-500">
        <div
          v-if="producer.establishedYear"
          class="flex items-center gap-1.5"
        >
          <commonIcon
            name="lucide:calendar"
            class="h-3 w-3"
          />
          <span>{{ t('wineStory.producers.establishedYear', { year: producer.establishedYear }) }}</span>
        </div>

        <div
          v-if="producer.generationsOfWinemaking"
          class="flex items-center gap-1.5"
        >
          <commonIcon
            name="lucide:users"
            class="h-3 w-3"
          />
          <span>{{ t('wineStory.producers.generations', { count: producer.generationsOfWinemaking }) }}</span>
        </div>
      </div>

      <!-- Short Bio -->
      <p class="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 md:text-base">
        {{ getLocalizedText(producer.shortBio) }}
      </p>

      <!-- Read More Button -->
      <button
        class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/90"
        @click.stop="$emit('click', producer)"
      >
        {{ t('wineStory.producers.readMore') }}
        <commonIcon
          name="lucide:arrow-right"
          class="h-4 w-4 transition-transform group-hover:translate-x-1"
        />
      </button>
    </div>

    <!-- Certifications Badge (if organic/certified) -->
    <div
      v-if="producer.certifications && producer.certifications.length > 0"
      class="absolute right-3 top-3 rounded-full bg-green-500 p-2 shadow-lg"
      :title="producer.certifications.map(c => c.name).join(', ')"
    >
      <commonIcon
        name="lucide:leaf"
        class="h-4 w-4 text-white"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Producer } from '~/types'

interface Props {
  producer: Producer
}

const props = defineProps<Props>()
defineEmits<{
  click: [producer: Producer]
}>()

const { t, locale } = useI18n()

// Get localized text from Translations object
const getLocalizedText = (translations: any): string => {
  if (!translations) return ''
  return translations[locale.value] || translations.en || Object.values(translations)[0] || ''
}

// Get region name from translation keys
const regionName = computed(() => {
  const regionKey = props.producer.region
  if (regionKey === 'codru') return t('wineStory.regions.codru.name')
  if (regionKey === 'stefan-voda') return t('wineStory.regions.stefanVoda.name')
  if (regionKey === 'valul-lui-traian') return t('wineStory.regions.valulLuiTraian.name')
  return regionKey
})
</script>

<style scoped>
/* Additional hover effects */
.group:hover .line-clamp-3 {
  color: rgb(15 23 42);
}

/* Focus visible styles for accessibility */
article:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--color-primary), 0 0 0 4px white;
}

/* Line clamp utility */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
