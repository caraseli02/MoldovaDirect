<template>
  <section class="py-12 md:py-20 bg-[#FCFAF2]">
    <div class="container mx-auto px-4 md:px-6">
      <div class="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        <!-- Text Content -->
        <div>
          <p class="text-xs uppercase tracking-[0.2em] font-medium text-[#722F37] mb-3 md:mb-4">
            {{ $t('luxury.origin.eyebrow') || 'Our Heritage' }}
          </p>

          <h2 class="font-serif text-2xl md:text-3xl lg:text-4xl font-medium text-[#241405] mb-4 md:mb-6">
            {{ $t('luxury.origin.title') || 'A Legacy of Craftsmanship' }}
          </h2>

          <div class="w-16 h-px bg-[#722F37] mb-4 md:mb-6" />

          <div class="text-sm md:text-base text-[#241405]/70 leading-relaxed space-y-3 md:space-y-4">
            <p>
              {{ $t('luxury.origin.p1') || 'For centuries, Moldovan winemakers have perfected the art of viticulture in soil blessed by nature. Each bottle tells a story of tradition, passion, and uncompromising quality.' }}
            </p>

            <!-- Hide middle paragraph on mobile for cleaner look -->
            <p class="hidden md:block">
              {{ $t('luxury.origin.p2') || 'We partner with family-owned estates that have passed down their expertise through generations, ensuring every product reflects the authentic taste of Moldova.' }}
            </p>

            <p class="md:hidden">
              {{ $t('luxury.origin.p3') || 'From the rolling hills of Codru to the limestone caves of Cricova, we bring you the finest selection of wines and gourmet delicacies, carefully curated for the Spanish market.' }}
            </p>

            <p class="hidden md:block">
              {{ $t('luxury.origin.p3') || 'From the rolling hills of Codru to the limestone caves of Cricova, we bring you the finest selection of wines and gourmet delicacies, carefully curated for the Spanish market.' }}
            </p>
          </div>

          <div class="mt-5 md:mt-8 flex flex-wrap gap-4 md:gap-6">
            <div>
              <div class="text-xl md:text-3xl lg:text-4xl font-serif text-[#722F37] font-bold">75+</div>
              <div class="text-xs text-[#241405]/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat1') || 'Years Heritage' }}
              </div>
            </div>

            <div class="border-l border-[#241405]/30 pl-4 md:pl-6">
              <div class="text-xl md:text-3xl lg:text-4xl font-serif text-[#722F37] font-bold">15+</div>
              <div class="text-xs text-[#241405]/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat2') || 'Artisan Partners' }}
              </div>
            </div>

            <div class="border-l border-[#241405]/30 pl-4 md:pl-6">
              <div class="text-xl md:text-3xl lg:text-4xl font-serif text-[#722F37] font-bold">100%</div>
              <div class="text-xs text-[#241405]/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat3') || 'Authentic' }}
              </div>
            </div>
          </div>

          <div class="mt-6 md:mt-8">
            <NuxtLink to="/about" class="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-[#241405] text-[#FCFAF2] text-sm font-medium uppercase tracking-wider hover:bg-[#722F37] transition-colors duration-300 min-h-[44px]">
              {{ $t('luxury.origin.cta') || 'Read Our Story' }}
            </NuxtLink>
          </div>
        </div>

        <!-- Visual Content -->
        <div class="relative mt-6 lg:mt-0">
          <div class="relative overflow-hidden rounded-sm shadow-lg md:shadow-2xl">
            <NuxtImg
              src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070"
              alt="Moldovan vineyard landscape"
              class="w-full h-[280px] md:h-[400px] lg:h-[550px] object-cover"
              loading="lazy"
              @error="handleImageError($event, 'landscape')"
            />
            <div class="absolute inset-0 bg-[#241405]/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>

          <!-- Floating Card - Hidden on mobile for cleaner look -->
          <div class="hidden md:block absolute -bottom-6 -left-4 bg-white p-6 shadow-xl max-w-xs rounded-sm">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-[#241405]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-[#722F37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 class="font-serif font-semibold text-[#722F37] mb-1 text-base">
                  {{ $t('luxury.origin.badge_title') || 'Certified Authentic' }}
                </h4>
                <p class="text-sm text-[#241405]/70">
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
const { handleImageError } = useImageFallback()
</script>

<style scoped>
.relative overflow-hidden {
  position: relative;
}

.relative overflow-hidden:hover img {
  transform: scale(1.05);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
