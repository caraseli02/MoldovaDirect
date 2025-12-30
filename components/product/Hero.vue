<template>
  <section class="product-hero-section">
    <!-- Background Decorations -->
    <div class="hero-background">
      <div class="glow-wine"></div>
      <div class="glow-gold"></div>
      <div class="grain-pattern"></div>
    </div>

    <!-- Content -->
    <div class="hero-container">
      <div class="hero-content-wrapper">
        <!-- Seasonal badge with luxury styling -->
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { delay: 200 },
          }"
          class="hero-badge"
        >
          <span class="badge-line"></span>
          <span>{{ seasonalBadge }}</span>
          <span class="badge-line"></span>
        </div>

        <!-- Main title -->
        <h1
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 300 },
          }"
          class="hero-title"
        >
          {{ title }}
        </h1>

        <!-- Subtitle -->
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 400 },
          }"
          class="hero-subtitle"
        >
          {{ subtitle }}
        </p>

        <!-- CTA and Discovery collections -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: { delay: 500 },
          }"
          class="hero-actions"
        >
          <button
            type="button"
            class="cta-button"
            @click="$emit('scroll-to-results')"
          >
            {{ ctaText }}
            <commonIcon
              name="lucide:arrow-down"
              class="cta-icon"
            />
          </button>

          <div
            v-if="collections.length"
            class="collections-wrapper"
          >
            <button
              v-for="collection in collections"
              :key="collection.id"
              type="button"
              class="collection-button"
              :class="{ active: activeCollectionId === collection.id }"
              @click="$emit('select-collection', collection)"
            >
              {{ collection.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductFilters } from '~/types'

interface DiscoveryCollection {
  id: string
  label: string
  filters: ProductFilters
}

interface Props {
  seasonalBadge: string
  title: string
  subtitle: string
  ctaText: string
  collections?: DiscoveryCollection[]
  activeCollectionId?: string | null
}

withDefaults(defineProps<Props>(), {
  collections: () => [],
  activeCollectionId: null,
})

defineEmits<{
  'scroll-to-results': []
  'select-collection': [collection: DiscoveryCollection]
}>()
</script>

<style scoped>
/* ===== HERO SECTION ===== */
.product-hero-section {
  position: relative;
  overflow: hidden;
  background: var(--md-cream);
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
  right: 10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(139, 46, 59, 0.15) 0%, transparent 70%);
  filter: blur(80px);
}

.glow-gold {
  position: absolute;
  bottom: -10%;
  left: 15%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(201, 162, 39, 0.12) 0%, transparent 70%);
  filter: blur(90px);
}

.grain-pattern {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03' /%3E%3C/svg%3E");
}

/* ===== CONTAINER ===== */
.hero-container {
  position: relative;
  z-index: 1;
  padding: 3rem 1rem;
}

@media (min-width: 640px) {
  .hero-container {
    padding: 3rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .hero-container {
    padding: 4rem 2rem;
  }
}

.hero-content-wrapper {
  max-width: 80rem;
  margin: 0 auto;
}

/* ===== BADGE ===== */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(201, 162, 39, 0.15);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: var(--md-radius-full);
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--md-gold);
  box-shadow: var(--md-shadow-sm);
}

.badge-line {
  width: 24px;
  height: 1px;
  background: var(--md-gradient-gold-line);
}

/* ===== TITLE & SUBTITLE ===== */
.hero-title {
  margin-top: 1.5rem;
  font-family: var(--md-font-serif);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
}

@media (min-width: 640px) {
  .hero-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: clamp(3rem, 5vw, 4.5rem);
  }
}

.hero-subtitle {
  margin-top: 1rem;
  max-width: 42rem;
  font-family: var(--md-font-sans);
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
  color: rgba(10, 10, 10, 0.7);
}

/* ===== ACTIONS ===== */
.hero-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .hero-actions {
    flex-direction: row;
    align-items: center;
  }
}

/* CTA Button */
.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: var(--md-charcoal);
  color: var(--md-cream);
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: none;
  border-radius: var(--md-radius-full);
  box-shadow: var(--md-shadow-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cta-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-gradient-gold);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-button:hover::before {
  opacity: 1;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--md-shadow-gold-lg);
}

.cta-button > * {
  position: relative;
  z-index: 1;
}

.cta-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.cta-button:hover .cta-icon {
  transform: translateY(2px);
}

/* Collections */
.collections-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.collection-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  color: var(--md-charcoal);
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(10, 10, 10, 0.15);
  border-radius: var(--md-radius-full);
  cursor: pointer;
  transition: all 0.3s ease;
}

.collection-button:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(201, 162, 39, 0.3);
  transform: translateY(-2px);
  box-shadow: var(--md-shadow-md);
}

.collection-button.active {
  background: var(--md-gold);
  color: #fff;
  border-color: var(--md-gold);
  box-shadow: var(--md-shadow-gold-md);
}

/* Accessibility */
.cta-button:focus-visible,
.collection-button:focus-visible {
  outline: 2px solid var(--md-gold);
  outline-offset: 4px;
}
</style>
