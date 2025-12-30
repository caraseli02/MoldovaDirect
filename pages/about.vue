<template>
  <div class="about-page">
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
              name="lucide:heart"
              class="badge-icon"
            />
            <span>{{ $t('about.hero.badge', 'Nuestra Historia') }}</span>
          </div>

          <!-- Hero Title - Serif -->
          <h1 class="hero-title">
            {{ $t('about.hero.title', 'Taste Moldova in Every Delivery') }}
          </h1>

          <!-- Subtitle -->
          <p class="hero-subtitle">
            {{ $t('about.hero.subtitle', 'Founded by Moldovan expats in Spain, we bring authentic flavors and traditions directly to your doorstep. From world-renowned wines to artisanal delicacies, every product tells a story.') }}
          </p>

          <!-- Decorative Divider -->
          <div class="hero-divider">
            <commonIcon
              name="lucide:grape"
              class="divider-icon"
            />
            <div class="divider-line"></div>
            <commonIcon
              name="lucide:heart"
              class="divider-icon"
            />
            <div class="divider-line"></div>
            <commonIcon
              name="lucide:grape"
              class="divider-icon"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Our Mission Section -->
    <section class="mission-section">
      <div class="container">
        <div class="mission-grid">
          <!-- Text Content -->
          <div class="mission-content">
            <div class="section-badge">
              <commonIcon
                name="lucide:compass"
                class="badge-icon-sm"
              />
              <span>{{ $t('about.mission.badge', 'Nuestra Misión') }}</span>
            </div>

            <h2 class="section-title">
              {{ $t('about.mission.title', 'Connecting Cultures Through Authentic Flavors') }}
            </h2>

            <div class="mission-text">
              <p>
                {{ $t('about.mission.text1', 'We are dedicated to bringing the rich flavors and traditions of Moldova directly to your doorstep. Our mission is to connect the Moldovan diaspora and food enthusiasts in Spain with the authentic tastes of Moldova.') }}
              </p>
              <p>
                {{ $t('about.mission.text2', 'From world-renowned wines to traditional preserves and delicacies, every product we offer carries the essence of Moldovan heritage and craftsmanship.') }}
              </p>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <commonIcon
                  name="lucide:package-check"
                  class="icon"
                />
              </div>
              <div class="stat-number">500+</div>
              <div class="stat-label">{{ $t('about.stats.products', 'Productos Auténticos') }}</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <commonIcon
                  name="lucide:users"
                  class="icon"
                />
              </div>
              <div class="stat-number">2000+</div>
              <div class="stat-label">{{ $t('about.stats.customers', 'Clientes Felices') }}</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <commonIcon
                  name="lucide:truck"
                  class="icon"
                />
              </div>
              <div class="stat-number">48h</div>
              <div class="stat-label">{{ $t('about.stats.delivery', 'Entrega Rápida') }}</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <commonIcon
                  name="lucide:shield-check"
                  class="icon"
                />
              </div>
              <div class="stat-number">100%</div>
              <div class="stat-label">{{ $t('about.stats.authentic', 'Autenticidad') }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="features-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="section-badge">
            <commonIcon
              name="lucide:star"
              class="badge-icon-sm"
            />
            <span>{{ $t('about.features.badge', 'Por Qué Elegirnos') }}</span>
          </div>

          <h2 class="section-title">
            {{ $t('about.features.title', 'Excellence in Every Detail') }}
          </h2>

          <p class="section-subtitle">
            {{ $t('about.features.subtitle', 'We go beyond delivery – we bring you an authentic taste of Moldova with uncompromising quality and care.') }}
          </p>
        </div>

        <!-- Features Grid -->
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <commonIcon
                name="lucide:handshake"
                class="feature-icon"
              />
            </div>
            <h3 class="feature-title">{{ $t('about.features.partnerships.title', 'Direct Partnerships') }}</h3>
            <p class="feature-text">{{ $t('about.features.partnerships.text', 'We work directly with Moldovan producers, ensuring authenticity and supporting local artisans.') }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <commonIcon
                name="lucide:badge-check"
                class="feature-icon"
              />
            </div>
            <h3 class="feature-title">{{ $t('about.features.quality.title', 'Guaranteed Quality') }}</h3>
            <p class="feature-text">{{ $t('about.features.quality.text', 'Every product meets the highest standards – from selection to delivery, quality is our promise.') }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <commonIcon
                name="lucide:zap"
                class="feature-icon"
              />
            </div>
            <h3 class="feature-title">{{ $t('about.features.delivery.title', 'Fast Delivery') }}</h3>
            <p class="feature-text">{{ $t('about.features.delivery.text', 'Reliable delivery across Spain within 48 hours – your products arrive fresh and ready to enjoy.') }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <commonIcon
                name="lucide:euro"
                class="feature-icon"
              />
            </div>
            <h3 class="feature-title">{{ $t('about.features.pricing.title', 'Transparent Pricing') }}</h3>
            <p class="feature-text">{{ $t('about.features.pricing.text', 'Competitive prices with no hidden fees – what you see is what you pay.') }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <commonIcon
                name="lucide:headphones"
                class="feature-icon"
              />
            </div>
            <h3 class="feature-title">{{ $t('about.features.support.title', 'Multilingual Support') }}</h3>
            <p class="feature-text">{{ $t('about.features.support.text', 'Customer support in Spanish, English, Romanian, and Russian – we speak your language.') }}</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <commonIcon
                name="lucide:sparkles"
                class="feature-icon"
              />
            </div>
            <h3 class="feature-title">{{ $t('about.features.curated.title', 'Curated Selection') }}</h3>
            <p class="feature-text">{{ $t('about.features.curated.text', 'Hand-picked products from the finest producers – every item is carefully selected for you.') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Story Section -->
    <section class="story-section">
      <div class="container">
        <div class="story-grid">
          <!-- Story Content -->
          <div class="story-content">
            <div class="section-badge">
              <commonIcon
                name="lucide:book-open"
                class="badge-icon-sm"
              />
              <span>{{ $t('about.story.badge', 'Nuestra Historia') }}</span>
            </div>

            <h2 class="section-title">
              {{ $t('about.story.title', 'From Nostalgia to a Thriving Community') }}
            </h2>

            <div class="story-text">
              <p>
                {{ $t('about.story.text1', 'Founded by Moldovan expats living in Spain, Moldova Direct was born from a simple desire: to share the exceptional products of our homeland with our new home. We understand the nostalgia for authentic flavors and the difficulty in finding genuine Moldovan products abroad.') }}
              </p>
              <p>
                {{ $t('about.story.text2', 'That\'s why we\'ve established direct relationships with trusted producers in Moldova, ensuring that every product we offer meets the highest standards of quality and authenticity. From family-owned wineries to artisanal food producers, we work only with partners who share our commitment to excellence.') }}
              </p>
              <p>
                {{ $t('about.story.text3', 'Today, we\'re proud to serve thousands of customers across Spain, bringing them not just products, but a taste of home and a connection to Moldovan culture.') }}
              </p>
            </div>
          </div>

          <!-- Decorative Quote -->
          <div class="story-quote">
            <div class="quote-bg">
              <div class="quote-glow"></div>
            </div>
            <div class="quote-content">
              <commonIcon
                name="lucide:quote"
                class="quote-icon"
              />
              <blockquote class="quote-text">
                {{ $t('about.story.quote', 'Every product tells a story of tradition, craftsmanship, and the rich heritage of Moldova.') }}
              </blockquote>
              <div class="quote-author">
                <div class="author-name">{{ $t('about.story.author', 'Moldova Direct Team') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

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
              name="lucide:mail"
              class="badge-icon-sm"
            />
            <span>{{ $t('about.cta.eyebrow', 'Ponte en Contacto') }}</span>
          </div>

          <!-- CTA Title - Serif -->
          <h2 class="cta-title">
            {{ $t('about.cta.title', 'Have Questions? We\'d Love to Hear From You') }}
          </h2>

          <!-- CTA Subtitle -->
          <p class="cta-subtitle">
            {{ $t('about.cta.subtitle', 'Whether you have questions about our products, need help with an order, or just want to say hello – our team is here to help.') }}
          </p>

          <!-- CTA Buttons -->
          <div class="cta-buttons">
            <NuxtLink
              :to="localePath('/contact')"
              class="btn-primary-cta"
            >
              <span>{{ $t('about.cta.contactButton', 'Contacta con Nosotros') }}</span>
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
              :to="localePath('/products')"
              class="btn-secondary-cta"
            >
              {{ $t('about.cta.shopButton', 'Explora Productos') }}
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
              name="lucide:heart"
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
const localePath = useLocalePath()
const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const description
  = 'Learn about Moldova Direct, your trusted source for authentic Moldovan products in Spain. Direct from producers to your home.'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  'name': 'About Moldova Direct',
  'url': toAbsoluteUrl('/about'),
  description,
  'primaryImageOfPage': {
    '@type': 'ImageObject',
    'url': toAbsoluteUrl('/icon.svg'),
  },
  'mainEntity': {
    '@type': 'Organization',
    'name': 'Moldova Direct',
    'url': siteUrl,
    'logo': toAbsoluteUrl('/icon.svg'),
  },
}

useLandingSeo({
  title: 'About Us - Moldova Direct',
  description,
  image: '/icon.svg',
  imageAlt: 'Moldova Direct team presenting Moldovan delicacies',
  pageType: 'webpage',
  keywords: ['Moldova Direct mission', 'about Moldova Direct', 'Moldovan products company'],
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ],
  structuredData,
})
</script>

<style scoped>
/* ============================================
 * ABOUT PAGE - LUXURY EDITORIAL DESIGN
 * ============================================ */

.about-page {
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
  background: var(--md-gradient-gold-line);
}

/* ============================================
 * MISSION SECTION
 * ============================================ */

.mission-section {
  padding: 6rem 0;
  background: var(--md-cream);
}

@media (min-width: 768px) {
  .mission-section {
    padding: 10rem 0;
  }
}

.mission-grid {
  display: grid;
  gap: 4rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .mission-grid {
    grid-template-columns: 1fr 1fr;
    gap: 6rem;
  }
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
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: var(--md-font-normal);
  line-height: var(--md-leading-tight);
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 2rem;
}

.mission-text {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: var(--md-font-sans);
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-card {
  position: relative;
  padding: 2rem 1.5rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  transition: var(--md-transition-all);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--md-shadow-xl);
  border-color: var(--md-gold-muted);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--md-gold-muted);
  border-radius: var(--md-radius-xl);
  color: var(--md-gold);
}

.stat-icon .icon {
  width: 1.5rem;
  height: 1.5rem;
}

.stat-number {
  font-family: var(--md-font-serif);
  font-size: 2.5rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  color: var(--md-gray-600);
  text-transform: uppercase;
  letter-spacing: var(--md-tracking-wide);
}

/* ============================================
 * FEATURES SECTION
 * ============================================ */

.features-section {
  padding: 6rem 0;
  background: var(--md-cream-light);
}

@media (min-width: 768px) {
  .features-section {
    padding: 10rem 0;
  }
}

.section-header {
  max-width: 48rem;
  margin: 0 auto 4rem;
  text-align: center;
}

.section-subtitle {
  max-width: 42rem;
  margin: 1.5rem auto 0;
  font-family: var(--md-font-sans);
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

.features-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  position: relative;
  padding: 2.5rem 2rem;
  background: var(--md-cream);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  transition: var(--md-transition-all);
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--md-shadow-gold-lg);
  border-color: var(--md-gold);
}

.feature-icon-wrapper {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--md-gradient-gold);
  border-radius: var(--md-radius-full);
  box-shadow: var(--md-shadow-md);
}

.feature-icon {
  width: 2rem;
  height: 2rem;
  color: white;
}

.feature-title {
  font-family: var(--md-font-serif);
  font-size: 1.5rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 1rem;
}

.feature-text {
  font-family: var(--md-font-sans);
  font-size: 0.9375rem;
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

/* ============================================
 * STORY SECTION
 * ============================================ */

.story-section {
  padding: 6rem 0;
  background: var(--md-cream);
}

@media (min-width: 768px) {
  .story-section {
    padding: 10rem 0;
  }
}

.story-grid {
  display: grid;
  gap: 4rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .story-grid {
    grid-template-columns: 1fr 1fr;
    gap: 6rem;
  }
}

.story-content {
  max-width: 42rem;
}

.story-text {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: var(--md-font-sans);
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  line-height: var(--md-leading-relaxed);
  color: var(--md-gray-700);
}

.story-quote {
  position: relative;
  padding: 3rem 2.5rem;
  background: linear-gradient(135deg, var(--md-wine-muted) 0%, var(--md-gold-muted) 100%);
  border-radius: var(--md-radius-3xl);
  overflow: hidden;
}

.quote-bg {
  position: absolute;
  inset: 0;
  opacity: 0.3;
}

.quote-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, var(--md-gold) 0%, transparent 70%);
  filter: blur(40px);
}

.quote-content {
  position: relative;
  z-index: 10;
}

.quote-icon {
  width: 3rem;
  height: 3rem;
  color: var(--md-gold);
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.quote-text {
  font-family: var(--md-font-serif);
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  line-height: var(--md-leading-snug);
  color: var(--md-charcoal);
  margin-bottom: 2rem;
  font-style: italic;
}

.quote-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-name {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-gray-700);
  text-transform: uppercase;
  letter-spacing: var(--md-tracking-wide);
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
