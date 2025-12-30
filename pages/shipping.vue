<template>
  <div class="shipping-page">
    <!-- Hero Section - Luxury Editorial -->
    <section class="hero-section">
      <!-- Decorative Background -->
      <div class="hero-bg">
        <div class="glow-wine"></div>
        <div class="glow-gold"></div>
        <div class="grain-pattern"></div>
      </div>

      <div class="container">
        <div class="hero-grid">
          <!-- Hero Content -->
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
                name="lucide:truck"
                class="badge-icon"
              />
              <span>{{ $t('shippingPage.hero.badge', 'Shipping Information') }}</span>
            </div>

            <!-- Hero Title - Serif -->
            <h1 class="hero-title">
              {{ $t('shippingPage.hero.title', 'Fast & Reliable Shipping Across Spain') }}
            </h1>

            <!-- Subtitle -->
            <p class="hero-subtitle">
              {{ $t('shippingPage.hero.description', 'Get your authentic Moldovan products delivered to your doorstep with care and speed.') }}
            </p>

            <!-- CTA Buttons -->
            <div class="hero-buttons">
              <NuxtLink
                :to="localePath('/track-order')"
                class="btn-primary"
              >
                <span>{{ $t('shippingPage.ctas.track', 'Track Order') }}</span>
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
                :to="localePath('/contact')"
                class="btn-secondary"
              >
                {{ $t('shippingPage.ctas.contact', 'Contact Us') }}
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

            <!-- Notice Card -->
            <div class="hero-notice">
              <commonIcon
                name="lucide:truck"
                class="notice-icon"
              />
              <div class="notice-content">
                <p class="notice-title">
                  {{ $t('shippingPage.hero.notice', 'Free Shipping on Orders Over €50') }}
                </p>
                <p class="notice-text">
                  {{ $t('shippingPage.hero.secondaryNotice', 'Delivered within 24-48h') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Highlights Sidebar -->
          <aside class="highlights-card">
            <h2 class="card-title">
              {{ $t('shippingPage.highlights.title', 'Why Our Shipping?') }}
            </h2>
            <p class="card-subtitle">
              {{ $t('shippingPage.highlights.subtitle', 'Quality and care in every delivery') }}
            </p>

            <ul class="highlights-list">
              <li
                v-for="item in highlightItems"
                :key="item.title"
                class="highlight-item"
              >
                <div class="highlight-icon-wrapper">
                  <commonIcon
                    :name="item.icon"
                    class="highlight-icon"
                  />
                </div>
                <div class="highlight-content">
                  <p class="highlight-title">
                    {{ item.title }}
                  </p>
                  <p class="highlight-text">
                    {{ item.description }}
                  </p>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>

    <!-- Shipping Methods Section -->
    <section class="methods-section">
      <div class="container">
        <div class="methods-grid">
          <!-- Methods Content -->
          <div class="methods-main">
            <div class="section-header">
              <div class="section-badge">
                <commonIcon
                  name="lucide:package"
                  class="badge-icon-sm"
                />
                <span>{{ $t('shippingPage.methods.tag', 'Available Now') }}</span>
              </div>

              <h2 class="section-title">
                {{ $t('shippingPage.methods.title', 'Shipping Methods') }}
              </h2>

              <p class="section-subtitle">
                {{ $t('shippingPage.methods.subtitle', 'Choose the delivery option that works best for you') }}
              </p>
            </div>

            <div class="methods-cards">
              <article
                v-for="method in methods"
                :key="method.title"
                class="method-card"
              >
                <div class="method-speed">
                  <commonIcon
                    :name="method.icon"
                    class="speed-icon"
                  />
                  <span>{{ method.speed }}</span>
                </div>

                <h3 class="method-title">
                  {{ method.title }}
                </h3>
                <p class="method-description">
                  {{ method.description }}
                </p>

                <div class="method-note">
                  <commonIcon
                    name="lucide:arrow-up-right"
                    class="note-icon"
                  />
                  <span>{{ method.note }}</span>
                </div>
              </article>
            </div>
          </div>

          <!-- Coverage Sidebar -->
          <aside class="coverage-sidebar">
            <!-- Coverage Card -->
            <div class="sidebar-card coverage-card">
              <h3 class="card-title">
                {{ $t('shippingPage.coverage.title', 'Shipping Coverage') }}
              </h3>
              <p class="card-subtitle">
                {{ $t('shippingPage.coverage.subtitle', 'We deliver across Spain') }}
              </p>

              <ul class="coverage-list">
                <li
                  v-for="region in coverage"
                  :key="region.title"
                  class="coverage-item"
                >
                  <div class="coverage-header">
                    <span class="coverage-title">{{ region.title }}</span>
                    <span class="coverage-badge">{{ region.badge }}</span>
                  </div>
                  <p class="coverage-text">
                    {{ region.description }}
                  </p>
                </li>
              </ul>
            </div>

            <!-- Extras Card -->
            <div class="sidebar-card extras-card">
              <h3 class="card-title">
                {{ $t('shippingPage.extras.title', 'Additional Services') }}
              </h3>

              <ul class="extras-list">
                <li
                  v-for="item in extras"
                  :key="item.title"
                  class="extra-item"
                >
                  <commonIcon
                    :name="item.icon"
                    class="extra-icon"
                  />
                  <div class="extra-content">
                    <p class="extra-title">
                      {{ item.title }}
                    </p>
                    <p class="extra-text">
                      {{ item.description }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- Timeline Section -->
    <section class="timeline-section">
      <div class="container">
        <div class="timeline-header">
          <div>
            <div class="section-badge">
              <commonIcon
                name="lucide:clock"
                class="badge-icon-sm"
              />
              <span>{{ $t('shippingPage.timeline.reminder', 'Order Process') }}</span>
            </div>

            <h2 class="section-title">
              {{ $t('shippingPage.timeline.title', 'How It Works') }}
            </h2>

            <p class="section-subtitle">
              {{ $t('shippingPage.timeline.subtitle', 'From order to delivery in 4 simple steps') }}
            </p>
          </div>
        </div>

        <ol class="timeline-steps">
          <li
            v-for="(step, index) in timeline"
            :key="step.title"
            class="timeline-step"
          >
            <div class="step-number">
              {{ index + 1 }}
            </div>
            <h3 class="step-title">
              {{ step.title }}
            </h3>
            <p class="step-description">
              {{ step.description }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Contact CTA Section -->
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
              name="lucide:help-circle"
              class="badge-icon-sm"
            />
            <span>{{ $t('shippingPage.contactCard.noteTitle', 'Need Help?') }}</span>
          </div>

          <!-- CTA Title - Serif -->
          <h2 class="cta-title">
            {{ $t('shippingPage.contactCard.title', 'Have Questions About Shipping?') }}
          </h2>

          <!-- CTA Subtitle -->
          <p class="cta-subtitle">
            {{ $t('shippingPage.contactCard.description', 'Our customer support team is here to help with any shipping questions or concerns.') }}
          </p>

          <!-- CTA Buttons -->
          <div class="cta-buttons">
            <NuxtLink
              :to="localePath('/contact')"
              class="btn-primary-cta"
            >
              <span>{{ $t('shippingPage.contactCard.cta', 'Contact Support') }}</span>
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
              :to="localePath('/faq')"
              class="btn-secondary-cta"
            >
              {{ $t('shippingPage.contactCard.secondary', 'View FAQ') }}
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

          <!-- Notice -->
          <div class="cta-notice">
            <p class="notice-title">
              {{ $t('shippingPage.contactCard.noteTitle', 'Important Note') }}
            </p>
            <p class="notice-text">
              {{ $t('shippingPage.contactCard.noteDescription', 'Delivery times may vary during holidays and peak seasons.') }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const highlightItems = computed(() => [
  {
    icon: 'lucide:clock',
    title: t('shippingPage.highlights.items.fast.title'),
    description: t('shippingPage.highlights.items.fast.description'),
  },
  {
    icon: 'lucide:globe',
    title: t('shippingPage.highlights.items.coverage.title'),
    description: t('shippingPage.highlights.items.coverage.description'),
  },
  {
    icon: 'lucide:snowflake',
    title: t('shippingPage.highlights.items.packaging.title'),
    description: t('shippingPage.highlights.items.packaging.description'),
  },
  {
    icon: 'lucide:bell',
    title: t('shippingPage.highlights.items.updates.title'),
    description: t('shippingPage.highlights.items.updates.description'),
  },
])

const methods = computed(() => [
  {
    icon: 'lucide:zap',
    speed: t('shippingPage.methods.cards.express.speed'),
    title: t('shippingPage.methods.cards.express.title'),
    description: t('shippingPage.methods.cards.express.description'),
    note: t('shippingPage.methods.cards.express.note'),
  },
  {
    icon: 'lucide:package',
    speed: t('shippingPage.methods.cards.standard.speed'),
    title: t('shippingPage.methods.cards.standard.title'),
    description: t('shippingPage.methods.cards.standard.description'),
    note: t('shippingPage.methods.cards.standard.note'),
  },
  {
    icon: 'lucide:refrigerator',
    speed: t('shippingPage.methods.cards.refrigerated.speed'),
    title: t('shippingPage.methods.cards.refrigerated.title'),
    description: t('shippingPage.methods.cards.refrigerated.description'),
    note: t('shippingPage.methods.cards.refrigerated.note'),
  },
])

const coverage = computed(() => [
  {
    title: t('shippingPage.coverage.regions.mainland.title'),
    description: t('shippingPage.coverage.regions.mainland.description'),
    badge: t('shippingPage.coverage.regions.mainland.badge'),
  },
  {
    title: t('shippingPage.coverage.regions.balearic.title'),
    description: t('shippingPage.coverage.regions.balearic.description'),
    badge: t('shippingPage.coverage.regions.balearic.badge'),
  },
  {
    title: t('shippingPage.coverage.regions.canary.title'),
    description: t('shippingPage.coverage.regions.canary.description'),
    badge: t('shippingPage.coverage.regions.canary.badge'),
  },
  {
    title: t('shippingPage.coverage.regions.eu.title'),
    description: t('shippingPage.coverage.regions.eu.description'),
    badge: t('shippingPage.coverage.regions.eu.badge'),
  },
])

const extras = computed(() => [
  {
    icon: 'lucide:clipboard-list',
    title: t('shippingPage.extras.items.instructions.title'),
    description: t('shippingPage.extras.items.instructions.description'),
  },
  {
    icon: 'lucide:leaf',
    title: t('shippingPage.extras.items.sustainability.title'),
    description: t('shippingPage.extras.items.sustainability.description'),
  },
  {
    icon: 'lucide:life-buoy',
    title: t('shippingPage.extras.items.support.title'),
    description: t('shippingPage.extras.items.support.description'),
  },
])

const timeline = computed(() => [
  {
    title: t('shippingPage.timeline.steps.method.title'),
    description: t('shippingPage.timeline.steps.method.description'),
  },
  {
    title: t('shippingPage.timeline.steps.pack.title'),
    description: t('shippingPage.timeline.steps.pack.description'),
  },
  {
    title: t('shippingPage.timeline.steps.handoff.title'),
    description: t('shippingPage.timeline.steps.handoff.description'),
  },
  {
    title: t('shippingPage.timeline.steps.delivery.title'),
    description: t('shippingPage.timeline.steps.delivery.description'),
  },
])

const seoTitle = computed(() => t('shippingPage.seo.title'))
const seoDescription = computed(() => t('shippingPage.seo.description'))

const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': seoTitle.value,
  'url': toAbsoluteUrl('/shipping'),
  'description': seoDescription.value,
  'isPartOf': {
    '@type': 'WebSite',
    'name': 'Moldova Direct',
    'url': siteUrl,
  },
}))

useLandingSeo({
  title: seoTitle.value,
  description: seoDescription.value,
  image: '/icon.svg',
  imageAlt: t('shippingPage.hero.title'),
  pageType: 'webpage',
  keywords: [t('shippingPage.seo.title'), 'Moldova Direct', t('shippingPage.hero.badge')],
  breadcrumbs: [
    { name: t('common.home'), path: '/' },
    { name: t('shippingPage.hero.badge'), path: '/shipping' },
  ],
  structuredData: structuredData.value,
})
</script>

<style scoped>
/* ============================================
 * SHIPPING PAGE - LUXURY EDITORIAL DESIGN
 * ============================================ */

.shipping-page {
  background: var(--md-cream-light);
  color: var(--md-charcoal);
}

/* ============================================
 * HERO SECTION
 * ============================================ */

.hero-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--md-cream) 0%, var(--md-cream-light) 100%);
  padding: 8rem 0 10rem;
}

@media (min-width: 768px) {
  .hero-section {
    padding: 10rem 0 12rem;
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
  background: radial-gradient(circle, var(--md-wine-muted) 0%, transparent 70%);
  filter: blur(60px);
}

.glow-gold {
  position: absolute;
  left: -8rem;
  bottom: -8rem;
  width: 24rem;
  height: 24rem;
  background: radial-gradient(circle, var(--md-gold-muted) 0%, transparent 70%);
  filter: blur(60px);
}

.grain-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 2px 2px, rgba(139, 46, 59, 0.05) 1px, transparent 0);
  background-size: 40px 40px;
}

.hero-grid {
  position: relative;
  z-index: 10;
  display: grid;
  gap: 4rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1.6fr 1fr;
  }
}

.hero-content {
  max-width: 48rem;
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
  background: var(--md-gradient-gold-line);
}

.badge-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--md-gold);
}

.hero-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: var(--md-font-normal);
  line-height: 1.08;
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-family: var(--md-font-sans);
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 2rem;
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

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-gradient-gold);
  opacity: 0;
  transition: opacity var(--md-duration-normal) var(--md-ease-smooth);
}

.btn-primary span,
.btn-primary svg {
  position: relative;
  z-index: 1;
}

.btn-primary:hover {
  box-shadow: var(--md-shadow-gold-lg);
  transform: translateY(-3px);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 2rem;
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

.btn-secondary:hover {
  border-color: var(--md-gold);
  color: var(--md-gold-dark);
  transform: translateY(-2px);
  box-shadow: var(--md-shadow-md);
}

.btn-arrow {
  transition: transform var(--md-duration-normal) var(--md-ease-smooth);
}

.btn-primary:hover .btn-arrow,
.btn-secondary:hover .btn-arrow {
  transform: translateX(0.25rem);
}

.hero-notice {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
}

.notice-icon {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  padding: 0.5rem;
  background: var(--md-gold-muted);
  color: var(--md-gold);
  border-radius: var(--md-radius-lg);
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 0.25rem;
}

.notice-text {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  color: var(--md-gray-600);
}

.highlights-card {
  padding: 2rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  box-shadow: var(--md-shadow-lg);
}

.card-title {
  font-family: var(--md-font-serif);
  font-size: 1.5rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 0.5rem;
}

.card-subtitle {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
  margin-bottom: 1.5rem;
}

.highlights-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.highlight-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--md-cream);
  border-radius: var(--md-radius-xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  transition: var(--md-transition-all);
}

.highlight-item:hover {
  transform: translateX(4px);
  box-shadow: var(--md-shadow-md);
  border-color: var(--md-gold-muted);
}

.highlight-icon-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--md-gold-muted);
  border-radius: var(--md-radius-lg);
}

.highlight-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--md-gold);
}

.highlight-content {
  flex: 1;
}

.highlight-title {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 0.25rem;
}

.highlight-text {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-600);
}

/* ============================================
 * METHODS SECTION
 * ============================================ */

.methods-section {
  padding: 6rem 0;
  background: var(--md-cream);
}

@media (min-width: 768px) {
  .methods-section {
    padding: 8rem 0;
  }
}

.methods-grid {
  display: grid;
  gap: 4rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .methods-grid {
    grid-template-columns: 1.5fr 1fr;
  }
}

.section-header {
  margin-bottom: 3rem;
}

.section-badge {
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

.section-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: var(--md-font-normal);
  line-height: var(--md-leading-tight);
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 1rem;
}

.section-subtitle {
  font-family: var(--md-font-sans);
  font-size: clamp(0.9375rem, 1.5vw, 1.125rem);
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

.methods-cards {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .methods-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .methods-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) and (max-width: 1536px) {
  .methods-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1536px) {
  .methods-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

.method-card {
  padding: 2rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  transition: var(--md-transition-all);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.method-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--md-shadow-gold-lg);
  border-color: var(--md-gold);
}

.method-speed {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--md-font-sans);
  font-size: 0.8125rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-gold-dark);
  text-transform: uppercase;
  letter-spacing: var(--md-tracking-wide);
}

.speed-icon {
  width: 1rem;
  height: 1rem;
  color: var(--md-gold);
}

.method-title {
  font-family: var(--md-font-serif);
  font-size: 1.375rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
}

.method-description {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
  flex: 1;
}

.method-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: var(--md-border-thin) solid var(--md-gray-200);
  font-family: var(--md-font-sans);
  font-size: 0.8125rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-gray-700);
}

.note-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--md-gold);
}

/* ============================================
 * COVERAGE & EXTRAS SIDEBAR
 * ============================================ */

.coverage-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-card {
  padding: 2rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  box-shadow: var(--md-shadow-md);
}

.coverage-card {
  background: linear-gradient(135deg, var(--md-gold-muted) 0%, var(--md-cream-light) 100%);
}

.coverage-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.coverage-item {
  padding: 1rem;
  background: var(--md-cream);
  border-radius: var(--md-radius-lg);
  border: var(--md-border-thin) solid var(--md-gray-200);
}

.coverage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.coverage-title {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
}

.coverage-badge {
  font-family: var(--md-font-sans);
  font-size: 0.75rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-gold-dark);
  text-transform: uppercase;
  letter-spacing: var(--md-tracking-wide);
}

.coverage-text {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-600);
}

.extras-card {
  border-style: dashed;
}

.extras-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.extra-item {
  display: flex;
  gap: 1rem;
}

.extra-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  color: var(--md-gold);
  margin-top: 0.125rem;
}

.extra-content {
  flex: 1;
}

.extra-title {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 0.25rem;
}

.extra-text {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-600);
}

/* ============================================
 * TIMELINE SECTION
 * ============================================ */

.timeline-section {
  padding: 6rem 0;
  background: var(--md-cream-light);
}

@media (min-width: 768px) {
  .timeline-section {
    padding: 8rem 0;
  }
}

.timeline-header {
  margin-bottom: 3rem;
}

.timeline-steps {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .timeline-steps {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .timeline-steps {
    grid-template-columns: repeat(4, 1fr);
  }
}

.timeline-step {
  position: relative;
  padding: 2rem;
  background: var(--md-cream);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  transition: var(--md-transition-all);
}

.timeline-step:hover {
  transform: translateY(-4px);
  box-shadow: var(--md-shadow-xl);
  border-color: var(--md-gold-muted);
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-family: var(--md-font-serif);
  font-size: 1.25rem;
  font-weight: var(--md-font-bold);
  color: white;
  background: var(--md-gradient-gold);
  border-radius: var(--md-radius-full);
  box-shadow: var(--md-shadow-md);
}

.step-title {
  font-family: var(--md-font-serif);
  font-size: 1.25rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 0.75rem;
}

.step-description {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

/* ============================================
 * CTA SECTION
 * ============================================ */

.cta-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--md-cream-light) 0%, var(--md-cream) 100%);
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
  background: radial-gradient(circle, var(--md-gold-muted) 0%, transparent 70%);
  filter: blur(50px);
}

.glow-wine-cta {
  position: absolute;
  left: -6rem;
  bottom: 0;
  width: 20rem;
  height: 20rem;
  background: radial-gradient(circle, var(--md-wine-muted) 0%, transparent 70%);
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
  background: var(--md-gradient-gold);
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

.cta-notice {
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--md-gold-muted) 0%, var(--md-wine-muted) 100%);
  border-radius: var(--md-radius-xl);
  max-width: 36rem;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 640px) {
  .hero-buttons,
  .cta-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-secondary,
  .btn-primary-cta,
  .btn-secondary-cta {
    width: 100%;
    justify-content: center;
  }
}
</style>
