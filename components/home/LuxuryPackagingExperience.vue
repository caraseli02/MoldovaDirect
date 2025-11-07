<template>
  <section class="luxury-section bg-white">
    <div class="luxury-container">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-20">
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          class="luxury-eyebrow"
        >
          {{ $t('luxury.packaging.eyebrow') || 'The Complete Experience' }}
        </p>

        <h2
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 100 } }"
          class="luxury-title"
        >
          {{ $t('luxury.packaging.title') || 'Presentation as Exquisite as the Products' }}
        </h2>

        <div class="luxury-divider mx-auto" />

        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 200 } }"
          class="luxury-description mx-auto"
        >
          {{ $t('luxury.packaging.description') || 'Every hamper is a work of art, thoughtfully curated and beautifully presented to create an unforgettable gift experience.' }}
        </p>
      </div>

      <!-- Two-Column Layout -->
      <div class="grid lg:grid-cols-2 gap-16 items-center mb-20">
        <!-- Left: Main Packaging Image -->
        <div
          v-motion
          :initial="{ opacity: 0, x: -40 }"
          :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
          class="relative group"
        >
          <div class="relative overflow-hidden rounded-sm shadow-2xl">
            <NuxtImg
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=1000&fit=crop"
              alt="Luxury gift hamper packaging"
              class="w-full h-[600px] object-cover transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-luxury-dark-chocolate/20 to-transparent" />
          </div>

          <!-- Floating Badge -->
          <div class="absolute top-8 right-8 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <p class="text-sm font-semibold text-luxury-wine-red uppercase tracking-wider">
              {{ $t('luxury.packaging.badge') || 'Hand Curated' }}
            </p>
          </div>
        </div>

        <!-- Right: Features List -->
        <div
          v-motion
          :initial="{ opacity: 0, x: 40 }"
          :visible="{ opacity: 1, x: 0, transition: { duration: 800, delay: 200 } }"
          class="space-y-8"
        >
          <!-- Feature 1 -->
          <div class="flex items-start space-x-6">
            <div class="flex-shrink-0 w-16 h-16 bg-luxury-cream rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-serif font-semibold text-luxury-wine-red mb-2">
                {{ $t('luxury.packaging.feature1_title') || 'Premium Wooden Boxes' }}
              </h3>
              <p class="text-luxury-brown/80 leading-relaxed">
                {{ $t('luxury.packaging.feature1_desc') || 'Each hamper arrives in a handcrafted wooden box with custom engravings, perfect for keepsake storage.' }}
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="flex items-start space-x-6">
            <div class="flex-shrink-0 w-16 h-16 bg-luxury-cream rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-serif font-semibold text-luxury-wine-red mb-2">
                {{ $t('luxury.packaging.feature2_title') || 'Tasting Notes & Story Cards' }}
              </h3>
              <p class="text-luxury-brown/80 leading-relaxed">
                {{ $t('luxury.packaging.feature2_desc') || 'Discover the heritage behind each product with beautifully illustrated story cards and tasting guides.' }}
              </p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="flex items-start space-x-6">
            <div class="flex-shrink-0 w-16 h-16 bg-luxury-cream rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-serif font-semibold text-luxury-wine-red mb-2">
                {{ $t('luxury.packaging.feature3_title') || 'Sustainable Elegance' }}
              </h3>
              <p class="text-luxury-brown/80 leading-relaxed">
                {{ $t('luxury.packaging.feature3_desc') || 'Eco-friendly materials meet luxury design. All packaging is recyclable or reusable, with zero plastic.' }}
              </p>
            </div>
          </div>

          <!-- CTA Button -->
          <div class="pt-6">
            <NuxtLink
              to="/products?filter=hampers"
              class="luxury-btn luxury-btn-dark inline-flex items-center space-x-3"
            >
              <span>{{ $t('luxury.packaging.cta') || 'Explore Gift Hampers' }}</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Bottom: Unboxing Gallery -->
      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="(image, index) in unboxingImages"
          :key="index"
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: index * 100 + 400, duration: 600 } }"
          class="relative overflow-hidden rounded-sm shadow-lg group"
        >
          <NuxtImg
            :src="image.src"
            :alt="image.alt"
            class="w-full h-72 object-cover transform transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-luxury-black/0 group-hover:bg-luxury-black/20 transition-colors duration-500" />
          <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-luxury-black/80 to-transparent">
            <p class="text-white text-sm font-medium uppercase tracking-wider">
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
