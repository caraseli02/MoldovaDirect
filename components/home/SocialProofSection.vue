<template>
  <section class="luxury-social-proof">
    <div class="proof-container">
      <!-- Left Column - Stats & Logos -->
      <div class="proof-content">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            transition: { duration: 600 },
          }"
          class="content-header"
        >
          <span class="section-eyebrow">{{ t('home.socialProof.badge') }}</span>
          <h2 class="section-title">
            {{ t('home.socialProof.title') }}
          </h2>
          <p class="section-subtitle">
            {{ t('home.socialProof.subtitle') }}
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div
            v-for="(stat, index) in animatedStats"
            :key="stat.label"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :visible-once="{
              opacity: 1,
              scale: 1,
              transition: { duration: 400, delay: 200 + index * 100 },
            }"
            class="stat-card"
          >
            <span
              class="stat-value"
              aria-live="polite"
              aria-atomic="true"
            >
              {{ stat.displayValue }}
            </span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>

        <!-- Partner Logos -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            transition: { duration: 500, delay: 500 },
          }"
          class="partner-logos"
        >
          <div
            v-for="logo in logos"
            :key="logo"
            class="partner-logo"
          >
            <span class="logo-text">{{ logo }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column - Testimonials -->
      <div class="testimonials-column">
        <article
          v-for="(testimonial, index) in testimonials"
          :key="testimonial.name"
          v-motion
          :initial="{ opacity: 0, x: 40 }"
          :visible-once="{
            opacity: 1,
            x: 0,
            transition: { duration: 500, delay: 300 + index * 150 },
          }"
          class="testimonial-card"
        >
          <div class="testimonial-header">
            <div class="star-rating">
              <svg
                v-for="i in 5"
                :key="i"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span class="verified-badge">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {{ t('home.socialProof.verified') }}
            </span>
          </div>
          <p class="testimonial-quote">
            "{{ testimonial.quote }}"
          </p>
          <div class="testimonial-author">
            <span class="author-name">{{ testimonial.name }}</span>
            <span class="author-location">{{ testimonial.location }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  highlights: Array<{
    value: string
    label: string
  }>
  logos: string[]
  testimonials: Array<{
    name: string
    quote: string
    location: string
  }>
}>()

const { t } = useI18n()

// Add Review schema markup for SEO
const reviewSchema = computed(() => {
  return props.testimonials.map(testimonial => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    'itemReviewed': {
      '@type': 'Organization',
      'name': 'Moldova Direct',
    },
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': '5',
      'bestRating': '5',
    },
    'author': {
      '@type': 'Person',
      'name': testimonial.name,
    },
    'reviewBody': testimonial.quote,
  }))
})

// Inject schema markup into page head
useHead(() => ({
  script: reviewSchema.value.map(schema => ({
    type: 'application/ld+json',
    children: JSON.stringify(schema),
  })),
}))

// Parse numeric values from highlights and create animated counters
const counters = props.highlights.map((stat) => {
  const numericMatch = stat.value.match(/(\d+(?:\.\d+)?)(k|K)?/)

  if (numericMatch && numericMatch[1]) {
    let number = parseFloat(numericMatch[1])

    // Convert k to thousands
    if (numericMatch[2]?.toLowerCase() === 'k') {
      number = number * 1000
    }

    return useCountUp(number, {
      duration: 2000,
      useEasing: true,
    })
  }

  return null
})

const animatedStats = computed(() => {
  return props.highlights.map((stat, index) => {
    const counter = counters[index]

    if (counter) {
      return {
        label: stat.label,
        displayValue: computed(() => {
          // Format based on original value
          if (stat.value.includes('k') || stat.value.includes('K')) {
            return `${(counter.current.value / 1000).toFixed(1)}k+`
          }
          else if (stat.value.includes('/')) {
            // For ratings like "4.9/5"
            return `${counter.current.value.toFixed(1)}/5`
          }
          else if (stat.value.includes('h')) {
            // For time like "48h"
            return `${counter.current.value}h`
          }
          else {
            return counter.formatted.value
          }
        }),
      }
    }

    // Fallback for non-numeric values
    return {
      label: stat.label,
      displayValue: computed(() => stat.value),
    }
  })
})
</script>

<style scoped>
/* ============================================
 * LUXURY SOCIAL PROOF SECTION
 * Moldova Direct - Premium Design System
 * ============================================ */

.luxury-social-proof {
  --proof-cream: #F8F5EE;
  --proof-black: #0A0A0A;
  --proof-charcoal: #151515;
  --proof-gold: #C9A227;
  --proof-gold-light: #DDB93D;
  --proof-wine: #8B2E3B;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  padding: 8rem 4rem;
  background: var(--md-wine);
}

.proof-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

/* Left Column */
.proof-content {
  color: var(--md-cream);
}

.content-header {
  margin-bottom: 3rem;
}

.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--md-font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--md-gold);
  margin-bottom: 1rem;
}

.section-eyebrow::before {
  content: '';
  width: 32px;
  height: 1px;
  background: var(--md-gold);
}

.section-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2rem, 3.5vw, 2.75rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--md-cream);
  margin-bottom: 1rem;
}

.section-subtitle {
  font-family: var(--md-font-sans);
  font-size: 1rem;
  color: rgba(248, 245, 238, 0.7);
  line-height: 1.7;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;
}

.stat-card {
  padding: 1.5rem;
  background: rgba(248, 245, 238, 0.08);
  border: 1px solid rgba(248, 245, 238, 0.12);
}

.stat-value {
  display: block;
  font-family: var(--md-font-serif);
  font-size: 2.5rem;
  font-weight: 500;
  color: var(--md-gold);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-family: var(--md-font-sans);
  font-size: 0.8125rem;
  color: rgba(248, 245, 238, 0.7);
}

/* Partner Logos */
.partner-logos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.partner-logo {
  padding: 1rem 1.25rem;
  background: rgba(248, 245, 238, 0.05);
  border: 1px solid rgba(248, 245, 238, 0.1);
  transition: all 0.3s ease;
}

.partner-logo:hover {
  background: rgba(248, 245, 238, 0.1);
  border-color: var(--md-gold);
}

.logo-text {
  font-family: var(--md-font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--md-cream);
}

/* Testimonials Column */
.testimonials-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.testimonial-card {
  padding: 2rem;
  background: var(--md-cream);
  color: var(--proof-black);
}

.testimonial-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.star-rating {
  display: flex;
  gap: 0.25rem;
  color: var(--md-gold);
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--md-font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #2D6A4F;
  padding: 0.375rem 0.625rem;
  background: rgba(45, 106, 79, 0.1);
}

.testimonial-quote {
  font-family: var(--md-font-serif);
  font-size: 1.125rem;
  font-style: italic;
  line-height: 1.6;
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.testimonial-author {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(10, 10, 10, 0.1);
}

.author-name {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--proof-black);
}

.author-location {
  font-family: var(--md-font-sans);
  font-size: 0.75rem;
  color: #5E5E5E;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .luxury-social-proof {
    padding: 5rem 1.5rem;
  }

  .proof-container {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .partner-logos {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .partner-logos {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 2rem;
  }

  .testimonial-card {
    padding: 1.5rem;
  }
}
</style>
