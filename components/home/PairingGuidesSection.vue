<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
    <!-- Background Decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary blur-3xl"></div>
    </div>

    <div class="container relative">
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
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          {{ t('wineStory.pairings.title') }}
        </h2>
        <p class="mt-4 text-lg text-slate-600">
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
        class="mt-8 flex justify-center"
      >
        <div class="inline-flex flex-wrap justify-center gap-2 rounded-full bg-white p-1.5 shadow-lg">
          <button
            class="rounded-full px-6 py-2.5 text-sm font-semibold transition-all"
            :class="[
              activeFilter === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            ]"
            @click="setFilter('all')"
          >
            {{ t('wineStory.pairings.filters.all') }}
          </button>

          <button
            v-for="type in wineTypes"
            :key="type"
            class="rounded-full px-6 py-2.5 text-sm font-semibold transition-all"
            :class="[
              activeFilter === type
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            ]"
            @click="setFilter(type)"
          >
            {{ t(`wineStory.pairings.wineTypes.${type}`) }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-[500px] animate-pulse rounded-2xl bg-slate-200"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mt-12 rounded-lg bg-red-50 p-6 text-center">
        <commonIcon name="lucide:alert-circle" class="mx-auto h-12 w-12 text-red-500" />
        <p class="mt-2 text-lg font-medium text-red-900">{{ t('wineStory.pairings.error') }}</p>
        <p class="mt-1 text-sm text-red-700">{{ error }}</p>
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
        class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <PairingCard
          v-for="pairing in displayedPairings"
          :key="pairing.id"
          :pairing="pairing"
          @click="openPairingModal"
        />
      </div>

      <!-- No Results State -->
      <div v-else class="mt-12 rounded-lg bg-slate-100 p-12 text-center">
        <commonIcon name="lucide:wine" class="mx-auto h-16 w-16 text-slate-400" />
        <p class="mt-4 text-lg font-medium text-slate-600">{{ t('wineStory.pairings.noResults') }}</p>
        <button
          class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90"
          @click="clearFilters"
        >
          {{ t('wineStory.pairings.filters.all') }}
          <commonIcon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>

      <!-- View All Button -->
      <div
        v-if="!loading && displayedPairings.length > 0"
        class="mt-8 text-center"
      >
        <NuxtLink
          :to="localePath('/pairings')"
          class="cta-button inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary/90"
        >
          {{ t('common.showMore') }}
          <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
        </NuxtLink>
      </div>
    </div>

    <!-- Pairing Detail Modal (Placeholder for future implementation) -->
    <!-- <PairingDetailModal v-model:open="isModalOpen" :pairing="selectedPairing" /> -->
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
    p.isActive && p.isFeatured && p.wineType === activeFilter.value
  )
})

// Set filter
const setFilter = (filter: string) => {
  activeFilter.value = filter

  if (filter === 'all') {
    clearFiltersComposable()
  } else {
    applyFilters({
      wineType: [filter as any]
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
  // Modal component to be implemented in future
  console.log('Opening pairing:', pairing.slug)
}
</script>

<style scoped>
/* Ensure smooth transitions */
button {
  transition: all 0.2s ease;
}

/* Focus styles for accessibility */
button:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--color-primary), 0 0 0 4px white;
}
</style>
