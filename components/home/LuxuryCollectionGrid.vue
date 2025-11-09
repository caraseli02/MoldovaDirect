<template>
  <section class="py-16 md:py-24">
    <div class="container mx-auto px-4 md:px-6">
      <!-- Section Header -->
      <div class="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <p class="text-xs uppercase tracking-[0.2em] font-medium text-[var(--brand-accent)] mb-4">
          Explore by Category
        </p>

        <h2 class="text-4xl md:text-5xl font-serif font-medium text-[var(--brand-dark)] mb-6">
          Our Collections
        </h2>

        <p class="text-base text-[var(--brand-dark)]/70 leading-relaxed">
          Discover curated collections of Moldova's finest products, carefully organized by category.
        </p>
      </div>

      <!-- Collection Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <NuxtLink
          v-for="collection in collections"
          :key="collection.id"
          :to="collection.link"
          class="group relative overflow-hidden aspect-[4/5] rounded-sm"
        >
          <!-- Collection Image -->
          <NuxtImg
            :src="collection.image"
            :alt="collection.name"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <!-- Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-[var(--brand-dark)]/90 via-[var(--brand-dark)]/40 to-transparent transition-opacity duration-300 group-hover:from-[var(--brand-dark)]/95">
          </div>

          <!-- Content -->
          <div class="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <h3 class="text-2xl md:text-3xl font-serif font-medium text-[var(--brand-light)] mb-2">
              {{ collection.name }}
            </h3>
            <p class="text-sm text-[var(--brand-light)]/80 mb-4">
              {{ collection.count }} products
            </p>
            <div class="flex items-center text-[var(--brand-light)] text-sm font-medium uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
              <span>Explore</span>
              <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const collections = [
  {
    id: 1,
    name: 'Premium Wines',
    count: 24,
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800',
    link: '/products?category=wine'
  },
  {
    id: 2,
    name: 'Gift Hampers',
    count: 12,
    image: 'https://images.unsplash.com/photo-1549888834-3ec93abae044?q=80&w=800',
    link: '/products?category=gifts'
  },
  {
    id: 3,
    name: 'Artisan Foods',
    count: 18,
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=800',
    link: '/products?category=gourmet'
  }
]
</script>

<style scoped>
/* Collection card hover effects */
</style>
