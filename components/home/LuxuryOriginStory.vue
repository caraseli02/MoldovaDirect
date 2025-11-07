<template>
  <section class="luxury-section bg-luxury-warm-white">
    <div class="luxury-container">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Text Content -->
        <div
          v-motion
          :initial="{ opacity: 0, x: -40 }"
          :visible="{ opacity: 1, x: 0, transition: { duration: 800 } }"
        >
          <p class="luxury-eyebrow">
            {{ $t('luxury.origin.eyebrow') || 'Our Heritage' }}
          </p>

          <h2 class="luxury-title">
            {{ $t('luxury.origin.title') || 'A Legacy of Craftsmanship' }}
          </h2>

          <div class="luxury-divider" />

          <div class="luxury-description space-y-4">
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

          <div class="mt-8 flex gap-6">
            <div>
              <div class="text-4xl font-serif text-luxury-wine-red font-bold">75+</div>
              <div class="text-sm text-luxury-brown/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat1') || 'Years Heritage' }}
              </div>
            </div>

            <div class="border-l border-luxury-gold/30 pl-6">
              <div class="text-4xl font-serif text-luxury-wine-red font-bold">15+</div>
              <div class="text-sm text-luxury-brown/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat2') || 'Artisan Partners' }}
              </div>
            </div>

            <div class="border-l border-luxury-gold/30 pl-6">
              <div class="text-4xl font-serif text-luxury-wine-red font-bold">100%</div>
              <div class="text-sm text-luxury-brown/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat3') || 'Authentic' }}
              </div>
            </div>
          </div>

          <div class="mt-10">
            <NuxtLink to="/about" class="luxury-btn luxury-btn-gold">
              {{ $t('luxury.origin.cta') || 'Read Our Story' }}
            </NuxtLink>
          </div>
        </div>

        <!-- Visual Content with Parallax -->
        <div
          v-motion
          :initial="{ opacity: 0, x: 40 }"
          :visible="{ opacity: 1, x: 0, transition: { duration: 800, delay: 200 } }"
          class="relative"
        >
          <div class="luxury-image-wrapper rounded-sm overflow-hidden shadow-2xl">
            <NuxtImg
              src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070"
              alt="Moldovan vineyard landscape"
              class="w-full h-[600px] object-cover"
              loading="lazy"
            />
            <div class="luxury-image-overlay" />
          </div>

          <!-- Floating Card -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 1, y: 0, transition: { duration: 600, delay: 600 } }"
            class="absolute -bottom-8 -left-8 bg-white p-6 shadow-xl max-w-xs rounded-sm"
          >
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 class="font-serif font-semibold text-luxury-wine-red mb-1">
                  {{ $t('luxury.origin.badge_title') || 'Certified Authentic' }}
                </h4>
                <p class="text-sm text-luxury-brown/70">
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
