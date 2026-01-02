<template>
  <div class="wine-story bg-white">
    <!-- Hero Section - Luxury Editorial -->
    <section class="hero-section">
      <!-- Decorative Background -->
      <div class="hero-bg">
        <div class="glow-wine"></div>
        <div class="glow-gold"></div>
        <div class="grain-pattern"></div>
      </div>

      <div class="container">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: { duration: 800 },
          }"
          class="hero-content"
        >
          <!-- Luxury Badge -->
          <div class="hero-badge">
            <span class="badge-line"></span>
            <commonIcon
              name="lucide:wine"
              class="badge-icon"
            />
            <span>{{ t('wineStory.hero.badge') }}</span>
          </div>

          <!-- Hero Title - Serif -->
          <h1 class="hero-title">
            {{ t('wineStory.hero.title') }}
          </h1>

          <!-- Subtitle -->
          <p class="hero-subtitle">
            {{ t('wineStory.hero.subtitle') }}
          </p>

          <!-- Decorative Divider -->
          <div class="hero-divider">
            <commonIcon
              name="lucide:wine"
              class="divider-icon"
            />
            <div class="divider-line"></div>
            <commonIcon
              name="lucide:grape"
              class="divider-icon"
            />
            <div class="divider-line"></div>
            <commonIcon
              name="lucide:wine"
              class="divider-icon"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Producer Stories -->
    <HomeProducerStoriesSection />

    <!-- Wine Regions Map -->
    <HomeWineRegionsMap />

    <!-- Wine & Food Pairings -->
    <HomePairingGuidesSection />

    <!-- Production Process Timeline -->
    <HomeProductionProcessSection />

    <!-- Gift Philosophy -->
    <HomeGiftPhilosophySection />

    <!-- CTA Section - Luxury Editorial -->
    <section class="cta-section">
      <!-- Decorative Background -->
      <div class="cta-bg">
        <div class="glow-gold-cta"></div>
        <div class="glow-wine-cta"></div>
      </div>

      <div class="container">
        <div class="cta-content">
          <!-- Eyebrow Badge -->
          <div class="cta-badge">
            <commonIcon
              name="lucide:sparkles"
              class="badge-icon-sm"
            />
            <span>{{ t('wineStory.cta.eyebrow', 'Descubre Más') }}</span>
          </div>

          <!-- CTA Title - Serif -->
          <h2 class="cta-title">
            {{ t('wineStory.cta.title') }}
          </h2>

          <!-- CTA Subtitle -->
          <p class="cta-subtitle">
            {{ t('wineStory.cta.subtitle') }}
          </p>

          <!-- CTA Buttons -->
          <div class="cta-buttons">
            <NuxtLink
              :to="localePath('/products')"
              class="btn-primary-cta"
            >
              <span>{{ t('wineStory.cta.shopButton') }}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="btn-arrow"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </NuxtLink>

            <NuxtLink
              :to="localePath('/about')"
              class="btn-secondary-cta"
            >
              {{ t('wineStory.cta.aboutButton') }}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="btn-arrow"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </NuxtLink>
          </div>

          <!-- Decorative Divider -->
          <div class="cta-divider">
            <div class="divider-line"></div>
            <commonIcon
              name="lucide:grape"
              class="divider-icon"
            />
            <div class="divider-line"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

// SEO
useHead({
  title: t('wineStory.seo.title'),
  meta: [
    {
      name: 'description',
      content: t('wineStory.seo.description'),
    },
  ],
})
</script>

<style scoped>
/* ============================================
 * WINE STORY - LUXURY EDITORIAL DESIGN
 * ============================================ */

.wine-story {
  background: var(--md-cream-light);
  color: var(--md-charcoal);
}

/* ============================================
 * HERO SECTION
 * ============================================ */

.hero-section {
  position: relative;
  overflow: hidden;
  background: var(--md-cream);
  padding: 8rem 0 10rem;
}

@media (min-width: 768px) {
  .hero-section {
    padding: 12rem 0 14rem;
  }
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.4;
  pointer-events: none;
}

.glow-wine {
  position: absolute;
  right: -8rem;
  top: -8rem;
  width: 24rem;
  height: 24rem;
  background: var(--md-wine-muted);
  filter: blur(60px);
}

.glow-gold {
  position: absolute;
  left: -8rem;
  bottom: -8rem;
  width: 24rem;
  height: 24rem;
  background: var(--md-gold-muted);
  filter: blur(60px);
}

.grain-pattern {
  position: absolute;
  inset: 0;
  background-image: none;
  background-size: 40px 40px;
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 56rem;
  margin: 0 auto;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 0.75rem 1.5rem;
  background: var(--md-gold-muted);
  color: var(--md-gold-dark);
  font-family: var(--md-font-sans);
  font-size: 0.6875rem;
  font-weight: var(--md-font-semibold);
  letter-spacing: var(--md-tracking-mega);
  text-transform: uppercase;
  border-radius: var(--md-radius-full);
  box-shadow: var(--md-shadow-md);
  backdrop-filter: blur(10px);
}

.badge-line {
  width: 32px;
  height: 1px;
  background: var(--md-gold);
}

.badge-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--md-gold);
}

.hero-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: var(--md-font-normal);
  line-height: 1.08;
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 2rem;
}

.hero-subtitle {
  max-width: 48rem;
  margin: 0 auto 3rem;
  font-family: var(--md-font-sans);
  font-size: clamp(1rem, 2vw, 1.375rem);
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

.hero-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  color: var(--md-gold);
  opacity: 0.4;
}

.divider-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.divider-line {
  width: 4rem;
  height: 1px;
  background: var(--md-gold);
}

/* ============================================
 * CTA SECTION
 * ============================================ */

.cta-section {
  position: relative;
  overflow: hidden;
  background: var(--md-cream-light);
  padding: 6rem 0 8rem;
}

@media (min-width: 768px) {
  .cta-section {
    padding: 10rem 0 12rem;
  }
}

.cta-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.3;
  pointer-events: none;
}

.glow-gold-cta {
  position: absolute;
  right: -6rem;
  top: 0;
  width: 20rem;
  height: 20rem;
  background: var(--md-gold-muted);
  filter: blur(50px);
}

.glow-wine-cta {
  position: absolute;
  left: -6rem;
  bottom: 0;
  width: 20rem;
  height: 20rem;
  background: var(--md-wine-muted);
  filter: blur(50px);
}

.cta-content {
  position: relative;
  z-index: 10;
  max-width: 56rem;
  margin: 0 auto;
  text-align: center;
}

.cta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem 1.25rem;
  background: var(--md-gold-muted);
  color: var(--md-gold-dark);
  font-family: var(--md-font-sans);
  font-size: 0.6875rem;
  font-weight: var(--md-font-semibold);
  letter-spacing: var(--md-tracking-widest);
  text-transform: uppercase;
  border-radius: var(--md-radius-full);
}

.badge-icon-sm {
  width: 1rem;
  height: 1rem;
  color: var(--md-gold);
}

.cta-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: var(--md-font-normal);
  line-height: var(--md-leading-tight);
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.cta-subtitle {
  max-width: 42rem;
  margin: 0 auto 2.5rem;
  font-family: var(--md-font-sans);
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.125rem 2.25rem;
  background: var(--md-cream);
  color: var(--md-charcoal);
  font-family: var(--md-font-sans);
  font-size: 0.8125rem;
  font-weight: var(--md-font-semibold);
  letter-spacing: var(--md-tracking-wider);
  text-transform: uppercase;
  text-decoration: none;
  border-radius: var(--md-radius-full);
  box-shadow: var(--md-shadow-lg);
  transition: var(--md-transition-all);
  position: relative;
  overflow: hidden;
}

.btn-primary-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-gold);
  opacity: 0;
  transition: opacity var(--md-duration-normal) var(--md-ease-smooth);
}

.btn-primary-cta span,
.btn-primary-cta svg {
  position: relative;
  z-index: 1;
}

.btn-primary-cta:hover {
  box-shadow: var(--md-shadow-gold-lg);
  transform: translateY(-3px);
}

.btn-primary-cta:hover::before {
  opacity: 1;
}

.btn-secondary-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.125rem 2.25rem;
  background: transparent;
  color: var(--md-charcoal);
  font-family: var(--md-font-sans);
  font-size: 0.8125rem;
  font-weight: var(--md-font-medium);
  letter-spacing: var(--md-tracking-wider);
  text-transform: uppercase;
  text-decoration: none;
  border-radius: var(--md-radius-full);
  border: var(--md-border-medium) solid var(--md-gray-300);
  transition: var(--md-transition-all);
}

.btn-secondary-cta:hover {
  border-color: var(--md-gold);
  color: var(--md-gold-dark);
  transform: translateY(-2px);
  box-shadow: var(--md-shadow-md);
}

.btn-arrow {
  transition: transform var(--md-duration-normal) var(--md-ease-smooth);
}

.btn-primary-cta:hover .btn-arrow,
.btn-secondary-cta:hover .btn-arrow {
  transform: translateX(0.25rem);
}

.cta-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  color: var(--md-gold);
  opacity: 0.3;
}

/* Responsive */
@media (max-width: 640px) {
  .cta-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary-cta,
  .btn-secondary-cta {
    width: 100%;
    justify-content: center;
  }
}
</style>
