<template>
  <section class="pairing-guides-section">
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
            name="lucide:utensils"
            class="badge-icon"
          />
          <span>{{ t('wineStory.pairings.badge', 'Pairings') }}</span>
          <span class="badge-line"></span>
        </div>

        <h2 class="section-title">
          {{ t('wineStory.pairings.title') }}
        </h2>
        <p class="section-subtitle">
          {{ t('wineStory.pairings.subtitle') }}
        </p>
      </div>

      <!-- Filter Tabs -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 500, delay: 100 },
        }"
        class="filter-section"
      >
        <!-- Desktop Filters -->
        <div class="filter-desktop">
          <div class="filter-group">
            <button
              class="filter-button"
              :class="{ active: activeFilter === 'all' }"
              @click="setFilter('all')"
            >
              {{ t('wineStory.pairings.filters.all') }}
            </button>

            <button
              v-for="type in wineTypes"
              :key="type"
              class="filter-button"
              :class="{ active: activeFilter === type }"
              @click="setFilter(type)"
            >
              {{ t(`wineStory.pairings.wineTypes.${type}`) }}
            </button>
          </div>
        </div>

        <!-- Mobile Filters -->
        <div class="filter-mobile">
          <button
            class="filter-button-mobile"
            :class="{ active: activeFilter === 'all' }"
            @click="setFilter('all')"
          >
            {{ t('wineStory.pairings.filters.all') }}
          </button>

          <button
            v-for="type in wineTypes"
            :key="type"
            class="filter-button-mobile"
            :class="{ active: activeFilter === type }"
            @click="setFilter(type)"
          >
            {{ t(`wineStory.pairings.wineTypes.${type}`) }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="loading-grid"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="loading-card"
        ></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="error-state"
      >
        <commonIcon
          name="lucide:alert-circle"
          class="error-icon"
        />
        <p class="error-title">
          {{ t('wineStory.pairings.error') }}
        </p>
        <p class="error-message">
          {{ error }}
        </p>
      </div>

      <!-- Pairing Cards Grid -->
      <div
        v-else-if="displayedPairings.length > 0"
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600, delay: 200 },
        }"
        class="pairings-grid"
      >
        <PairingCard
          v-for="pairing in displayedPairings"
          :key="pairing.id"
          :pairing="pairing as PairingGuide"
          @click="openPairingModal"
        />
      </div>

      <!-- No Results State -->
      <div
        v-else
        class="empty-state"
      >
        <commonIcon
          name="lucide:wine"
          class="empty-icon"
        />
        <p class="empty-text">
          {{ t('wineStory.pairings.noResults') }}
        </p>
        <button
          class="empty-button"
          @click="clearFilters"
        >
          {{ t('wineStory.pairings.filters.all') }}
          <commonIcon
            name="lucide:x"
            class="empty-button-icon"
          />
        </button>
      </div>

      <!-- View All Button -->
      <div
        v-if="!loading && displayedPairings.length > 0"
        class="view-all-section"
      >
        <NuxtLink
          :to="localePath('/pairings')"
          class="btn-view-all"
        >
          {{ t('common.showMore') }}
          <commonIcon
            name="lucide:arrow-right"
            class="btn-icon"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PairingGuide } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()

// Pairing data
const { pairings, loading, error, fetchPairings, applyFilters, clearFilters: clearFiltersComposable } = usePairingGuides()

// Local state
const activeFilter = ref<string>('all')
const isModalOpen = ref(false)
const selectedPairing = ref<PairingGuide | null>(null)

// Wine types for filtering
const wineTypes = ['red', 'white', 'rose', 'sparkling', 'dessert']

// Fetch pairings on mount
onMounted(async () => {
  await fetchPairings()
})

// Computed: filtered pairings
const displayedPairings = computed(() => {
  if (activeFilter.value === 'all') {
    return pairings.value.filter(p => p.isActive && p.isFeatured)
  }
  return pairings.value.filter(p =>
    p.isActive && p.isFeatured && p.wineType === activeFilter.value,
  )
})

// Set filter
const setFilter = (filter: string) => {
  activeFilter.value = filter

  if (filter === 'all') {
    clearFiltersComposable()
  }
  else {
    applyFilters({
      wineType: [filter as 'red' | 'white' | 'rose' | 'sparkling' | 'dessert'],
    })
  }
}

// Clear filters
const clearFilters = () => {
  activeFilter.value = 'all'
  clearFiltersComposable()
}

// Open pairing modal
const openPairingModal = (pairing: PairingGuide) => {
  selectedPairing.value = pairing
  isModalOpen.value = true
}
</script>

<style scoped>
/* ===== SECTION ===== */
.pairing-guides-section {
  position: relative;
  padding: 6rem 0;
  background: linear-gradient(to bottom, var(--md-cream) 0%, #fff 100%);
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
  margin: 0 auto 3rem;
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
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.section-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
  color: rgba(10, 10, 10, 0.7);
}

/* ===== FILTERS ===== */
.filter-section {
  margin-bottom: 3rem;
}

.filter-desktop {
  display: none;
}

.filter-group {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid rgba(10, 10, 10, 0.08);
  border-radius: var(--md-radius-full);
  box-shadow: var(--md-shadow-lg);
}

.filter-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: var(--md-radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(10, 10, 10, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button:hover {
  background: rgba(10, 10, 10, 0.05);
  color: var(--md-charcoal);
}

.filter-button.active {
  background: var(--md-gold);
  color: #fff;
  box-shadow: var(--md-shadow-md);
}

/* Mobile Filters */
.filter-mobile {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0 0 1rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-mobile::-webkit-scrollbar {
  display: none;
}

.filter-button-mobile {
  flex-shrink: 0;
  padding: 0.75rem 1.5rem;
  background: #fff;
  border: 1px solid rgba(10, 10, 10, 0.1);
  border-radius: var(--md-radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(10, 10, 10, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--md-shadow-sm);
}

.filter-button-mobile.active {
  background: var(--md-gold);
  border-color: var(--md-gold);
  color: #fff;
  box-shadow: var(--md-shadow-md);
}

/* ===== LOADING STATE ===== */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.loading-card {
  height: 400px;
  background: linear-gradient(90deg, rgba(10, 10, 10, 0.05) 0%, rgba(10, 10, 10, 0.1) 50%, rgba(10, 10, 10, 0.05) 100%);
  background-size: 200% 100%;
  border-radius: var(--md-radius-2xl);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== ERROR STATE ===== */
.error-state {
  padding: 3rem;
  text-align: center;
  background: rgba(220, 38, 38, 0.05);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--md-radius-2xl);
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #dc2626;
  margin: 0 auto;
}

.error-title {
  margin-top: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #991b1b;
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #b91c1c;
}

/* ===== PAIRINGS GRID ===== */
.pairings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(10, 10, 10, 0.03);
  border-radius: var(--md-radius-2xl);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: rgba(10, 10, 10, 0.2);
  margin: 0 auto;
}

.empty-text {
  margin-top: 1.5rem;
  font-size: 1.125rem;
  font-weight: 500;
  color: rgba(10, 10, 10, 0.5);
}

.empty-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--md-gold);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: var(--md-radius-full);
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-button:hover {
  box-shadow: var(--md-shadow-gold-lg);
  transform: translateY(-2px);
}

.empty-button-icon {
  width: 16px;
  height: 16px;
}

/* ===== VIEW ALL SECTION ===== */
.view-all-section {
  margin-top: 3rem;
  text-align: center;
}

.btn-view-all {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--md-charcoal);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--md-radius-full);
  box-shadow: var(--md-shadow-lg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-view-all::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-gradient-gold);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-view-all:hover::before {
  opacity: 1;
}

.btn-view-all:hover {
  box-shadow: var(--md-shadow-gold-lg);
  transform: translateY(-3px);
}

.btn-view-all > * {
  position: relative;
  z-index: 1;
}

.btn-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.btn-view-all:hover .btn-icon {
  transform: translateX(4px);
}

/* ===== RESPONSIVE ===== */
@media (min-width: 768px) {
  .pairing-guides-section {
    padding: 8rem 0;
  }

  .filter-desktop {
    display: flex;
    justify-content: center;
  }

  .filter-mobile {
    display: none;
  }

  .pairings-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 1rem;
  }

  .section-header {
    margin-bottom: 2rem;
  }
}
</style>
