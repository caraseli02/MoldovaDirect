<template>
  <section class="relative overflow-hidden">
    <!-- Luxury gradient background matching landing page -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-500/70 to-indigo-500/70 dark:from-blue-900/80 dark:via-blue-800/70 dark:to-indigo-900/70"></div>
    <div class="absolute inset-x-0 -bottom-32 h-64 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)]"></div>

    <!-- Content -->
    <div class="relative z-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div class="mx-auto max-w-5xl text-white">
        <!-- Seasonal badge with luxury styling -->
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { delay: 200 },
          }"
          class="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-semibold uppercase tracking-wider backdrop-blur shadow-sm"
        >
          {{ seasonalBadge }}
        </div>

        <!-- Main title -->
        <h1
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 300 },
          }"
          class="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl"
        >
          {{ title }}
        </h1>

        <!-- Subtitle -->
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 400 },
          }"
          class="mt-4 max-w-2xl text-lg"
        >
          {{ subtitle }}
        </p>

        <!-- CTA and Discovery collections -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 500 },
          }"
          class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <UiButton
            type="button"
            class="rounded-full bg-white text-blue-600 shadow-lg shadow-blue-900/20 hover:bg-blue-50"
            @click="$emit('scroll-to-results')"
          >
            {{ ctaText }}
          </UiButton>

          <div v-if="collections.length" class="flex flex-wrap items-center gap-2">
            <UiButton
              v-for="collection in collections"
              :key="collection.id"
              type="button"
              variant="outline"
              class="rounded-full border-white/40 bg-white/10 backdrop-blur hover:bg-white/20"
              :class="{ 'bg-white text-blue-600 shadow-lg shadow-blue-900/10': activeCollectionId === collection.id }"
              @click="$emit('select-collection', collection)"
            >
              {{ collection.label }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductFilters } from '~/types'

interface DiscoveryCollection {
  id: string
  label: string
  filters: ProductFilters
}

interface Props {
  seasonalBadge: string
  title: string
  subtitle: string
  ctaText: string
  collections?: DiscoveryCollection[]
  activeCollectionId?: string | null
}

withDefaults(defineProps<Props>(), {
  collections: () => [],
  activeCollectionId: null,
})

defineEmits<{
  'scroll-to-results': []
  'select-collection': [collection: DiscoveryCollection]
}>()
</script>
