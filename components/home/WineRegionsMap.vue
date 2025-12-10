<template>
  <section class="relative overflow-hidden bg-white py-20 md:py-32">
    <div class="container">
      <!-- Section Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="mx-auto max-w-3xl text-center"
      >
        <h2 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          {{ t('wineStory.regions.title') }}
        </h2>
        <p class="mt-6 text-xl leading-relaxed text-slate-600">
          {{ t('wineStory.regions.subtitle') }}
        </p>
      </div>

      <!-- Map and Region Cards -->
      <div class="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <!-- Interactive SVG Map -->
        <div
          v-motion
          :initial="{ opacity: 0, x: -40 }"
          :visible="{
            opacity: 1,
            x: 0,
            transition: { duration: 600, delay: 200 },
          }"
          class="relative"
        >
          <div class="sticky top-24 rounded-2xl bg-slate-50 p-8 shadow-lg">
            <!-- Loading State -->
            <div
              v-if="loading"
              class="flex h-96 items-center justify-center"
            >
              <commonIcon
                name="lucide:loader-2"
                class="h-8 w-8 animate-spin text-primary"
              />
            </div>

            <!-- Error State -->
            <div
              v-else-if="error"
              class="flex h-96 flex-col items-center justify-center text-center"
            >
              <commonIcon
                name="lucide:alert-circle"
                class="h-12 w-12 text-red-500"
              />
              <p class="mt-2 text-sm text-red-600">
                {{ t('wineStory.regions.error') }}
              </p>
            </div>

            <!-- SVG Map -->
            <svg
              v-else
              viewBox="26 45 5 3"
              class="h-auto w-full"
              :aria-label="t('wineStory.regions.title')"
              role="img"
            >
              <title>{{ t('wineStory.regions.title') }}</title>

              <!-- Region Polygons -->
              <g
                v-for="region in regions"
                :key="region.id"
                role="button"
                :aria-label="getLocalizedText(region.name)"
                tabindex="0"
                class="cursor-pointer transition-all duration-300"
                @click="selectRegion(region.id)"
                @keydown.enter="selectRegion(region.id)"
                @keydown.space.prevent="selectRegion(region.id)"
                @mouseenter="hoveredRegion = region.id"
                @mouseleave="hoveredRegion = null"
              >
                <!-- Region Path -->
                <path
                  :d="getRegionPath(region.id)"
                  :fill="getRegionColor(region.id)"
                  :stroke="selectedRegion === region.id ? '#1e293b' : '#64748b'"
                  :stroke-width="selectedRegion === region.id ? 0.02 : 0.01"
                  :opacity="selectedRegion && selectedRegion !== region.id ? 0.4 : 1"
                  class="transition-all duration-300"
                />

                <!-- Region Label -->
                <text
                  :x="getRegionCenter(region.id).x"
                  :y="getRegionCenter(region.id).y"
                  text-anchor="middle"
                  class="pointer-events-none fill-white text-[0.15px] font-bold"
                  style="paint-order: stroke; stroke: rgba(0,0,0,0.5); stroke-width: 0.01px;"
                >
                  {{ getLocalizedText(region.name) }}
                </text>
              </g>
            </svg>

            <!-- Legend -->
            <div class="mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                v-for="region in regions"
                :key="`legend-${region.id}`"
                class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all"
                :class="[
                  selectedRegion === region.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-100',
                ]"
                @click="selectRegion(region.id)"
              >
                <span
                  class="h-3 w-3 rounded-full"
                  :style="{ backgroundColor: getRegionColor(region.id) }"
                ></span>
                {{ getLocalizedText(region.name) }}
              </button>

              <button
                v-if="selectedRegion"
                class="inline-flex items-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300"
                @click="clearSelection"
              >
                <commonIcon
                  name="lucide:x"
                  class="h-3 w-3"
                />
                {{ t('wineStory.regions.clearFilter') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Region Info Cards -->
        <div
          v-motion
          :initial="{ opacity: 0, x: 40 }"
          :visible="{
            opacity: 1,
            x: 0,
            transition: { duration: 600, delay: 400 },
          }"
          class="space-y-6"
        >
          <div
            v-for="region in displayedRegions"
            :key="region.id"
            class="group rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg"
            :class="{ 'border-primary shadow-lg': selectedRegion === region.id }"
          >
            <!-- Region Header -->
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-slate-900">
                  {{ getLocalizedText(region.name) }}
                </h3>
                <p class="mt-1 text-sm text-slate-600">
                  {{ getLocalizedText(region.description) }}
                </p>
              </div>
              <span
                class="ml-3 h-4 w-4 rounded-full"
                :style="{ backgroundColor: getRegionColor(region.id) }"
              ></span>
            </div>

            <!-- Characteristics -->
            <div class="mt-4 space-y-3">
              <div class="flex items-start gap-3 text-sm">
                <commonIcon
                  name="lucide:layers"
                  class="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400"
                />
                <div>
                  <span class="font-medium text-slate-700">{{ t('wineStory.regions.soilType') }}:</span>
                  <span class="ml-1 text-slate-600">{{ getLocalizedText(region.characteristics.soilType) }}</span>
                </div>
              </div>

              <div class="flex items-start gap-3 text-sm">
                <commonIcon
                  name="lucide:thermometer"
                  class="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400"
                />
                <div>
                  <span class="font-medium text-slate-700">{{ t('wineStory.regions.climate') }}:</span>
                  <span class="ml-1 text-slate-600">{{ getLocalizedText(region.climate) }}</span>
                </div>
              </div>

              <div class="flex items-start gap-3 text-sm">
                <commonIcon
                  name="lucide:grape"
                  class="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400"
                />
                <div>
                  <span class="font-medium text-slate-700">{{ t('wineStory.regions.primaryGrapes') }}:</span>
                  <span class="ml-1 text-slate-600">{{ region.primaryGrapes.join(', ') }}</span>
                </div>
              </div>

              <div class="flex items-start gap-3 text-sm">
                <commonIcon
                  name="lucide:users"
                  class="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400"
                />
                <div>
                  <span class="font-medium text-slate-700">
                    {{ t('wineStory.regions.producerCount', { count: region.producerCount || 0 }) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Terroir Description -->
            <p class="mt-4 text-sm leading-relaxed text-slate-600">
              {{ getLocalizedText(region.terroir) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WineRegion } from '~/types'

const { t, locale } = useI18n()
const { regions, loading, error, selectedRegion, fetchRegions, selectRegion: selectRegionComposable } = useWineRegions()

// Fetch regions on mount
onMounted(() => {
  fetchRegions()
})

// Local state
const hoveredRegion = ref<WineRegion | null>(null)

// Get localized text
const getLocalizedText = (translations: any): string => {
  if (!translations) return ''
  const localeCode = locale?.value || 'es'
  return translations[localeCode] || translations.en || Object.values(translations)[0] || ''
}

// Computed: displayed regions (filtered or all)
const displayedRegions = computed(() => {
  if (selectedRegion.value) {
    return regions.value.filter(r => r.id === selectedRegion.value)
  }
  return regions.value
})

// Region colors
const regionColors: Record<WineRegion, string> = {
  'codru': '#8B5CF6',
  'stefan-voda': '#EF4444',
  'valul-lui-traian': '#10B981',
}

const getRegionColor = (regionId: WineRegion): string => {
  return regionColors[regionId] || '#64748b'
}

// SVG path data for each region (simplified Moldova map)
const regionPaths: Record<WineRegion, string> = {
  'codru': 'M 28.2 47.5 L 28.8 47.5 L 29.0 47.2 L 29.2 46.8 L 28.9 46.5 L 28.3 46.6 L 27.9 46.9 L 27.8 47.2 Z',
  'stefan-voda': 'M 29.2 46.8 L 29.8 46.7 L 30.1 46.4 L 30.0 46.0 L 29.5 45.8 L 28.9 45.9 L 28.7 46.2 L 28.9 46.5 Z',
  'valul-lui-traian': 'M 28.3 46.6 L 28.9 46.5 L 28.7 46.2 L 28.9 45.9 L 28.5 45.7 L 28.0 45.8 L 27.6 46.0 L 27.5 46.3 L 27.8 46.5 Z',
}

const getRegionPath = (regionId: WineRegion): string => {
  return regionPaths[regionId] || ''
}

// Region center points for labels
const regionCenters: Record<WineRegion, { x: number, y: number }> = {
  'codru': { x: 28.5, y: 47.0 },
  'stefan-voda': { x: 29.4, y: 46.3 },
  'valul-lui-traian': { x: 28.2, y: 46.1 },
}

const getRegionCenter = (regionId: WineRegion): { x: number, y: number } => {
  return regionCenters[regionId] || { x: 28.5, y: 46.5 }
}

// Select region
const selectRegion = (regionId: WineRegion) => {
  if (selectedRegion.value === regionId) {
    clearSelection()
  }
  else {
    selectRegionComposable(regionId)
  }
}

// Clear selection
const clearSelection = () => {
  selectRegionComposable(null)
}
</script>

<style scoped>
/* Ensure smooth transitions */
path {
  transition: all 0.3s ease;
}

/* Focus styles for accessibility */
g:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

g:focus path {
  stroke: #1e293b;
  stroke-width: 0.03;
}
</style>
