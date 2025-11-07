<template>
  <section class="luxury-section bg-white">
    <div class="luxury-container">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          class="luxury-eyebrow"
        >
          {{ $t('luxury.artisans.eyebrow') || 'Meet The Makers' }}
        </p>

        <h2
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 100 } }"
          class="luxury-title"
        >
          {{ $t('luxury.artisans.title') || 'Artisan Producers' }}
        </h2>

        <div class="luxury-divider mx-auto" />

        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 200 } }"
          class="luxury-description mx-auto"
        >
          {{ $t('luxury.artisans.description') || 'Each product in our collection comes from a carefully selected family estate, where tradition and innovation blend to create exceptional quality.' }}
        </p>
      </div>

      <!-- Artisan Grid -->
      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="(artisan, index) in artisans"
          :key="artisan.id"
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: index * 150 + 300, duration: 600 } }"
          class="luxury-card group"
        >
          <!-- Portrait -->
          <div class="luxury-image-wrapper mb-6 rounded-sm overflow-hidden">
            <NuxtImg
              :src="artisan.image"
              :alt="artisan.name"
              class="w-full h-80 object-cover"
              loading="lazy"
            />
            <div class="luxury-image-overlay" />
          </div>

          <!-- Content -->
          <div>
            <h3 class="font-serif text-2xl font-semibold text-luxury-wine-red mb-2">
              {{ artisan.name }}
            </h3>

            <p class="text-sm uppercase tracking-wider text-luxury-black mb-4 font-semibold">
              {{ artisan.specialty }}
            </p>

            <p class="text-luxury-brown/80 leading-relaxed mb-6 italic">
              "{{ artisan.quote }}"
            </p>

            <div class="flex items-center gap-3 text-sm text-luxury-brown/60">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span>{{ artisan.location }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center mt-16">
        <NuxtLink to="/producers" class="luxury-btn luxury-btn-dark">
          {{ $t('luxury.artisans.cta') || 'Meet All Producers' }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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
