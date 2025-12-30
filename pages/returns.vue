<template>
  <div class="returns-page">
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
              name="lucide:package-x"
              class="badge-icon"
            />
            <span>{{ t('returns.badge', 'Returns & Refunds') }}</span>
          </div>

          <!-- Hero Title - Serif -->
          <h1 class="hero-title">
            {{ t('returns.title', 'Simple & Hassle-Free Returns') }}
          </h1>

          <!-- Subtitle -->
          <p class="hero-subtitle">
            {{ t('returns.description', 'We want you to love every product. If something isn\'t right, we\'re here to make it right.') }}
          </p>

          <!-- CTA Buttons -->
          <div class="hero-buttons">
            <NuxtLink
              :to="localePath('/contact')"
              class="btn-primary"
            >
              <span>{{ t('returns.cta.start', 'Start Return') }}</span>
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
              :to="localePath('/account/orders')"
              class="btn-secondary"
            >
              {{ t('returns.cta.orders', 'View Orders') }}
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

          <!-- Summary Cards -->
          <div class="summary-grid">
            <div
              v-for="item in summaryItems"
              :key="item.title"
              class="summary-card"
            >
              <div class="summary-metric">{{ item.metric }}</div>
              <div class="summary-title">{{ item.title }}</div>
              <div class="summary-description">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Eligibility & Resolution Section -->
    <section class="policy-section">
      <div class="container">
        <div class="policy-grid">
          <!-- Eligibility Card -->
          <div class="policy-card">
            <div class="card-header">
              <commonIcon
                name="lucide:check-circle"
                class="card-icon"
              />
              <h2 class="card-title">
                {{ t('returns.eligibility.title', 'Return Eligibility') }}
              </h2>
            </div>

            <p class="card-subtitle">
              {{ t('returns.eligibility.description', 'Items that qualify for returns') }}
            </p>

            <ul class="policy-list">
              <li class="policy-item">
                <commonIcon
                  name="lucide:check"
                  class="item-icon"
                />
                <div class="item-content">
                  <p class="item-title">{{ t('returns.eligibility.items.unopened.title', 'Unopened Products') }}</p>
                  <p class="item-text">{{ t('returns.eligibility.items.unopened.text', 'Unopened pantry items within 30 days of delivery') }}</p>
                </div>
              </li>
              <li class="policy-item">
                <commonIcon
                  name="lucide:check"
                  class="item-icon"
                />
                <div class="item-content">
                  <p class="item-title">{{ t('returns.eligibility.items.damaged.title', 'Damaged Items') }}</p>
                  <p class="item-text">{{ t('returns.eligibility.items.damaged.text', 'Report within 7 days for replacement or refund') }}</p>
                </div>
              </li>
              <li class="policy-item">
                <commonIcon
                  name="lucide:check"
                  class="item-icon"
                />
                <div class="item-content">
                  <p class="item-title">{{ t('returns.eligibility.items.incorrect.title', 'Incorrect Orders') }}</p>
                  <p class="item-text">{{ t('returns.eligibility.items.incorrect.text', 'Wrong items sent? We\'ll make it right immediately') }}</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Resolution Card -->
          <div class="policy-card">
            <div class="card-header">
              <commonIcon
                name="lucide:rotate-ccw"
                class="card-icon"
              />
              <h2 class="card-title">
                {{ t('returns.resolution.title', 'Resolution Options') }}
              </h2>
            </div>

            <p class="card-subtitle">
              {{ t('returns.resolution.description', 'Choose the solution that works best for you') }}
            </p>

            <ul class="policy-list">
              <li class="policy-item">
                <commonIcon
                  name="lucide:euro"
                  class="item-icon"
                />
                <div class="item-content">
                  <p class="item-title">{{ t('returns.resolution.items.refund.title', 'Full Refund') }}</p>
                  <p class="item-text">{{ t('returns.resolution.items.refund.text', 'Money back to your original payment method within 2-5 business days') }}</p>
                </div>
              </li>
              <li class="policy-item">
                <commonIcon
                  name="lucide:gift"
                  class="item-icon"
                />
                <div class="item-content">
                  <p class="item-title">{{ t('returns.resolution.items.credit.title', 'Store Credit') }}</p>
                  <p class="item-text">{{ t('returns.resolution.items.credit.text', 'Instant store credit with 10% bonus for future purchases') }}</p>
                </div>
              </li>
              <li class="policy-item">
                <commonIcon
                  name="lucide:package"
                  class="item-icon"
                />
                <div class="item-content">
                  <p class="item-title">{{ t('returns.resolution.items.exchange.title', 'Exchange') }}</p>
                  <p class="item-text">{{ t('returns.resolution.items.exchange.text', 'Swap for a different product at no extra cost') }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Return Steps Section -->
    <section class="steps-section">
      <div class="container">
        <div class="section-header">
          <div class="section-badge">
            <commonIcon
              name="lucide:list-checks"
              class="badge-icon-sm"
            />
            <span>{{ t('returns.steps.badge', 'How It Works') }}</span>
          </div>

          <h2 class="section-title">
            {{ t('returns.steps.title', 'Return Process in 4 Easy Steps') }}
          </h2>

          <p class="section-subtitle">
            {{ t('returns.steps.description', 'Simple and straightforward - we handle the rest') }}
          </p>
        </div>

        <ol class="steps-grid">
          <li class="step-card">
            <div class="step-number">1</div>
            <h3 class="step-title">{{ t('returns.steps.items.contact.title', 'Contact Us') }}</h3>
            <p class="step-text">{{ t('returns.steps.items.contact.text', 'Reach out via email, phone, or chat with your order details') }}</p>
          </li>

          <li class="step-card">
            <div class="step-number">2</div>
            <h3 class="step-title">{{ t('returns.steps.items.approval.title', 'Get Approval') }}</h3>
            <p class="step-text">{{ t('returns.steps.items.approval.text', 'We\'ll review and approve your return request within 24 hours') }}</p>
          </li>

          <li class="step-card">
            <div class="step-number">3</div>
            <h3 class="step-title">{{ t('returns.steps.items.ship.title', 'Ship It Back') }}</h3>
            <p class="step-text">{{ t('returns.steps.items.ship.text', 'Use our prepaid label (if eligible) or your preferred shipping method') }}</p>
          </li>

          <li class="step-card">
            <div class="step-number">4</div>
            <h3 class="step-title">{{ t('returns.steps.items.refund.title', 'Get Refunded') }}</h3>
            <p class="step-text">{{ t('returns.steps.items.refund.text', 'Receive your refund or store credit once we receive the return') }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Additional Info Section -->
    <section class="info-section">
      <div class="container">
        <div class="info-grid">
          <!-- Fees Card -->
          <div class="info-card">
            <commonIcon
              name="lucide:wallet"
              class="info-icon"
            />
            <h3 class="info-title">{{ t('returns.fees.title', 'Return Fees') }}</h3>
            <p class="info-description">{{ t('returns.fees.description', 'Transparent pricing for return shipping') }}</p>

            <ul class="info-list">
              <li
                v-for="item in fees"
                :key="item"
                class="info-list-item"
              >
                <commonIcon
                  name="lucide:circle"
                  class="list-dot"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Expectations Card -->
          <div class="info-card">
            <commonIcon
              name="lucide:clock"
              class="info-icon"
            />
            <h3 class="info-title">{{ t('returns.expectations.title', 'What to Expect') }}</h3>
            <p class="info-description">{{ t('returns.expectations.description', 'Timeline and process details') }}</p>

            <ul class="info-list">
              <li
                v-for="item in expectations"
                :key="item"
                class="info-list-item"
              >
                <commonIcon
                  name="lucide:circle"
                  class="list-dot"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Support Card -->
          <div class="info-card support-card">
            <commonIcon
              name="lucide:headphones"
              class="info-icon"
            />
            <h3 class="info-title">{{ t('returns.support.title', 'Need Help?') }}</h3>
            <p class="info-description">{{ t('returns.support.description', 'Our team is here to assist you') }}</p>

            <NuxtLink
              :to="localePath('/contact')"
              class="support-link"
            >
              <span>{{ t('returns.support.cta', 'Contact Support') }}</span>
              <commonIcon
                name="lucide:arrow-right"
                class="link-arrow"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const summaryItems = computed(() => [
  {
    title: t('returns.summary.window.title'),
    metric: t('returns.summary.window.metric'),
    description: t('returns.summary.window.description'),
  },
  {
    title: t('returns.summary.condition.title'),
    metric: t('returns.summary.condition.metric'),
    description: t('returns.summary.condition.description'),
  },
  {
    title: t('returns.summary.support.title'),
    metric: t('returns.summary.support.metric'),
    description: t('returns.summary.support.description'),
  },
  {
    title: t('returns.summary.refunds.title'),
    metric: t('returns.summary.refunds.metric'),
    description: t('returns.summary.refunds.description'),
  },
])

const fees = computed(() => [
  t('returns.fees.items.ourError'),
  t('returns.fees.items.customerChoice'),
  t('returns.fees.items.inspection'),
])

const expectations = computed(() => [
  t('returns.expectations.items.scan'),
  t('returns.expectations.items.refundTimeline'),
  t('returns.expectations.items.updates'),
])

const description
  = 'Understand Moldova Direct return windows, refund eligibility, and how to request support for Moldovan food and wine orders.'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': 'Returns & Refunds',
  'url': toAbsoluteUrl('/returns'),
  description,
  'isPartOf': {
    '@type': 'WebSite',
    'name': 'Moldova Direct',
    'url': siteUrl,
  },
  'mainEntity': {
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How long do I have to request a return?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Returns for unopened pantry items are available within 30 days of delivery. Damaged or incorrect deliveries should be reported within 7 days so we can arrange replacements.',
        },
      },
      {
        '@type': 'Question',
        'name': 'How do refunds work?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Approved refunds are issued to your original payment method or as store credit within 2-5 business days after the return is received and inspected.',
        },
      },
    ],
  },
}

useLandingSeo({
  title: 'Returns & Refunds - Moldova Direct',
  description,
  image: '/icon.svg',
  imageAlt: 'Customer rep assisting with Moldova Direct return request',
  pageType: 'webpage',
  keywords: ['Moldova Direct returns', 'Moldova Direct refund policy', 'Moldovan products returns'],
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Returns', path: '/returns' },
  ],
  structuredData,
})
</script>

<style scoped>
/* ============================================
 * RETURNS PAGE - LUXURY EDITORIAL DESIGN
 * ============================================ */

.returns-page {
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
  margin: 0 auto 2.5rem;
  font-family: var(--md-font-sans);
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
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

.summary-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  max-width: 48rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.summary-card {
  padding: 1.5rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  text-align: center;
  transition: var(--md-transition-all);
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--md-shadow-md);
  border-color: var(--md-gold-muted);
}

.summary-metric {
  font-family: var(--md-font-serif);
  font-size: 2rem;
  font-weight: var(--md-font-bold);
  color: var(--md-gold-dark);
  margin-bottom: 0.5rem;
}

.summary-title {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  text-transform: uppercase;
  letter-spacing: var(--md-tracking-wide);
  margin-bottom: 0.5rem;
}

.summary-description {
  font-family: var(--md-font-sans);
  font-size: 0.8125rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-600);
}

/* ============================================
 * POLICY SECTION
 * ============================================ */

.policy-section {
  padding: 6rem 0;
  background: var(--md-cream);
}

@media (min-width: 768px) {
  .policy-section {
    padding: 8rem 0;
  }
}

.policy-grid {
  display: grid;
  gap: 3rem;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .policy-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.policy-card {
  padding: 3rem 2.5rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  box-shadow: var(--md-shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card-icon {
  width: 2rem;
  height: 2rem;
  color: var(--md-gold);
}

.card-title {
  font-family: var(--md-font-serif);
  font-size: 1.75rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
}

.card-subtitle {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
  margin-bottom: 2rem;
}

.policy-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.policy-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.item-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  color: var(--md-gold);
  margin-top: 0.125rem;
}

.item-content {
  flex: 1;
}

.item-title {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 0.25rem;
}

.item-text {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-600);
}

/* ============================================
 * STEPS SECTION
 * ============================================ */

.steps-section {
  padding: 6rem 0;
  background: var(--md-cream-light);
}

@media (min-width: 768px) {
  .steps-section {
    padding: 8rem 0;
  }
}

.section-header {
  max-width: 48rem;
  margin: 0 auto 4rem;
  text-align: center;
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

.steps-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .steps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .steps-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.step-card {
  padding: 2rem;
  background: var(--md-cream);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  transition: var(--md-transition-all);
}

.step-card:hover {
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

.step-text {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

/* ============================================
 * INFO SECTION
 * ============================================ */

.info-section {
  padding: 6rem 0;
  background: var(--md-cream);
}

@media (min-width: 768px) {
  .info-section {
    padding: 8rem 0;
  }
}

.info-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.info-card {
  padding: 2.5rem 2rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  box-shadow: var(--md-shadow-md);
}

.info-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--md-gold);
  margin-bottom: 1.5rem;
}

.info-title {
  font-family: var(--md-font-serif);
  font-size: 1.375rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 0.75rem;
}

.info-description {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
  margin-bottom: 1.5rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

.list-dot {
  width: 0.5rem;
  height: 0.5rem;
  flex-shrink: 0;
  color: var(--md-gold);
  margin-top: 0.5rem;
}

.support-card {
  background: linear-gradient(135deg, var(--md-gold-muted) 0%, var(--md-cream-light) 100%);
}

.support-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.875rem 1.75rem;
  background: var(--md-cream);
  color: var(--md-charcoal);
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: var(--md-font-semibold);
  letter-spacing: var(--md-tracking-wider);
  text-transform: uppercase;
  text-decoration: none;
  border-radius: var(--md-radius-full);
  box-shadow: var(--md-shadow-md);
  transition: var(--md-transition-all);
}

.support-link:hover {
  box-shadow: var(--md-shadow-lg);
  transform: translateY(-2px);
}

.link-arrow {
  width: 1rem;
  height: 1rem;
  transition: transform var(--md-duration-fast) var(--md-ease-smooth);
}

.support-link:hover .link-arrow {
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
</style>
