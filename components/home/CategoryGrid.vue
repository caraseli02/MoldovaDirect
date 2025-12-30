<template>
  <section class="luxury-categories">
    <div class="categories-container">
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
        <div class="header-text">
          <span class="section-eyebrow">
            <span class="eyebrow-line eyebrow-line--left"></span>
            {{ t('home.categories.eyebrow') || 'Explore' }}
            <span class="eyebrow-line eyebrow-line--right"></span>
          </span>
          <h2 class="section-title">
            {{ t('home.categories.title') }}
          </h2>
          <p class="section-subtitle">
            {{ t('home.categories.subtitle') }}
          </p>
        </div>
        <NuxtLink
          :to="localePath('/products')"
          class="view-all-link group"
        >
          <span>{{ t('home.categories.viewAll') }}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="view-all-arrow"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Category Cards Grid -->
      <div class="categories-grid">
        <article
          v-for="(category, index) in categories"
          :key="category.key"
          v-motion
          :initial="{ opacity: 0, y: 50, scale: 0.95 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
              delay: index * 120,
            },
          }"
          class="category-card"
        >
          <NuxtLink
            :to="category.href"
            class="card-link"
          >
            <!-- Gold accent border on hover -->
            <div class="card-border"></div>

            <!-- Background Image with loading state -->
            <div class="card-image">
              <div class="image-placeholder"></div>
              <NuxtImg
                :src="category.image"
                :alt="category.imageAlt"
                densities="1x 2x"
                loading="lazy"
                class="image"
                @load="() => {}"
              />
              <div class="card-overlay"></div>
            </div>

            <!-- Card Content -->
            <div class="card-content">
              <div class="content-top">
                <span class="card-icon">
                  <commonIcon
                    :name="category.icon"
                    class="h-5 w-5"
                  />
                </span>
              </div>
              <div class="content-bottom">
                <h3 class="card-title">{{ category.title }}</h3>
                <p class="card-description">{{ category.description }}</p>
                <span class="card-cta">
                  {{ category.cta }}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="cta-arrow"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  categories: Array<{
    key: string
    title: string
    description: string
    cta: string
    href: string
    icon: string
    accentBackground: string
    image: string
    imageAlt: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* ============================================
 * LUXURY CATEGORY GRID STYLES
 * Moldova Direct - Premium Design System
 * Enhanced with refined animations and polish
 * ============================================ */

.luxury-categories {
  --cat-cream: #F8F5EE;
  --cat-cream-dark: #EDE8DC;
  --cat-black: #0A0A0A;
  --cat-charcoal: #151515;
  --cat-gold: #C9A227;
  --cat-gold-light: #DDB93D;
  --cat-gold-glow: rgba(201, 162, 39, 0.4);
  --cat-wine: #8B2E3B;
  --cat-wine-light: rgba(139, 46, 59, 0.3);
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  padding: 8rem 4rem;
  background: linear-gradient(180deg, var(--cat-cream) 0%, var(--cat-cream-dark) 100%);
  position: relative;
  overflow: hidden;
}

/* Subtle background texture */
.luxury-categories::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A227' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.categories-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 4rem;
}

.header-text {
  max-width: 600px;
}

/* Luxury Eyebrow with decorative lines */
.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cat-gold);
  margin-bottom: 1.25rem;
  text-shadow: 0 1px 2px rgba(201, 162, 39, 0.15);
}

.eyebrow-line {
  display: block;
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cat-gold), transparent);
  position: relative;
}

.eyebrow-line--left {
  background: linear-gradient(90deg, transparent, var(--cat-gold));
}

.eyebrow-line--right {
  background: linear-gradient(90deg, var(--cat-gold), transparent);
}

/* Optional: add subtle gold dots at line ends */
.eyebrow-line::before {
  content: '';
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--cat-gold);
  top: 50%;
  transform: translateY(-50%);
}

.eyebrow-line--left::before {
  right: 0;
}

.eyebrow-line--right::before {
  left: 0;
}

.section-title {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--cat-black);
  margin-bottom: 1rem;
}

.section-subtitle {
  font-family: var(--font-sans);
  font-size: 1rem;
  color: #5E5E5E;
  line-height: 1.7;
}

/* View All Link */
.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--cat-black);
  text-decoration: none;
  border-bottom: 1px solid var(--cat-gold);
  padding-bottom: 4px;
  transition: all 0.3s var(--transition-smooth);
  position: relative;
}

.view-all-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--cat-gold), var(--cat-gold-light));
  transition: width 0.4s var(--transition-smooth);
}

.view-all-link:hover::after {
  width: 100%;
}

.view-all-link:hover {
  color: var(--cat-gold);
}

.view-all-arrow {
  transition: transform 0.3s var(--transition-spring);
}

.view-all-link:hover .view-all-arrow {
  transform: translateX(5px);
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.75rem;
}

/* Category Card */
.category-card {
  position: relative;
  will-change: transform;
}

.card-link {
  display: block;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  aspect-ratio: 3/4;
  border-radius: 2px;
  transition: transform 0.5s var(--transition-smooth),
              box-shadow 0.5s var(--transition-smooth);
}

/* Hover lift and shadow effect */
.card-link:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 25px 50px -12px rgba(10, 10, 10, 0.35),
              0 12px 24px -8px rgba(10, 10, 10, 0.2);
}

/* Gold accent border on hover */
.card-border {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: 2px;
  z-index: 10;
  pointer-events: none;
  transition: border-color 0.4s var(--transition-smooth),
              box-shadow 0.4s var(--transition-smooth);
}

.card-link:hover .card-border {
  border-color: var(--cat-gold);
  box-shadow: inset 0 0 20px var(--cat-gold-glow),
              0 0 30px var(--cat-gold-glow);
}

/* Card Image */
.card-image {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* Image loading placeholder */
.image-placeholder {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #2a2a2a 100%);
  background-size: 200% 200%;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.card-image .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--transition-smooth),
              filter 0.6s var(--transition-smooth);
  will-change: transform;
  position: relative;
  z-index: 1;
}

.card-link:hover .image {
  transform: scale(1.1);
  filter: brightness(1.05) saturate(1.1);
}

/* Elegant dark overlay gradient */
.card-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(10, 10, 10, 0.15) 0%,
    rgba(10, 10, 10, 0.25) 30%,
    rgba(10, 10, 10, 0.5) 60%,
    rgba(10, 10, 10, 0.85) 100%
  );
  transition: background 0.5s var(--transition-smooth);
}

.card-link:hover .card-overlay {
  background: linear-gradient(
    180deg,
    rgba(139, 46, 59, 0.1) 0%,
    rgba(10, 10, 10, 0.3) 30%,
    rgba(139, 46, 59, 0.25) 60%,
    rgba(10, 10, 10, 0.9) 100%
  );
}

/* Card Content */
.card-content {
  position: relative;
  z-index: 5;
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

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: var(--cat-cream);
  color: var(--cat-charcoal);
  border-radius: 1px;
  transition: all 0.4s var(--transition-spring);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-link:hover .card-icon {
  background: linear-gradient(135deg, var(--cat-gold) 0%, var(--cat-gold-light) 100%);
  color: var(--cat-black);
  transform: translateY(-6px) rotate(-2deg);
  box-shadow: 0 8px 20px rgba(201, 162, 39, 0.4);
}

/* Content Bottom */
.content-bottom {
  color: white;
  transform: translateY(0);
  transition: transform 0.4s var(--transition-smooth);
}

.card-link:hover .content-bottom {
  transform: translateY(-4px);
}

.card-title {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 0.625rem;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  transition: color 0.3s ease;
}

.card-link:hover .card-title {
  color: var(--cat-cream);
}

.card-description {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: rgba(248, 245, 238, 0.7);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
}

.card-link:hover .card-description {
  color: rgba(248, 245, 238, 0.85);
}

.card-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cat-gold);
  transition: all 0.3s var(--transition-smooth);
  position: relative;
}

.card-cta::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 0;
  height: 1px;
  background: var(--cat-gold-light);
  transition: width 0.3s var(--transition-smooth);
}

.card-link:hover .card-cta::before {
  width: calc(100% - 24px);
}

.card-link:hover .card-cta {
  color: var(--cat-gold-light);
}

.cta-arrow {
  transition: transform 0.3s var(--transition-spring);
}

.card-link:hover .cta-arrow {
  transform: translateX(6px);
}

/* Dark Mode */
.dark .luxury-categories {
  background: linear-gradient(180deg, var(--cat-charcoal) 0%, #0d0d0d 100%);
}

.dark .luxury-categories::before {
  opacity: 0.5;
}

.dark .section-title {
  color: var(--cat-cream);
}

.dark .section-subtitle {
  color: rgba(248, 245, 238, 0.6);
}

.dark .view-all-link {
  color: var(--cat-cream);
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .luxury-categories {
    padding: 5rem 1.5rem;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .eyebrow-line {
    width: 28px;
  }

  .card-content {
    padding: 1.5rem;
  }

  .card-icon {
    width: 44px;
    height: 44px;
  }

  .card-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .luxury-categories {
    padding: 4rem 1rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .card-link {
    aspect-ratio: 16/10;
  }

  .section-eyebrow {
    gap: 0.75rem;
  }

  .eyebrow-line {
    width: 24px;
  }

  .card-title {
    font-size: 1.375rem;
  }

  .card-description {
    font-size: 0.8125rem;
    margin-bottom: 1rem;
  }

  /* Reduce motion for mobile */
  .card-link:hover {
    transform: translateY(-4px);
  }
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .card-link,
  .card-image .image,
  .card-overlay,
  .card-icon,
  .content-bottom,
  .cta-arrow,
  .view-all-arrow {
    transition: none;
  }

  .card-link:hover {
    transform: none;
  }

  .card-link:hover .image {
    transform: none;
  }

  .image-placeholder {
    animation: none;
  }
}
</style>
