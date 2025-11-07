<template>
  <section class="luxury-section bg-luxury-warm-white">
    <div class="luxury-container">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-16 px-4">
        <h2 class="luxury-title text-2xl md:text-3xl lg:text-4xl">
          {{ $t('promises.title') || 'Our Brand Promises' }}
        </h2>
        <div class="luxury-divider mx-auto" />
      </div>

      <!-- Promise Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-4 lg:px-0">
        <!-- Promise 1: Satisfaction Guarantee -->
        <div class="promise-card group">
          <div class="promise-icon">
            <svg class="w-10 h-10 md:w-12 md:h-12 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h3 class="font-serif text-lg md:text-xl font-semibold text-luxury-wine-red mb-2 md:mb-3">
            {{ $t('promises.satisfaction.title') || '100% Satisfaction Guarantee' }}
          </h3>

          <p class="text-luxury-brown/80 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
            {{ $t('promises.satisfaction.description') || 'Every product arrives in perfect condition or we will make it right. Your satisfaction is our priority.' }}
          </p>

          <NuxtLink to="/guarantee" class="promise-link">
            {{ $t('promises.satisfaction.link') || 'Learn more' }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Promise 2: Fast Shipping -->
        <div class="promise-card group">
          <div class="promise-icon">
            <svg class="w-10 h-10 md:w-12 md:h-12 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h3 class="font-serif text-lg md:text-xl font-semibold text-luxury-wine-red mb-2 md:mb-3">
            {{ $t('promises.shipping.title') || 'Fast Worldwide Shipping' }}
          </h3>

          <p class="text-luxury-brown/80 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
            {{ $t('promises.shipping.description') || 'Free worldwide shipping on all orders. Temperature-controlled delivery to preserve quality.' }}
          </p>

          <NuxtLink to="/shipping" class="promise-link">
            {{ $t('promises.shipping.link') || 'Shipping policy' }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Promise 3: Sustainability -->
        <div class="promise-card group">
          <div class="promise-icon">
            <svg class="w-10 h-10 md:w-12 md:h-12 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 class="font-serif text-lg md:text-xl font-semibold text-luxury-wine-red mb-2 md:mb-3">
            {{ $t('promises.sustainability.title') || 'Sustainable Practices' }}
          </h3>

          <p class="text-luxury-brown/80 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
            {{ $t('promises.sustainability.description') || 'Supporting organic farming and conservation efforts across Moldovan estates.' }}
          </p>

          <NuxtLink to="/sustainability" class="promise-link">
            {{ $t('promises.sustainability.link') || 'Our commitment' }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Promise 4: Fair Trade -->
        <div class="promise-card group">
          <div class="promise-icon">
            <svg class="w-10 h-10 md:w-12 md:h-12 text-luxury-wine-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 class="font-serif text-lg md:text-xl font-semibold text-luxury-wine-red mb-2 md:mb-3">
            {{ $t('promises.fairtrade.title') || 'Fair Prices for Producers' }}
          </h3>

          <p class="text-luxury-brown/80 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
            {{ $t('promises.fairtrade.description') || 'Direct partnerships ensure artisan families receive fair compensation for their craft.' }}
          </p>

          <NuxtLink to="/direct-trade" class="promise-link">
            {{ $t('promises.fairtrade.link') || 'Direct trade' }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Brand promises section
</script>

<style scoped>
.promise-card {
  @apply bg-white p-6 rounded-sm shadow-md hover:shadow-xl transition-all duration-300;
  @apply border border-luxury-black/10 hover:border-luxury-wine-red/30;
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .promise-card {
    padding: 2rem;
  }
}

.promise-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, var(--luxury-wine-red), var(--luxury-black));
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.promise-card:hover::before {
  transform: scaleX(1);
}

.promise-icon {
  @apply w-16 h-16 bg-luxury-cream rounded-full;
  @apply flex items-center justify-center mb-4;
  @apply transition-transform duration-300;
}

@media (min-width: 768px) {
  .promise-icon {
    width: 5rem;
    height: 5rem;
    margin-bottom: 1.5rem;
  }
}

.promise-card:hover .promise-icon {
  transform: scale(1.1) rotate(5deg);
}

.promise-link {
  @apply inline-flex items-center gap-2 text-sm font-semibold text-luxury-wine-red;
  @apply uppercase tracking-wider hover:gap-3 transition-all duration-300;
}

.promise-link svg {
  @apply transition-transform duration-300;
}

.promise-link:hover svg {
  transform: translateX(4px);
}
</style>
