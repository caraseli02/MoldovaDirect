<template>
  <section class="luxury-section bg-luxury-warm-white">
    <div class="luxury-container">
      <div class="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        <!-- Text Content -->
        <div class="px-4 lg:px-0">
          <p class="luxury-eyebrow text-sm md:text-base">
            {{ $t('luxury.origin.eyebrow') || 'Our Heritage' }}
          </p>

          <h2 class="luxury-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            {{ $t('luxury.origin.title') || 'A Legacy of Craftsmanship' }}
          </h2>

          <div class="luxury-divider" />

          <div class="luxury-description space-y-3 sm:space-y-4 text-sm md:text-base">
            <p>
              {{ $t('luxury.origin.p1') || 'For centuries, Moldovan winemakers have perfected the art of viticulture in soil blessed by nature. Each bottle tells a story of tradition, passion, and uncompromising quality.' }}
            </p>

            <p>
              {{ $t('luxury.origin.p2') || 'We partner with family-owned estates that have passed down their expertise through generations, ensuring every product reflects the authentic taste of Moldova.' }}
            </p>

            <p>
              {{ $t('luxury.origin.p3') || 'From the rolling hills of Codru to the limestone caves of Cricova, we bring you the finest selection of wines and gourmet delicacies, carefully curated for the Spanish market.' }}
            </p>
          </div>

          <div class="mt-6 sm:mt-8 flex flex-wrap gap-4 sm:gap-6">
            <div>
              <div class="text-2xl sm:text-3xl md:text-4xl font-serif text-luxury-wine-red font-bold">75+</div>
              <div class="text-xs sm:text-sm text-luxury-brown/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat1') || 'Years Heritage' }}
              </div>
            </div>

            <div class="border-l border-luxury-black/30 pl-4 sm:pl-6">
              <div class="text-2xl sm:text-3xl md:text-4xl font-serif text-luxury-wine-red font-bold">15+</div>
              <div class="text-xs sm:text-sm text-luxury-brown/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat2') || 'Artisan Partners' }}
              </div>
            </div>

            <div class="border-l border-luxury-black/30 pl-4 sm:pl-6">
              <div class="text-2xl sm:text-3xl md:text-4xl font-serif text-luxury-wine-red font-bold">100%</div>
              <div class="text-xs sm:text-sm text-luxury-brown/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat3') || 'Authentic' }}
              </div>
            </div>
          </div>

          <div class="mt-6 sm:mt-8 md:mt-10">
            <NuxtLink to="/about" class="luxury-btn luxury-btn-dark w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center text-sm md:text-base">
              {{ $t('luxury.origin.cta') || 'Read Our Story' }}
            </NuxtLink>
          </div>
        </div>

        <!-- Visual Content -->
        <div class="relative px-4 lg:px-0 mt-8 lg:mt-0">
          <div class="luxury-image-wrapper rounded-sm overflow-hidden shadow-lg md:shadow-2xl">
            <NuxtImg
              src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070"
              alt="Moldovan vineyard landscape"
              class="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[600px] object-cover"
              loading="lazy"
            />
            <div class="luxury-image-overlay" />
          </div>

          <!-- Floating Card -->
          <div class="absolute -bottom-4 left-8 right-8 sm:-bottom-6 sm:-left-4 sm:right-auto bg-white p-4 sm:p-6 shadow-xl max-w-[280px] sm:max-w-xs rounded-sm">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-luxury-black/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 class="font-serif font-semibold text-luxury-wine-red mb-1 text-sm sm:text-base">
                  {{ $t('luxury.origin.badge_title') || 'Certified Authentic' }}
                </h4>
                <p class="text-xs sm:text-sm text-luxury-brown/70">
                  {{ $t('luxury.origin.badge_text') || 'Direct from Moldovan producers' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Origin story content
</script>

<style scoped>
.luxury-image-wrapper {
  position: relative;
}

.luxury-image-wrapper:hover img {
  transform: scale(1.05);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
