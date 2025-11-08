<template>
  <section class="luxury-section bg-white">
    <div class="luxury-container">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-16 px-4">
        <p class="luxury-eyebrow text-sm md:text-base">
          {{ $t('luxury.artisans.eyebrow') || 'Meet The Makers' }}
        </p>

        <h2 class="luxury-title text-2xl md:text-3xl lg:text-4xl">
          {{ $t('luxury.artisans.title') || 'Artisan Producers' }}
        </h2>

        <div class="luxury-divider mx-auto" />

        <p class="luxury-description mx-auto text-sm md:text-base">
          {{ $t('luxury.artisans.description') || 'Each product in our collection comes from a carefully selected family estate, where tradition and innovation blend to create exceptional quality.' }}
        </p>
      </div>

      <!-- Artisan Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 lg:px-0">
        <div
          v-for="(artisan, index) in artisans"
          :key="artisan.id"
          class="luxury-card group"
        >
          <!-- Portrait -->
          <div class="luxury-image-wrapper mb-4 md:mb-6 rounded-sm overflow-hidden">
            <NuxtImg
              :src="artisan.image"
              :alt="artisan.name"
              class="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover"
              loading="lazy"
              @error="handleImageError($event, 'portrait')"
            />
            <div class="luxury-image-overlay" />
          </div>

          <!-- Content -->
          <div>
            <h3 class="font-serif text-xl md:text-2xl font-semibold text-luxury-wine-red mb-2">
              {{ artisan.name }}
            </h3>

            <p class="text-xs sm:text-sm uppercase tracking-wider text-luxury-black mb-3 md:mb-4 font-semibold">
              {{ artisan.specialty }}
            </p>

            <p class="text-luxury-brown/80 leading-relaxed mb-4 md:mb-6 italic text-sm md:text-base">
              "{{ artisan.quote }}"
            </p>

            <div class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-luxury-brown/60">
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
        <NuxtLink to="/producers" class="luxury-btn luxury-btn-dark w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center text-sm md:text-base">
          {{ $t('luxury.artisans.cta') || 'Meet All Producers' }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { handleImageError } = useImageFallback()

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
.luxury-card {
  background: white;
  padding: 2rem;
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.luxury-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(74, 28, 28, 0.15);
  border-color: var(--luxury-black);
}

.luxury-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, var(--luxury-black), var(--luxury-wine-red));
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.luxury-card:hover::before {
  transform: scaleX(1);
}
</style>
