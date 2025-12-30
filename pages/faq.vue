<template>
  <div class="faq-page">
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
              name="lucide:help-circle"
              class="badge-icon"
            />
            <span>{{ $t('faqPage.badge', 'FAQ') }}</span>
          </div>

          <!-- Hero Title - Serif -->
          <h1 class="hero-title">
            {{ $t('faqPage.title', 'Frequently Asked Questions') }}
          </h1>

          <!-- Subtitle -->
          <p class="hero-subtitle">
            {{ $t('faqPage.description', 'Find answers to common questions about our products, shipping, returns, and more.') }}
          </p>

          <!-- Quick Stats -->
          <div class="hero-stats">
            <div class="stat-item">
              <commonIcon
                name="lucide:clock"
                class="stat-icon"
              />
              <span>{{ $t('faqPage.responseTime', '24h Response Time') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <commonIcon
                name="lucide:message-circle"
                class="stat-icon"
              />
              <span>{{ $t('faqPage.languages', '4 Languages') }}</span>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="hero-buttons">
            <NuxtLink
              :to="localePath('/contact')"
              class="btn-primary"
            >
              <span>{{ $t('faqPage.ctaPrimary', 'Contact Support') }}</span>
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
              :to="localePath('/track-order')"
              class="btn-secondary"
            >
              {{ $t('faqPage.ctaSecondary', 'Track Order') }}
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
          <div class="hero-divider">
            <commonIcon
              name="lucide:help-circle"
              class="divider-icon"
            />
            <div class="divider-line"></div>
            <commonIcon
              name="lucide:heart"
              class="divider-icon"
            />
            <div class="divider-line"></div>
            <commonIcon
              name="lucide:help-circle"
              class="divider-icon"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Content Section -->
    <section class="faq-section">
      <div class="container">
        <div class="faq-grid">
          <!-- FAQ Sections -->
          <div class="faq-main">
            <div
              v-for="section in faqSections"
              :key="section.id"
              class="faq-category"
            >
              <!-- Category Header -->
              <div class="category-header">
                <div class="section-badge">
                  <commonIcon
                    name="lucide:circle-help"
                    class="badge-icon-sm"
                  />
                  <span>{{ section.title }}</span>
                </div>
              </div>

              <!-- FAQ Items -->
              <div class="faq-items">
                <article
                  v-for="item in section.items"
                  :key="item.question"
                  class="faq-item"
                >
                  <h3 class="faq-question">
                    <commonIcon
                      name="lucide:help-circle"
                      class="question-icon"
                    />
                    {{ item.question }}
                  </h3>
                  <p class="faq-answer">
                    {{ item.answer }}
                  </p>
                </article>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="faq-sidebar">
            <!-- Support Highlights Card -->
            <div class="sidebar-card">
              <div class="card-header">
                <commonIcon
                  name="lucide:sparkles"
                  class="card-icon"
                />
                <h2 class="card-title">
                  {{ $t('faqPage.highlights.title', 'Why Choose Us') }}
                </h2>
              </div>

              <ul class="highlights-list">
                <li
                  v-for="highlight in supportHighlights"
                  :key="highlight"
                  class="highlight-item"
                >
                  <commonIcon
                    name="lucide:check-circle"
                    class="highlight-icon"
                  />
                  <span>{{ highlight }}</span>
                </li>
              </ul>

              <div class="highlight-notice">
                <p class="notice-title">
                  {{ $t('faqPage.highlights.turnaround.title', '24h Turnaround') }}
                </p>
                <p class="notice-text">
                  {{ $t('faqPage.highlights.turnaround.description', 'We respond to all inquiries within 24 hours.') }}
                </p>
              </div>
            </div>

            <!-- Quick Links Card -->
            <div class="sidebar-card">
              <div class="card-header">
                <commonIcon
                  name="lucide:arrow-right-circle"
                  class="card-icon"
                />
                <h2 class="card-title">
                  {{ $t('faqPage.needMore.title', 'Need More Help?') }}
                </h2>
              </div>

              <p class="card-subtitle">
                {{ $t('faqPage.needMore.description', 'Explore these resources for additional information.') }}
              </p>

              <div class="quick-links">
                <NuxtLink
                  v-for="link in quickLinks"
                  :key="link.to"
                  :to="link.to"
                  class="quick-link"
                >
                  <div class="link-content">
                    <commonIcon
                      name="lucide:arrow-right"
                      class="link-icon"
                    />
                    <span>{{ link.label }}</span>
                  </div>
                  <commonIcon
                    name="lucide:chevron-right"
                    class="link-chevron"
                  />
                </NuxtLink>
              </div>

              <div class="highlight-notice">
                <p class="notice-title">
                  {{ $t('faqPage.needMore.commitment.title', 'Our Commitment') }}
                </p>
                <p class="notice-text">
                  {{ $t('faqPage.needMore.commitment.description', 'We\'re here to ensure you have the best experience.') }}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { toAbsoluteUrl } = useSiteUrl()

const pageDescription = computed(() => t('faqPage.seo.description'))

const faqSections = computed(() => [
  {
    id: 'orders',
    title: t('faqPage.sections.orders.title'),
    items: [
      {
        question: t('faqPage.sections.orders.items.delivery.question'),
        answer: t('faqPage.sections.orders.items.delivery.answer'),
      },
      {
        question: t('faqPage.sections.orders.items.shippingCosts.question'),
        answer: t('faqPage.sections.orders.items.shippingCosts.answer'),
      },
      {
        question: t('faqPage.sections.orders.items.updates.question'),
        answer: t('faqPage.sections.orders.items.updates.answer'),
      },
    ],
  },
  {
    id: 'payments',
    title: t('faqPage.sections.payments.title'),
    items: [
      {
        question: t('faqPage.sections.payments.items.methods.question'),
        answer: t('faqPage.sections.payments.items.methods.answer'),
      },
      {
        question: t('faqPage.sections.payments.items.invoices.question'),
        answer: t('faqPage.sections.payments.items.invoices.answer'),
      },
      {
        question: t('faqPage.sections.payments.items.addresses.question'),
        answer: t('faqPage.sections.payments.items.addresses.answer'),
      },
    ],
  },
  {
    id: 'returns',
    title: t('faqPage.sections.returns.title'),
    items: [
      {
        question: t('faqPage.sections.returns.items.policy.question'),
        answer: t('faqPage.sections.returns.items.policy.answer'),
      },
      {
        question: t('faqPage.sections.returns.items.damaged.question'),
        answer: t('faqPage.sections.returns.items.damaged.answer'),
      },
      {
        question: t('faqPage.sections.returns.items.process.question'),
        answer: t('faqPage.sections.returns.items.process.answer'),
      },
    ],
  },
  {
    id: 'products',
    title: t('faqPage.sections.products.title'),
    items: [
      {
        question: t('faqPage.sections.products.items.authenticity.question'),
        answer: t('faqPage.sections.products.items.authenticity.answer'),
      },
      {
        question: t('faqPage.sections.products.items.storage.question'),
        answer: t('faqPage.sections.products.items.storage.answer'),
      },
      {
        question: t('faqPage.sections.products.items.allergens.question'),
        answer: t('faqPage.sections.products.items.allergens.answer'),
      },
    ],
  },
])

const quickLinks = computed(() => [
  { to: localePath('/shipping'), label: t('faqPage.quickLinks.shipping') },
  { to: localePath('/returns'), label: t('faqPage.quickLinks.returns') },
  { to: localePath('/track-order'), label: t('faqPage.quickLinks.tracking') },
  { to: localePath('/contact'), label: t('faqPage.quickLinks.contact') },
])

const supportHighlights = computed(() => [
  t('faqPage.highlights.items.dispatch'),
  t('faqPage.highlights.items.packaging'),
  t('faqPage.highlights.items.support'),
])

const structuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'url': toAbsoluteUrl('/faq'),
  'description': pageDescription.value,
  'mainEntity': faqSections.value.flatMap(section => section.items.map(item => ({
    '@type': 'Question',
    'name': item.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': item.answer,
    },
  }))),
}))

useLandingSeo({
  title: t('faqPage.seo.title'),
  description: pageDescription.value,
  image: '/icon.svg',
  imageAlt: t('faqPage.seo.imageAlt'),
  pageType: 'webpage',
  keywords: ['Moldova Direct FAQ', 'Moldova Direct shipping', 'Moldova Direct returns'],
  breadcrumbs: [
    { name: t('common.home'), path: '/' },
    { name: t('faqPage.title'), path: '/faq' },
  ],
  structuredData: structuredData.value,
})
</script>

<style scoped>
/* ============================================
 * FAQ PAGE - LUXURY EDITORIAL DESIGN
 * ============================================ */

.faq-page {
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
  background: var(--md-gradient-gold-line);
}

.badge-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--md-gold);
}

.hero-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: var(--md-font-normal);
  line-height: 1.08;
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  max-width: 42rem;
  margin: 0 auto 2rem;
  font-family: var(--md-font-sans);
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  color: var(--md-gray-700);
}

.stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--md-gold);
}

.stat-divider {
  width: 1px;
  height: 1.25rem;
  background: var(--md-gray-300);
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
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
  background: var(--md-gradient-gold-line);
}

/* ============================================
 * FAQ SECTION
 * ============================================ */

.faq-section {
  padding: 6rem 0;
  background: var(--md-cream);
}

@media (min-width: 768px) {
  .faq-section {
    padding: 8rem 0;
  }
}

.faq-grid {
  display: grid;
  gap: 4rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .faq-grid {
    grid-template-columns: 2fr 1fr;
    gap: 4rem;
  }
}

/* FAQ Main Content */
.faq-main {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.faq-category {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

.faq-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  padding: 2rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  transition: var(--md-transition-all);
}

.faq-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--md-shadow-xl);
  border-color: var(--md-gold-muted);
}

.faq-question {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  font-family: var(--md-font-serif);
  font-size: 1.25rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 1rem;
  line-height: var(--md-leading-snug);
}

.question-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--md-gold);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.faq-answer {
  font-family: var(--md-font-sans);
  font-size: 1rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
  padding-left: 2.5rem;
}

/* ============================================
 * SIDEBAR
 * ============================================ */

.faq-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: sticky;
  top: 2rem;
}

.sidebar-card {
  padding: 2rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  box-shadow: var(--md-shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.card-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--md-gold);
}

.card-title {
  font-family: var(--md-font-serif);
  font-size: 1.375rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
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
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

.highlight-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--md-gold);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.highlight-notice {
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--md-gold-muted) 0%, var(--md-wine-muted) 100%);
  border-radius: var(--md-radius-xl);
}

.notice-title {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 0.5rem;
}

.notice-text {
  font-family: var(--md-font-sans);
  font-size: 0.8125rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.quick-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--md-cream);
  border-radius: var(--md-radius-lg);
  border: var(--md-border-thin) solid var(--md-gray-200);
  text-decoration: none;
  transition: var(--md-transition-all);
}

.quick-link:hover {
  border-color: var(--md-gold);
  box-shadow: var(--md-shadow-md);
  transform: translateX(4px);
}

.link-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  font-weight: var(--md-font-medium);
  color: var(--md-charcoal);
}

.link-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--md-gold);
}

.link-chevron {
  width: 1rem;
  height: 1rem;
  color: var(--md-gray-500);
  transition: transform var(--md-duration-fast) var(--md-ease-smooth);
}

.quick-link:hover .link-chevron {
  transform: translateX(0.25rem);
}

/* Responsive */
@media (max-width: 640px) {
  .hero-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 1024px) {
  .faq-sidebar {
    position: static;
  }
}
</style>
