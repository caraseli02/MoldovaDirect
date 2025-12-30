<template>
  <section class="wine-regions-section">
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
        class="section-header"
      >
        <div class="section-badge">
          <span class="badge-line"></span>
          <commonIcon
            name="lucide:map"
            class="badge-icon"
          />
          <span>{{ t('wineStory.regions.badge', 'Wine Regions') }}</span>
          <span class="badge-line"></span>
        </div>

        <h2 class="section-title">
          {{ t('wineStory.regions.title') }}
        </h2>
        <p class="section-subtitle">
          {{ t('wineStory.regions.subtitle') }}
        </p>
      </div>

      <!-- Map and Region Cards -->
      <div class="regions-layout">
        <!-- Interactive SVG Map -->
        <div
          v-motion
          :initial="{ opacity: 0, x: -40 }"
          :visible="{
            opacity: 1,
            x: 0,
            transition: { duration: 600, delay: 200 },
          }"
          class="map-column"
        >
          <div class="map-card">
            <!-- Loading State -->
            <div
              v-if="loading"
              class="map-loading"
            >
              <commonIcon
                name="lucide:loader-2"
                class="loading-icon"
              />
            </div>

            <!-- Error State -->
            <div
              v-else-if="error"
              class="map-error"
            >
              <commonIcon
                name="lucide:alert-circle"
                class="error-icon"
              />
              <p class="error-text">
                {{ t('wineStory.regions.error') }}
              </p>
            </div>

            <!-- SVG Map -->
            <svg
              v-else
              viewBox="26 45 5 3"
              class="region-map"
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
                class="region-group"
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
                  :stroke="selectedRegion === region.id ? 'var(--md-charcoal)' : 'rgba(10, 10, 10, 0.3)'"
                  :stroke-width="selectedRegion === region.id ? 0.02 : 0.01"
                  :opacity="selectedRegion && selectedRegion !== region.id ? 0.3 : 1"
                  class="region-path"
                />

                <!-- Region Label -->
                <text
                  :x="getRegionCenter(region.id).x"
                  :y="getRegionCenter(region.id).y"
                  text-anchor="middle"
                  class="region-label"
                  style="paint-order: stroke; stroke: rgba(0,0,0,0.5); stroke-width: 0.01px;"
                >
                  {{ getLocalizedText(region.name) }}
                </text>
              </g>
            </svg>

            <!-- Legend -->
            <div class="map-legend">
              <button
                v-for="region in regions"
                :key="`legend-${region.id}`"
                class="legend-button"
                :class="{ active: selectedRegion === region.id }"
                @click="selectRegion(region.id)"
              >
                <span
                  class="legend-color"
                  :style="{ backgroundColor: getRegionColor(region.id) }"
                ></span>
                {{ getLocalizedText(region.name) }}
              </button>

              <button
                v-if="selectedRegion"
                class="legend-clear"
                @click="clearSelection"
              >
                <commonIcon
                  name="lucide:x"
                  class="clear-icon"
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
          class="cards-column"
        >
          <div
            v-for="region in displayedRegions"
            :key="region.id"
            class="region-card"
            :class="{ selected: selectedRegion === region.id }"
          >
            <!-- Region Header -->
            <div class="card-header">
              <div class="header-content">
                <h3 class="card-title">
                  {{ getLocalizedText(region.name) }}
                </h3>
                <p class="card-description">
                  {{ getLocalizedText(region.description) }}
                </p>
              </div>
              <span
                class="color-badge"
                :style="{ backgroundColor: getRegionColor(region.id) }"
              ></span>
            </div>

            <!-- Characteristics -->
            <div class="card-characteristics">
              <div class="characteristic-item">
                <commonIcon
                  name="lucide:layers"
                  class="char-icon"
                />
                <div class="char-content">
                  <span class="char-label">{{ t('wineStory.regions.soilType') }}:</span>
                  <span class="char-value">{{ getLocalizedText(region.characteristics.soilType) }}</span>
                </div>
              </div>

              <div class="characteristic-item">
                <commonIcon
                  name="lucide:thermometer"
                  class="char-icon"
                />
                <div class="char-content">
                  <span class="char-label">{{ t('wineStory.regions.climate') }}:</span>
                  <span class="char-value">{{ getLocalizedText(region.climate) }}</span>
                </div>
              </div>

              <div class="characteristic-item">
                <commonIcon
                  name="lucide:grape"
                  class="char-icon"
                />
                <div class="char-content">
                  <span class="char-label">{{ t('wineStory.regions.primaryGrapes') }}:</span>
                  <span class="char-value">{{ region.primaryGrapes.join(', ') }}</span>
                </div>
              </div>

              <div class="characteristic-item">
                <commonIcon
                  name="lucide:users"
                  class="char-icon"
                />
                <div class="char-content">
                  <span class="char-label">
                    {{ t('wineStory.regions.producerCount', { count: region.producerCount || 0 }) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Terroir Description -->
            <p class="card-terroir">
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
const getLocalizedText = (translations: Record<string, any>): string => {
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

// Region colors - luxury palette
const regionColors: Record<WineRegion, string> = {
  'codru': '#8B2E3B', // Wine color
  'stefan-voda': '#C9A227', // Gold color
  'valul-lui-traian': '#6B7280', // Neutral gray
}

const getRegionColor = (regionId: WineRegion): string => {
  return regionColors[regionId] || 'rgba(10, 10, 10, 0.3)'
}

// SVG path data for each region
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
/* ===== SECTION ===== */
.wine-regions-section {
  position: relative;
  padding: 6rem 0;
  background: #fff;
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ===== SECTION HEADER ===== */
.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(201, 162, 39, 0.1);
  border: 1px solid rgba(201, 162, 39, 0.2);
  border-radius: var(--md-radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--md-gold);
  margin-bottom: 2rem;
}

.badge-line {
  width: 24px;
  height: 1px;
  background: var(--md-gradient-gold-line);
}

.badge-icon {
  width: 18px;
  height: 18px;
  color: var(--md-gold);
}

.section-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.section-subtitle {
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  line-height: 1.6;
  color: rgba(10, 10, 10, 0.7);
}

/* ===== LAYOUT ===== */
.regions-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .regions-layout {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
}

/* ===== MAP COLUMN ===== */
.map-column {
  position: relative;
}

@media (min-width: 1024px) {
  .map-column {
    position: sticky;
    top: 6rem;
  }
}

.map-card {
  background: var(--md-cream);
  border: 1px solid rgba(10, 10, 10, 0.08);
  border-radius: var(--md-radius-2xl);
  padding: 2.5rem;
  box-shadow: var(--md-shadow-lg);
}

/* ===== MAP STATES ===== */
.map-loading,
.map-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-icon {
  width: 32px;
  height: 32px;
  color: var(--md-gold);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #dc2626;
}

.error-text {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #b91c1c;
}

/* ===== SVG MAP ===== */
.region-map {
  width: 100%;
  height: auto;
}

.region-group {
  cursor: pointer;
  transition: all 0.3s ease;
}

.region-group:focus {
  outline: none;
}

.region-group:focus .region-path {
  stroke: var(--md-charcoal);
  stroke-width: 0.03;
}

.region-path {
  transition: all 0.3s ease;
}

.region-label {
  fill: #fff;
  font-size: 0.15px;
  font-weight: 600;
  pointer-events: none;
}

/* ===== MAP LEGEND ===== */
.map-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

.legend-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #fff;
  border: 1px solid rgba(10, 10, 10, 0.1);
  border-radius: var(--md-radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--md-charcoal);
  cursor: pointer;
  transition: all 0.3s ease;
}

.legend-button:hover {
  border-color: var(--md-gold);
  box-shadow: var(--md-shadow-md);
  transform: translateY(-2px);
}

.legend-button.active {
  background: var(--md-gold);
  border-color: var(--md-gold);
  color: #fff;
  box-shadow: var(--md-shadow-gold-lg);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.legend-clear {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(10, 10, 10, 0.05);
  border: 1px solid rgba(10, 10, 10, 0.1);
  border-radius: var(--md-radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(10, 10, 10, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.legend-clear:hover {
  background: rgba(10, 10, 10, 0.08);
  color: var(--md-charcoal);
}

.clear-icon {
  width: 14px;
  height: 14px;
}

/* ===== CARDS COLUMN ===== */
.cards-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.region-card {
  background: #fff;
  border: 1px solid rgba(10, 10, 10, 0.08);
  border-radius: var(--md-radius-2xl);
  padding: 2rem;
  box-shadow: var(--md-shadow-sm);
  transition: all 0.3s ease;
}

.region-card:hover {
  box-shadow: var(--md-shadow-lg);
  transform: translateY(-4px);
}

.region-card.selected {
  border-color: var(--md-gold);
  box-shadow: var(--md-shadow-gold-lg);
}

/* ===== CARD HEADER ===== */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(10, 10, 10, 0.08);
}

.header-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-family: var(--md-font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--md-charcoal);
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.9375rem;
  color: rgba(10, 10, 10, 0.6);
  line-height: 1.5;
}

.color-badge {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(10, 10, 10, 0.1);
}

/* ===== CHARACTERISTICS ===== */
.card-characteristics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 0;
}

.characteristic-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.char-icon {
  width: 18px;
  height: 18px;
  color: var(--md-gold);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.char-content {
  flex: 1;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.char-label {
  font-weight: 500;
  color: var(--md-charcoal);
}

.char-value {
  margin-left: 0.25rem;
  color: rgba(10, 10, 10, 0.7);
}

/* ===== TERROIR ===== */
.card-terroir {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(10, 10, 10, 0.08);
  font-size: 0.9375rem;
  line-height: 1.75;
  color: rgba(10, 10, 10, 0.7);
}

/* ===== RESPONSIVE ===== */
@media (min-width: 768px) {
  .wine-regions-section {
    padding: 8rem 0;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 1rem;
  }

  .map-card {
    padding: 1.5rem;
  }

  .region-card {
    padding: 1.5rem;
  }

  .map-legend {
    gap: 0.5rem;
  }

  .legend-button,
  .legend-clear {
    font-size: 0.8125rem;
    padding: 0.5rem 1rem;
  }
}
</style>
