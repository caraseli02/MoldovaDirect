<template>
  <section class="luxury-section bg-white">
    <div class="luxury-container">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-20 px-4">
        <p class="luxury-eyebrow text-sm md:text-base">
          {{ $t('luxury.packaging.eyebrow') || 'The Complete Experience' }}
        </p>

        <h2 class="luxury-title text-2xl md:text-3xl lg:text-4xl">
          {{ $t('luxury.packaging.title') || 'Presentation as Exquisite as the Products' }}
        </h2>

        <div class="luxury-divider mx-auto" />

        <p class="luxury-description mx-auto text-sm md:text-base">
          {{ $t('luxury.packaging.description') || 'Every hamper is a work of art, thoughtfully curated and beautifully presented to create an unforgettable gift experience.' }}
        </p>
      </div>

      <!-- Two-Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-16 items-center mb-8 md:mb-12 lg:mb-20">
        <!-- Left: Main Packaging Image -->
        <div class="relative group px-4 lg:px-0">
          <div class="relative overflow-hidden rounded-sm shadow-lg md:shadow-2xl">
            <NuxtImg
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=1000&fit=crop"
              alt="Luxury gift hamper packaging"
              class="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-luxury-dark-chocolate/20 to-transparent" />
          </div>

          <!-- Floating Badge -->
          <div class="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-8 md:right-8 bg-white/95 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full shadow-lg">
            <p class="text-xs md:text-sm font-semibold text-luxury-wine-red uppercase tracking-wider">
              {{ $t('luxury.packaging.badge') || 'Hand Curated' }}
            </p>
          </div>
        </div>

        <!-- Right: Features List -->
        <div class="space-y-4 md:space-y-6 lg:space-y-8 px-4 lg:px-0">
          <!-- Feature 1 -->
          <div class="flex items-start space-x-3 sm:space-x-4 md:space-x-6">
            <div class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-luxury-cream rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 class="text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-semibold text-luxury-wine-red mb-1 md:mb-2">
                {{ $t('luxury.packaging.feature1_title') || 'Premium Wooden Boxes' }}
              </h3>
              <p class="text-luxury-brown/80 leading-relaxed text-sm md:text-base">
                {{ $t('luxury.packaging.feature1_desc') || 'Each hamper arrives in a handcrafted wooden box with custom engravings, perfect for keepsake storage.' }}
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="flex items-start space-x-3 sm:space-x-4 md:space-x-6">
            <div class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-luxury-cream rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-semibold text-luxury-wine-red mb-1 md:mb-2">
                {{ $t('luxury.packaging.feature2_title') || 'Tasting Notes & Story Cards' }}
              </h3>
              <p class="text-luxury-brown/80 leading-relaxed text-sm md:text-base">
                {{ $t('luxury.packaging.feature2_desc') || 'Discover the heritage behind each product with beautifully illustrated story cards and tasting guides.' }}
              </p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="flex items-start space-x-3 sm:space-x-4 md:space-x-6">
            <div class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-luxury-cream rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-semibold text-luxury-wine-red mb-1 md:mb-2">
                {{ $t('luxury.packaging.feature3_title') || 'Sustainable Elegance' }}
              </h3>
              <p class="text-luxury-brown/80 leading-relaxed text-sm md:text-base">
                {{ $t('luxury.packaging.feature3_desc') || 'Eco-friendly materials meet luxury design. All packaging is recyclable or reusable, with zero plastic.' }}
              </p>
            </div>
          </div>

          <!-- CTA Button -->
          <div class="pt-2 sm:pt-4 md:pt-6">
            <NuxtLink
              to="/products?filter=hampers"
              class="luxury-btn luxury-btn-dark inline-flex items-center justify-center space-x-2 sm:space-x-3 w-full sm:w-auto min-h-[48px] text-sm md:text-base"
            >
              <span>{{ $t('luxury.packaging.cta') || 'Explore Gift Hampers' }}</span>
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Bottom: Unboxing Gallery -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-4 lg:px-0">
        <div
          v-for="(image, index) in unboxingImages"
          :key="index"
          class="relative overflow-hidden rounded-sm shadow-md md:shadow-lg group"
        >
          <NuxtImg
            :src="image.src"
            :alt="image.alt"
            class="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-luxury-black/10 md:bg-luxury-black/0 md:group-hover:bg-luxury-black/20 transition-colors duration-300" />
          <div class="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 bg-gradient-to-t from-luxury-black/80 to-transparent">
            <p class="text-white text-xs sm:text-sm font-medium uppercase tracking-wider">
              {{ image.label }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Mock unboxing gallery images
const unboxingImages = [
  {
    src: 'https://images.unsplash.com/photo-1514499555179-7e6c4d25a103?w=600&h=400&fit=crop',
    alt: 'Artisan wine bottles',
    label: 'Premium Selection',
  },
  {
    src: 'https://images.unsplash.com/photo-1558818498-28c1e002b655?w=600&h=400&fit=crop',
    alt: 'Handwritten tasting notes',
    label: 'Story Cards',
  },
  {
    src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop',
    alt: 'Sustainable packaging',
    label: 'Eco Materials',
  },
]
</script>

<style scoped>
/* Luxury button styles inherited from global CSS */
</style>
