<template>
  <div class="terms-page">
    <!-- Hero Section - Luxury Editorial -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="glow-wine"></div>
        <div class="glow-gold"></div>
        <div class="grain-pattern"></div>
      </div>

      <div class="container">
        <div v-motion class="hero-content">
          <!-- Luxury Badge -->
          <div class="hero-badge">
            <span class="badge-line"></span>
            <commonIcon name="lucide:scale" class="badge-icon" />
            <span>{{ t('terms.badge', 'Legal') }}</span>
            <span class="badge-line"></span>
          </div>

          <!-- Hero Title - Serif -->
          <h1 class="hero-title">
            {{ t('terms.title', 'Terms & Conditions') }}
          </h1>

          <p class="hero-description">
            {{ t('terms.description', 'Please read these terms carefully before using our services') }}
          </p>

          <p class="last-updated">
            {{ t('terms.lastUpdated', 'Last updated') }}: {{ t('terms.lastUpdatedDate', 'January 2024') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Terms Content -->
    <section class="content-section">
      <div class="container">
        <div class="content-layout">
          <!-- Sidebar Navigation -->
          <aside class="sidebar">
            <div class="sidebar-sticky">
              <h3 class="sidebar-title">{{ t('terms.sections', 'Sections') }}</h3>
              <nav class="sidebar-nav">
                <a
                  v-for="section in sections"
                  :key="section.id"
                  :href="`#${section.id}`"
                  class="nav-link"
                >
                  {{ section.title }}
                </a>
              </nav>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="main-content">
            <!-- Section 1: Introduction -->
            <div id="introduction" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('terms.section1Badge', 'Section 1') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('terms.section1Title', 'Introduction') }}
              </h2>
              <p class="section-text">
                {{ t('terms.section1Text', 'These Terms and Conditions ("Terms") govern your use of the Moldova Direct website and services. By accessing or using our website, you agree to be bound by these Terms.') }}
              </p>
            </div>

            <!-- Section 2: Products and Services -->
            <div id="products-services" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('terms.section2Badge', 'Section 2') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('terms.section2Title', 'Products and Services') }}
              </h2>
              <p class="section-text">
                {{ t('terms.section2Text', 'Moldova Direct offers authentic Moldovan food and wine products for delivery within Spain. All products are subject to availability, and we reserve the right to limit quantities or discontinue products without prior notice.') }}
              </p>
            </div>

            <!-- Section 3: Pricing and Payment -->
            <div id="pricing-payment" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('terms.section3Badge', 'Section 3') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('terms.section3Title', 'Pricing and Payment') }}
              </h2>
              <ul class="section-list">
                <li>
                  <commonIcon name="lucide:check" class="list-icon" />
                  <span>{{ t('terms.section3Item1', 'All prices are displayed in EUR and include applicable taxes') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:check" class="list-icon" />
                  <span>{{ t('terms.section3Item2', 'We accept payment via Stripe, PayPal, and Cash on Delivery') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:check" class="list-icon" />
                  <span>{{ t('terms.section3Item3', 'Prices are subject to change without notice') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:check" class="list-icon" />
                  <span>{{ t('terms.section3Item4', 'Payment must be received before order processing') }}</span>
                </li>
              </ul>
            </div>

            <!-- Section 4: Shipping and Delivery -->
            <div id="shipping-delivery" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('terms.section4Badge', 'Section 4') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('terms.section4Title', 'Shipping and Delivery') }}
              </h2>
              <p class="section-text">
                {{ t('terms.section4Text', 'We deliver to addresses within Spain. Delivery times are typically 2-5 business days but may vary depending on location and product availability. Shipping costs are calculated at checkout based on order weight and delivery location.') }}
              </p>
            </div>

            <!-- Section 5: Returns and Refunds -->
            <div id="returns-refunds" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('terms.section5Badge', 'Section 5') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('terms.section5Title', 'Returns and Refunds') }}
              </h2>
              <p class="section-text">
                {{ t('terms.section5Text', 'We accept returns within 14 days of delivery for unopened, undamaged products in original packaging. Perishable items cannot be returned. Refunds will be processed within 7-10 business days after receiving the returned items.') }}
              </p>
            </div>

            <!-- Section 6: User Accounts -->
            <div id="user-accounts" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('terms.section6Badge', 'Section 6') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('terms.section6Title', 'User Accounts') }}
              </h2>
              <p class="section-text">
                {{ t('terms.section6Text', 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.') }}
              </p>
            </div>

            <!-- Section 7: Intellectual Property -->
            <div id="intellectual-property" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('terms.section7Badge', 'Section 7') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('terms.section7Title', 'Intellectual Property') }}
              </h2>
              <p class="section-text">
                {{ t('terms.section7Text', 'All content on this website, including text, graphics, logos, and images, is the property of Moldova Direct or its content suppliers and is protected by international copyright laws.') }}
              </p>
            </div>

            <!-- Section 8: Limitation of Liability -->
            <div id="limitation-liability" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('terms.section8Badge', 'Section 8') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('terms.section8Title', 'Limitation of Liability') }}
              </h2>
              <p class="section-text">
                {{ t('terms.section8Text', 'Moldova Direct shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or products.') }}
              </p>
            </div>

            <!-- Section 9: Governing Law -->
            <div id="governing-law" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('terms.section9Badge', 'Section 9') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('terms.section9Title', 'Governing Law') }}
              </h2>
              <p class="section-text">
                {{ t('terms.section9Text', 'These Terms shall be governed by and construed in accordance with the laws of Spain, without regard to its conflict of law provisions.') }}
              </p>
            </div>

            <!-- Section 10: Contact Information -->
            <div id="contact" class="content-card contact-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('terms.section10Badge', 'Section 10') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('terms.section10Title', 'Contact Information') }}
              </h2>
              <p class="section-text mb-6">
                {{ t('terms.section10Text', 'If you have any questions about these Terms, please contact us at:') }}
              </p>

              <div class="contact-grid">
                <div class="contact-item">
                  <commonIcon name="lucide:mail" class="contact-icon" />
                  <div>
                    <div class="contact-label">{{ t('terms.email', 'Email') }}</div>
                    <a href="mailto:legal@moldovadirect.com" class="contact-value">legal@moldovadirect.com</a>
                  </div>
                </div>

                <div class="contact-item">
                  <commonIcon name="lucide:phone" class="contact-icon" />
                  <div>
                    <div class="contact-label">{{ t('terms.phone', 'Phone') }}</div>
                    <a href="tel:+34910000000" class="contact-value">+34 910 000 000</a>
                  </div>
                </div>

                <div class="contact-item">
                  <commonIcon name="lucide:map-pin" class="contact-icon" />
                  <div>
                    <div class="contact-label">{{ t('terms.address', 'Address') }}</div>
                    <div class="contact-value">Moldova Direct S.L., Madrid, Spain</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// SEO Meta
useHead({
  title: t('terms.metaTitle', 'Terms & Conditions - Moldova Direct'),
  meta: [
    {
      name: 'description',
      content: t('terms.metaDescription', 'Read the terms and conditions for using Moldova Direct services and purchasing Moldovan products online.'),
    },
  ],
})

// Sections for navigation
const sections = computed(() => [
  { id: 'introduction', title: t('terms.section1Title', 'Introduction') },
  { id: 'products-services', title: t('terms.section2Title', 'Products and Services') },
  { id: 'pricing-payment', title: t('terms.section3Title', 'Pricing and Payment') },
  { id: 'shipping-delivery', title: t('terms.section4Title', 'Shipping and Delivery') },
  { id: 'returns-refunds', title: t('terms.section5Title', 'Returns and Refunds') },
  { id: 'user-accounts', title: t('terms.section6Title', 'User Accounts') },
  { id: 'intellectual-property', title: t('terms.section7Title', 'Intellectual Property') },
  { id: 'limitation-liability', title: t('terms.section8Title', 'Limitation of Liability') },
  { id: 'governing-law', title: t('terms.section9Title', 'Governing Law') },
  { id: 'contact', title: t('terms.section10Title', 'Contact Information') },
])
</script>

<style scoped>
/* ===== HERO SECTION ===== */
.hero-section {
  position: relative;
  padding: 8rem 0 6rem;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: var(--md-cream);
  z-index: 0;
}

.glow-wine {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(139, 46, 59, 0.15) 0%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}

.glow-gold {
  position: absolute;
  bottom: -10%;
  left: -10%;
  width: 40%;
  height: 40%;
  background: radial-gradient(circle, rgba(201, 162, 39, 0.12) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}

.grain-pattern {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03' /%3E%3C/svg%3E");
  opacity: 0.5;
  pointer-events: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(201, 162, 39, 0.1);
  border: 1px solid rgba(201, 162, 39, 0.2);
  border-radius: var(--md-radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--md-gold);
  margin-bottom: 2rem;
}

.badge-line {
  width: 24px;
  height: 1px;
  background: var(--md-gradient-gold-line);
}

.badge-icon {
  width: 18px;
  height: 18px;
  color: var(--md-gold);
}

.hero-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  color: rgba(10, 10, 10, 0.7);
  margin-bottom: 1.5rem;
}

.last-updated {
  font-size: 0.875rem;
  color: rgba(10, 10, 10, 0.5);
}

/* ===== CONTENT SECTION ===== */
.content-section {
  padding: 4rem 0 8rem;
  background: linear-gradient(to bottom, var(--md-cream) 0%, #fff 50%);
}

.content-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 4rem;
  align-items: start;
}

/* ===== SIDEBAR ===== */
.sidebar {
  position: relative;
}

.sidebar-sticky {
  position: sticky;
  top: 2rem;
}

.sidebar-title {
  font-family: var(--md-font-serif);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.5rem 0;
  font-size: 0.9375rem;
  color: rgba(10, 10, 10, 0.6);
  text-decoration: none;
  border-left: 2px solid transparent;
  padding-left: 1rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--md-gold);
  border-left-color: var(--md-gold);
  padding-left: 1.25rem;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-card {
  background: #fff;
  border: 1px solid rgba(10, 10, 10, 0.08);
  border-radius: var(--md-radius-2xl);
  padding: 2.5rem;
  box-shadow: var(--md-shadow-sm);
  transition: all 0.3s ease;
}

.content-card:hover {
  box-shadow: var(--md-shadow-lg);
  transform: translateY(-2px);
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  background: var(--md-gold);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: var(--md-radius-full);
  margin-bottom: 1.5rem;
}

.badge-line-short {
  width: 16px;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

.section-title {
  font-family: var(--md-font-serif);
  font-size: 1.875rem;
  font-weight: 500;
  color: var(--md-charcoal);
  margin-bottom: 1.25rem;
  letter-spacing: var(--md-tracking-tight);
}

.section-text {
  font-size: 1.0625rem;
  line-height: 1.75;
  color: rgba(10, 10, 10, 0.7);
}

.section-text.mb-6 {
  margin-bottom: 1.5rem;
}

/* ===== LISTS ===== */
.section-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: rgba(10, 10, 10, 0.7);
}

.list-icon {
  width: 20px;
  height: 20px;
  color: var(--md-gold);
  flex-shrink: 0;
  margin-top: 0.25rem;
}

/* ===== CONTACT CARD ===== */
.contact-card {
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.03) 0%, rgba(139, 46, 59, 0.03) 100%);
  border: 1px solid rgba(201, 162, 39, 0.15);
}

.contact-grid {
  display: grid;
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid rgba(10, 10, 10, 0.08);
  border-radius: var(--md-radius-xl);
  transition: all 0.3s ease;
}

.contact-item:hover {
  border-color: var(--md-gold);
  box-shadow: var(--md-shadow-md);
  transform: translateY(-2px);
}

.contact-icon {
  width: 24px;
  height: 24px;
  color: var(--md-gold);
  flex-shrink: 0;
}

.contact-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(10, 10, 10, 0.5);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.contact-value {
  font-size: 1.0625rem;
  color: var(--md-charcoal);
  text-decoration: none;
  transition: color 0.2s ease;
}

a.contact-value:hover {
  color: var(--md-gold);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .sidebar {
    order: 2;
  }

  .sidebar-sticky {
    position: static;
  }

  .main-content {
    order: 1;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 6rem 0 4rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.125rem;
  }

  .content-section {
    padding: 3rem 0 6rem;
  }

  .content-card {
    padding: 2rem 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .nav-link {
    border-left: none;
    border-bottom: 2px solid transparent;
    padding: 0.5rem 0.75rem;
  }

  .nav-link:hover {
    padding-left: 0.75rem;
    padding-bottom: 0.5rem;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 1rem;
  }

  .hero-badge {
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
  }

  .content-card {
    padding: 1.5rem;
  }

  .section-badge {
    font-size: 0.6875rem;
  }
}
</style>
