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

          <div class="text-sm md:text-base text-[#241405]/70 leading-relaxed space-y-4">
            <p>
              {{ $t('luxury.origin.p1') || 'For centuries, Moldovan winemakers have perfected the art of viticulture in soil blessed by nature. Each bottle tells a story of tradition, passion, and uncompromising quality.' }}
            </p>

            <p class="hidden md:block">
              {{ $t('luxury.origin.p2') || 'We partner with family-owned estates that have passed down their expertise through generations, ensuring every product reflects the authentic taste of Moldova.' }}
            </p>
          </div>

          <!-- Stats -->
          <div class="mt-6 md:mt-8 flex items-center gap-6 md:gap-8">
            <div>
              <div class="text-2xl md:text-3xl lg:text-4xl font-serif text-[#722F37] font-bold">75+</div>
              <div class="text-xs text-[#241405]/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat1') || 'Years Heritage' }}
              </div>
            </div>

            <div class="w-px h-12 bg-[#241405]/20"></div>

            <div>
              <div class="text-2xl md:text-3xl lg:text-4xl font-serif text-[#722F37] font-bold">15+</div>
              <div class="text-xs text-[#241405]/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat2') || 'Artisan Partners' }}
              </div>
            </div>

            <div class="w-px h-12 bg-[#241405]/20"></div>

            <div>
              <div class="text-2xl md:text-3xl lg:text-4xl font-serif text-[#722F37] font-bold">100%</div>
              <div class="text-xs text-[#241405]/70 uppercase tracking-wider mt-1">
                {{ $t('luxury.origin.stat3') || 'Authentic' }}
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <div class="mt-6 md:mt-8">
            <NuxtLink
              to="/about"
              class="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-[#241405] text-[#FCFAF2] text-sm font-medium uppercase tracking-wider hover:bg-[#722F37] transition-colors duration-300"
            >
              {{ $t('luxury.origin.cta') || 'Read Our Story' }}
            </NuxtLink>
          </div>
        </div>

        <!-- Image -->
        <div class="relative mt-6 lg:mt-0">
          <NuxtImg
            src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070"
            alt="Moldovan vineyard landscape"
            class="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover rounded-sm shadow-lg"
            loading="lazy"
            @error="handleImageError($event, 'landscape')"
          />
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { handleImageError } = useImageFallback()
</script>

<style scoped>
/* Hover effect */
img {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

img:hover {
  transform: scale(1.02);
}
</style>
