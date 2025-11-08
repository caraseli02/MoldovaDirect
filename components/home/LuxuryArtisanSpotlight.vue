<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="container mx-auto px-4 md:px-6">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-16 px-4">
        <p class="text-xs uppercase tracking-[0.2em] font-medium text-[#722F37] text-sm md:text-base">
          {{ $t('luxury.artisans.eyebrow') || 'Meet The Makers' }}
        </p>

        <h2 class="font-serif text-2xl md:text-3xl lg:text-4xl font-medium text-[#241405] text-2xl md:text-3xl lg:text-4xl">
          {{ $t('luxury.artisans.title') || 'Artisan Producers' }}
        </h2>

        <div class="w-16 h-px bg-[#722F37] mx-auto" />

        <p class="text-base text-[#241405]/70 leading-relaxed mx-auto text-sm md:text-base">
          {{ $t('luxury.artisans.description') || 'Each product in our collection comes from a carefully selected family estate, where tradition and innovation blend to create exceptional quality.' }}
        </p>
      </div>

      <!-- Mobile: Horizontal Carousel with Navigation -->
      <div class="md:hidden mb-8 relative">
        <div
          ref="artisanScrollContainer"
          class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-4 -mx-4 scrollbar-hide"
          @scroll="onArtisanScroll"
        >
          <div
            v-for="artisan in artisans"
            :key="artisan.id"
            class="flex-shrink-0 w-[85vw] max-w-[340px] snap-center"
          >
            <div class="border border-[#241405]/10 rounded-sm p-6 h-full">
              <!-- Portrait -->
              <div class="relative overflow-hidden mb-6 rounded-sm overflow-hidden">
                <NuxtImg
                  :src="artisan.image"
                  :alt="artisan.name"
                  class="w-full h-72 object-cover"
                  loading="lazy"
                  @error="handleImageError($event, 'portrait')"
                />
                <div class="absolute inset-0 bg-[#241405]/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>

              <!-- Content -->
              <div>
                <h3 class="font-serif text-xl font-semibold text-[#722F37] mb-2">
                  {{ artisan.name }}
                </h3>

                <p class="text-sm uppercase tracking-wider text-[#241405] mb-4 font-semibold">
                  {{ artisan.specialty }}
                </p>

                <p class="text-[#241405]/80 leading-relaxed mb-6 italic text-base">
                  "{{ artisan.quote }}"
                </p>

                <div class="flex items-center gap-3 text-sm text-[#241405]/60">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ artisan.location }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button
          v-if="artisanCurrentIndex > 0"
          @click="scrollArtisanCarousel('prev')"
          class="carousel-arrow carousel-arrow-left"
          aria-label="Previous artisan"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          v-if="artisanCurrentIndex < artisans.length - 1"
          @click="scrollArtisanCarousel('next')"
          class="carousel-arrow carousel-arrow-right"
          aria-label="Next artisan"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Dot Indicators -->
        <div class="flex justify-center gap-2 mt-6">
          <button
            v-for="(artisan, index) in artisans"
            :key="`dot-${artisan.id}`"
            @click="scrollArtisanToIndex(index)"
            class="carousel-dot"
            :class="{ active: artisanCurrentIndex === index }"
            :aria-label="`Go to artisan ${index + 1}`"
          />
        </div>
      </div>

      <!-- Desktop: Artisan Grid -->
      <div class="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 lg:px-0">
        <div
          v-for="(artisan, index) in artisans"
          :key="artisan.id"
          class="border border-[#241405]/10 rounded-sm p-6 group"
        >
          <!-- Portrait -->
          <div class="relative overflow-hidden mb-4 md:mb-6 rounded-sm overflow-hidden">
            <NuxtImg
              :src="artisan.image"
              :alt="artisan.name"
              class="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover"
              loading="lazy"
              @error="handleImageError($event, 'portrait')"
            />
            <div class="absolute inset-0 bg-[#241405]/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>

          <!-- Content -->
          <div>
            <h3 class="font-serif text-xl md:text-2xl font-semibold text-[#722F37] mb-2">
              {{ artisan.name }}
            </h3>

            <p class="text-xs sm:text-sm uppercase tracking-wider text-[#241405] mb-3 md:mb-4 font-semibold">
              {{ artisan.specialty }}
            </p>

            <p class="text-[#241405]/80 leading-relaxed mb-4 md:mb-6 italic text-sm md:text-base">
              "{{ artisan.quote }}"
            </p>

            <div class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#241405]/60">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span>{{ artisan.location }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center mt-8 md:mt-12 lg:mt-16 px-4">
        <NuxtLink to="/producers" class="bg-[#722F37] text-white px-8 py-3.5 text-sm font-medium uppercase tracking-wider hover:bg-[#8B3A47] transition-colors duration-300 bg-[#241405] text-[#FCFAF2] px-8 py-3.5 text-sm font-medium uppercase tracking-wider hover:bg-[#722F37] transition-colors duration-300 w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center text-sm md:text-base">
          {{ $t('luxury.artisans.cta') || 'Meet All Producers' }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { handleImageError } = useImageFallback()

// Artisan carousel state
const artisanScrollContainer = ref<HTMLElement | null>(null)
const artisanCurrentIndex = ref(0)

const onArtisanScroll = () => {
  if (!artisanScrollContainer.value) return

  const container = artisanScrollContainer.value
  const scrollLeft = container.scrollLeft
  const itemWidth = container.scrollWidth / artisans.length

  artisanCurrentIndex.value = Math.round(scrollLeft / itemWidth)
}

const scrollArtisanCarousel = (direction: 'prev' | 'next') => {
  if (!artisanScrollContainer.value) return

  const container = artisanScrollContainer.value
  const itemWidth = container.scrollWidth / artisans.length
  const newIndex = direction === 'next'
    ? Math.min(artisanCurrentIndex.value + 1, artisans.length - 1)
    : Math.max(artisanCurrentIndex.value - 1, 0)

  container.scrollTo({
    left: itemWidth * newIndex,
    behavior: 'smooth'
  })
}

const scrollArtisanToIndex = (index: number) => {
  if (!artisanScrollContainer.value) return

  const container = artisanScrollContainer.value
  const itemWidth = container.scrollWidth / artisans.length

  container.scrollTo({
    left: itemWidth * index,
    behavior: 'smooth'
  })
}

const artisans = [
  {
    id: 1,
    name: 'Ion Popescu',
    specialty: 'Master Winemaker',
    quote: 'Every grape tells a story of our land. We craft wines that speak of Moldova\'s soul.',
    location: 'Codru Wine Region',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800',
  },
  {
    id: 2,
    name: 'Elena Moldovan',
    specialty: 'Artisan Cheesemaker',
    quote: 'Our cheese-making traditions have been passed down for four generations. Each wheel is a labor of love.',
    location: 'Orheiul Vechi',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800',
  },
  {
    id: 3,
    name: 'Vasile Cojocaru',
    specialty: 'Honey Producer',
    quote: 'Our bees collect from wildflowers across the Moldovan countryside. Pure, natural, exceptional.',
    location: 'Cahul Region',
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=800',
  },
]
</script>

<style scoped>
.border border-[#241405]/10 rounded-sm p-6 {
  background: white;
  padding: 2rem;
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.border border-[#241405]/10 rounded-sm p-6:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(74, 28, 28, 0.15);
  border-color: #241405;
}

.border border-[#241405]/10 rounded-sm p-6::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, #241405, #722F37);
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.border border-[#241405]/10 rounded-sm p-6:hover::before {
  transform: scaleX(1);
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Carousel Navigation */
.carousel-arrow {
  position: absolute;
  top: 35%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(114, 47, 55, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #722F37;
  cursor: pointer;
  transition: all 0.25s ease;
  z-index: 10;
  opacity: 0.9;
}

.carousel-arrow:hover {
  background: rgba(114, 47, 55, 0.98);
  color: white;
  box-shadow: 0 4px 12px rgba(114, 47, 55, 0.25);
  opacity: 1;
  transform: translateY(-50%) scale(1.05);
}

.carousel-arrow:active {
  transform: translateY(-50%) scale(0.98);
}

.carousel-arrow-left {
  left: -24px;
}

.carousel-arrow-right {
  right: -24px;
}

/* Show arrows inside on mobile */
@media (max-width: 768px) {
  .carousel-arrow-left {
    left: 12px;
  }
  .carousel-arrow-right {
    right: 12px;
  }
}

.carousel-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: rgba(114, 47, 55, 0.25);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-dot.active {
  background-color: #722F37;
  width: 28px;
  border-radius: 3px;
  transform: scale(1);
}

.carousel-dot:hover:not(.active) {
  background-color: rgba(114, 47, 55, 0.5);
  transform: scale(1.3);
}
</style>
