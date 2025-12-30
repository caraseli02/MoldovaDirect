<template>
  <section class="luxury-hero-section">
    <!-- Amazon-style carousel at the top -->
    <HomeHeroCarousel />

    <!-- Hero content below carousel -->
    <div class="hero-content-wrapper">
      <div class="hero-background">
        <div class="glow-wine"></div>
        <div class="glow-gold"></div>
        <div class="grain-pattern"></div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <!-- Trust Badge with fade-in animation -->
          <div
            v-motion
            :initial="{ opacity: 0, y: -20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 500 },
            }"
            class="trust-badge"
          >
            <commonIcon
              name="lucide:shield-check"
              class="badge-icon"
            />
            <span>{{ t('home.hero.trustBadge') }}</span>
          </div>

          <!-- Title with slide-up animation -->
          <h1
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 100 },
            }"
            class="hero-title"
          >
            {{ t('home.hero.title') }}
          </h1>

          <!-- Subtitle with fade-in -->
          <p
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 600, delay: 200 },
            }"
            class="hero-subtitle"
          >
            {{ t('home.hero.subtitle') }}
          </p>

          <!-- CTAs with stagger animation -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 500, delay: 300 },
            }"
            class="hero-ctas"
          >
            <NuxtLink
              :to="localePath('/products')"
              class="cta-primary"
            >
              {{ t('home.hero.primaryCta') }}
              <commonIcon
                name="lucide:arrow-right"
                class="cta-icon"
              />
            </NuxtLink>
            <NuxtLink
              :to="localePath('/about')"
              class="cta-secondary"
            >
              {{ t('home.hero.secondaryCta') }}
            </NuxtLink>
          </div>

          <!-- Highlights with stagger animation -->
          <dl class="hero-highlights">
            <div
              v-for="(highlight, index) in highlights"
              :key="highlight.label"
              v-motion
              :initial="{ opacity: 0, scale: 0.9 }"
              :enter="{
                opacity: 1,
                scale: 1,
                transition: { duration: 400, delay: 400 + index * 100 },
              }"
              class="highlight-item"
            >
              <dt class="highlight-label">
                {{ highlight.label }}
              </dt>
              <dd class="highlight-value">
                {{ highlight.value }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  highlights: Array<{
    value: string
    label: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* ===== LUXURY HERO SECTION ===== */
.luxury-hero-section {
  position: relative;
  overflow: hidden;
  background: var(--md-charcoal);
  color: #fff;
}

/* ===== HERO CONTENT WRAPPER ===== */
.hero-content-wrapper {
  position: relative;
  background: linear-gradient(to bottom, rgba(10, 10, 10, 0.95), var(--md-charcoal));
}

/* ===== BACKGROUND ===== */
.hero-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.glow-wine {
  position: absolute;
  top: -10%;
  right: -5%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(139, 46, 59, 0.2) 0%, transparent 70%);
  filter: blur(90px);
}

.glow-gold {
  position: absolute;
  bottom: -10%;
  left: -5%;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(201, 162, 39, 0.15) 0%, transparent 70%);
  filter: blur(100px);
}

.grain-pattern {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04' /%3E%3C/svg%3E");
}

/* ===== CONTAINER ===== */
.hero-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

@media (min-width: 768px) {
  .hero-container {
    padding: 5rem 2rem;
  }
}

.hero-content {
  max-width: 80rem;
  margin: 0 auto;
  text-align: center;
}

/* ===== TRUST BADGE ===== */
.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(201, 162, 39, 0.15);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: var(--md-radius-full);
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--md-gold);
  backdrop-filter: blur(12px);
}

.badge-icon {
  width: 1rem;
  height: 1rem;
}

/* ===== TITLE & SUBTITLE ===== */
.hero-title {
  margin-top: 1.5rem;
  font-family: var(--md-font-serif);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: var(--md-tracking-tight);
  color: #fff;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: clamp(3rem, 6vw, 5rem);
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: clamp(3.5rem, 6vw, 5.5rem);
  }
}

.hero-subtitle {
  max-width: 48rem;
  margin: 1.5rem auto 0;
  font-family: var(--md-font-sans);
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
}

/* ===== CTAs ===== */
.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.cta-primary,
.cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: var(--md-radius-full);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cta-primary {
  background: #fff;
  color: var(--md-charcoal);
  box-shadow: var(--md-shadow-lg);
}

.cta-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-gradient-gold);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-primary:hover::before {
  opacity: 1;
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--md-shadow-gold-lg);
}

.cta-primary > * {
  position: relative;
  z-index: 1;
}

.cta-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.cta-primary:hover .cta-icon {
  transform: translateX(4px);
}

.cta-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(201, 162, 39, 0.5);
  transform: translateY(-2px);
}

.cta-primary:focus-visible,
.cta-secondary:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 4px;
}

/* ===== HIGHLIGHTS ===== */
.hero-highlights {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 3rem;
}

@media (min-width: 640px) {
  .hero-highlights {
    grid-template-columns: repeat(3, 1fr);
  }
}

.highlight-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.highlight-label {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.highlight-value {
  font-family: var(--md-font-serif);
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 600;
  color: var(--md-gold);
}
</style>
