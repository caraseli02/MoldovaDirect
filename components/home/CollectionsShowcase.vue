<template>
  <section class="luxury-collections">
    <div class="collections-container">
      <!-- Section Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="section-header"
      >
        <span class="section-eyebrow">{{ t('home.collections.badge') }}</span>
        <h2 class="section-title">
          {{ t('home.collections.title') }}
        </h2>
        <p class="section-subtitle">
          {{ t('home.collections.subtitle') }}
        </p>
      </div>

      <!-- Collections Bento Grid -->
      <div class="collections-grid">
        <NuxtLink
          v-for="(card, index) in cards"
          :key="card.key"
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            transition: { duration: 600, delay: index * 100 },
          }"
          :to="card.href"
          class="collection-card"
          :class="card.gridClass"
        >
          <div class="card-image-wrapper">
            <NuxtImg
              :src="card.image"
              :alt="card.imageAlt"
              densities="1x 2x"
              class="card-image"
            />
            <div class="card-overlay"></div>
          </div>
          <div class="card-content">
            <div class="content-top">
              <span class="card-tag">{{ card.tag }}</span>
            </div>
            <div class="content-bottom">
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-description">{{ card.description }}</p>
              <span class="card-cta">
                {{ card.cta }}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

type Card = {
  key: string
  title: string
  description: string
  cta: string
  href: string
  image: string
  imageAlt: string
  tag: string
  gridClass: string
}

const cards = computed<Card[]>(() => [
  {
    key: 'reserve',
    title: t('home.collections.cards.reserve.title'),
    description: t('home.collections.cards.reserve.description'),
    cta: t('home.collections.cards.reserve.cta'),
    href: localePath('/products?category=wine'),
    image: 'https://images.unsplash.com/photo-1566754436750-9393f43f02b3?q=80&w=1200',
    imageAlt: t('home.collections.cards.reserve.imageAlt'),
    tag: t('home.collections.cards.reserve.tag'),
    gridClass: 'card-large',
  },
  {
    key: 'artisan',
    title: t('home.collections.cards.artisan.title'),
    description: t('home.collections.cards.artisan.description'),
    cta: t('home.collections.cards.artisan.cta'),
    href: localePath('/products?category=gourmet'),
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=1200',
    imageAlt: t('home.collections.cards.artisan.imageAlt'),
    tag: t('home.collections.cards.artisan.tag'),
    gridClass: 'card-small-top',
  },
  {
    key: 'experience',
    title: t('home.collections.cards.experience.title'),
    description: t('home.collections.cards.experience.description'),
    cta: t('home.collections.cards.experience.cta'),
    href: localePath('/products?category=subscription'),
    image: 'https://images.unsplash.com/photo-1554939437-ecc492c67b78?q=80&w=1200',
    imageAlt: t('home.collections.cards.experience.imageAlt'),
    tag: t('home.collections.cards.experience.tag'),
    gridClass: 'card-small-bottom',
  },
])
</script>

<style scoped>
/* ============================================
 * LUXURY COLLECTIONS SHOWCASE
 * Moldova Direct - Premium Design System
 * ============================================ */

.luxury-collections {
  --coll-cream: #F8F5EE;
  --coll-black: #0A0A0A;
  --coll-charcoal: #151515;
  --coll-gold: #C9A227;
  --coll-gold-light: #DDB93D;
  --coll-wine: #8B2E3B;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  padding: 8rem 4rem;
  background: var(--coll-charcoal);
}

.collections-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Section Header */
.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
}

.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--coll-gold);
  margin-bottom: 1rem;
}

.section-eyebrow::before,
.section-eyebrow::after {
  content: '';
  width: 32px;
  height: 1px;
  background: var(--coll-gold);
}

.section-title {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--coll-cream);
  margin-bottom: 1rem;
}

.section-subtitle {
  font-family: var(--font-sans);
  font-size: 1rem;
  color: rgba(248, 245, 238, 0.6);
  line-height: 1.7;
}

/* Collections Grid */
.collections-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(2, minmax(280px, 1fr));
  gap: 1.5rem;
}

.collection-card {
  position: relative;
  overflow: hidden;
  text-decoration: none;
}

.card-large {
  grid-column: span 7;
  grid-row: span 2;
}

.card-small-top {
  grid-column: span 5;
  grid-row: span 1;
}

.card-small-bottom {
  grid-column: span 5;
  grid-row: span 1;
}

/* Card Image */
.card-image-wrapper {
  position: absolute;
  inset: 0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--transition-smooth);
}

.collection-card:hover .card-image {
  transform: scale(1.08);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 10, 10, 0.85) 0%,
    rgba(10, 10, 10, 0.4) 40%,
    rgba(10, 10, 10, 0.2) 100%
  );
  transition: background 0.4s ease;
}

.collection-card:hover .card-overlay {
  background: linear-gradient(
    to top,
    rgba(10, 10, 10, 0.9) 0%,
    rgba(139, 46, 59, 0.3) 50%,
    rgba(10, 10, 10, 0.25) 100%
  );
}

/* Card Content */
.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 2rem;
}

.content-top {
  display: flex;
  justify-content: flex-start;
}

.card-tag {
  font-family: var(--font-sans);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 0.5rem 1rem;
  background: var(--coll-cream);
  color: var(--coll-black);
  transition: all 0.4s var(--transition-smooth);
}

.collection-card:hover .card-tag {
  background: var(--coll-gold);
}

/* Content Bottom */
.content-bottom {
  color: white;
}

.card-title {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.card-large .card-title {
  font-size: 2.25rem;
}

.card-description {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: rgba(248, 245, 238, 0.75);
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.card-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--coll-gold);
  transition: all 0.3s ease;
}

.collection-card:hover .card-cta {
  color: var(--coll-gold-light);
}

.card-cta svg {
  transition: transform 0.3s ease;
}

.collection-card:hover .card-cta svg {
  transform: translateX(4px);
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .luxury-collections {
    padding: 5rem 1.5rem;
  }

  .collections-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    gap: 1rem;
  }

  .card-large,
  .card-small-top,
  .card-small-bottom {
    grid-column: span 1;
    grid-row: span 1;
    min-height: 320px;
  }

  .card-large .card-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 640px) {
  .card-large,
  .card-small-top,
  .card-small-bottom {
    min-height: 280px;
  }

  .card-content {
    padding: 1.5rem;
  }
}
</style>
