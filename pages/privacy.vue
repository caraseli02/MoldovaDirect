<template>
  <div class="privacy-page">
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
            <commonIcon name="lucide:shield-check" class="badge-icon" />
            <span>{{ t('privacy.badge', 'Privacy') }}</span>
            <span class="badge-line"></span>
          </div>

          <!-- Hero Title - Serif -->
          <h1 class="hero-title">
            {{ t('privacy.title', 'Privacy Policy') }}
          </h1>

          <p class="hero-description">
            {{ t('privacy.description', 'Your privacy is important to us. Learn how we collect, use, and protect your information') }}
          </p>

          <p class="last-updated">
            {{ t('privacy.lastUpdated', 'Last updated') }}: {{ t('privacy.lastUpdatedDate', 'January 2024') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Privacy Content -->
    <section class="content-section">
      <div class="container">
        <div class="content-layout">
          <!-- Sidebar Navigation -->
          <aside class="sidebar">
            <div class="sidebar-sticky">
              <h3 class="sidebar-title">{{ t('privacy.sections', 'Sections') }}</h3>
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
            <!-- Section 1: Information We Collect -->
            <div id="information-collect" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('privacy.section1Badge', 'Section 1') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('privacy.section1Title', 'Information We Collect') }}
              </h2>
              <p class="section-text mb-4">
                {{ t('privacy.section1Intro', 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include:') }}
              </p>
              <ul class="section-list">
                <li>
                  <commonIcon name="lucide:user" class="list-icon" />
                  <span>{{ t('privacy.section1Item1', 'Personal information (name, email, phone number)') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:map-pin" class="list-icon" />
                  <span>{{ t('privacy.section1Item2', 'Billing and shipping addresses') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:credit-card" class="list-icon" />
                  <span>{{ t('privacy.section1Item3', 'Payment information (processed securely by our payment providers)') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:package" class="list-icon" />
                  <span>{{ t('privacy.section1Item4', 'Order history and preferences') }}</span>
                </li>
              </ul>
            </div>

            <!-- Section 2: How We Use Your Information -->
            <div id="information-use" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('privacy.section2Badge', 'Section 2') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('privacy.section2Title', 'How We Use Your Information') }}
              </h2>
              <p class="section-text mb-4">
                {{ t('privacy.section2Intro', 'We use the information we collect to:') }}
              </p>
              <ul class="section-list">
                <li>
                  <commonIcon name="lucide:check" class="list-icon" />
                  <span>{{ t('privacy.section2Item1', 'Process and fulfill your orders') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:check" class="list-icon" />
                  <span>{{ t('privacy.section2Item2', 'Send order confirmations and shipping updates') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:check" class="list-icon" />
                  <span>{{ t('privacy.section2Item3', 'Provide customer support') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:check" class="list-icon" />
                  <span>{{ t('privacy.section2Item4', 'Send promotional communications (with your consent)') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:check" class="list-icon" />
                  <span>{{ t('privacy.section2Item5', 'Improve our products and services') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:check" class="list-icon" />
                  <span>{{ t('privacy.section2Item6', 'Comply with legal obligations') }}</span>
                </li>
              </ul>
            </div>

            <!-- Section 3: Information Sharing -->
            <div id="information-sharing" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('privacy.section3Badge', 'Section 3') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('privacy.section3Title', 'Information Sharing') }}
              </h2>
              <p class="section-text mb-4">
                {{ t('privacy.section3Intro', 'We do not sell, trade, or rent your personal information to third parties. We may share your information with:') }}
              </p>
              <ul class="section-list">
                <li>
                  <commonIcon name="lucide:users" class="list-icon" />
                  <span>{{ t('privacy.section3Item1', 'Service providers who help us operate our business') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:credit-card" class="list-icon" />
                  <span>{{ t('privacy.section3Item2', 'Payment processors to handle transactions') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:truck" class="list-icon" />
                  <span>{{ t('privacy.section3Item3', 'Shipping companies to deliver your orders') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:scale" class="list-icon" />
                  <span>{{ t('privacy.section3Item4', 'Legal authorities when required by law') }}</span>
                </li>
              </ul>
            </div>

            <!-- Section 4: Data Security -->
            <div id="data-security" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('privacy.section4Badge', 'Section 4') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('privacy.section4Title', 'Data Security') }}
              </h2>
              <p class="section-text">
                {{ t('privacy.section4Text', 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.') }}
              </p>
            </div>

            <!-- Section 5: Cookies -->
            <div id="cookies" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('privacy.section5Badge', 'Section 5') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('privacy.section5Title', 'Cookies') }}
              </h2>
              <p class="section-text">
                {{ t('privacy.section5Text', 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user preferences. You can control cookie settings through your browser.') }}
              </p>
            </div>

            <!-- Section 6: Your Rights -->
            <div id="your-rights" class="content-card highlight-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('privacy.section6Badge', 'Section 6') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('privacy.section6Title', 'Your Rights') }}
              </h2>
              <p class="section-text mb-4">
                {{ t('privacy.section6Intro', 'Under GDPR, you have the right to:') }}
              </p>
              <ul class="section-list">
                <li>
                  <commonIcon name="lucide:eye" class="list-icon" />
                  <span>{{ t('privacy.section6Item1', 'Access your personal data') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:edit" class="list-icon" />
                  <span>{{ t('privacy.section6Item2', 'Correct inaccurate data') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:trash-2" class="list-icon" />
                  <span>{{ t('privacy.section6Item3', 'Delete your data') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:x-circle" class="list-icon" />
                  <span>{{ t('privacy.section6Item4', 'Object to data processing') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:download" class="list-icon" />
                  <span>{{ t('privacy.section6Item5', 'Data portability') }}</span>
                </li>
                <li>
                  <commonIcon name="lucide:shield-off" class="list-icon" />
                  <span>{{ t('privacy.section6Item6', 'Withdraw consent') }}</span>
                </li>
              </ul>
            </div>

            <!-- Section 7: International Transfers -->
            <div id="international-transfers" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('privacy.section7Badge', 'Section 7') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('privacy.section7Title', 'International Transfers') }}
              </h2>
              <p class="section-text">
                {{ t('privacy.section7Text', 'Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data.') }}
              </p>
            </div>

            <!-- Section 8: Children's Privacy -->
            <div id="children-privacy" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('privacy.section8Badge', 'Section 8') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('privacy.section8Title', 'Children\'s Privacy') }}
              </h2>
              <p class="section-text">
                {{ t('privacy.section8Text', 'Our services are not intended for children under 16. We do not knowingly collect personal information from children under 16.') }}
              </p>
            </div>

            <!-- Section 9: Changes to This Policy -->
            <div id="policy-changes" class="content-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('privacy.section9Badge', 'Section 9') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('privacy.section9Title', 'Changes to This Policy') }}
              </h2>
              <p class="section-text">
                {{ t('privacy.section9Text', 'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on our website.') }}
              </p>
            </div>

            <!-- Section 10: Contact Us -->
            <div id="contact" class="content-card contact-card">
              <div class="section-badge">
                <span class="badge-line-short"></span>
                <span>{{ t('privacy.section10Badge', 'Section 10') }}</span>
              </div>
              <h2 class="section-title">
                {{ t('privacy.section10Title', 'Contact Us') }}
              </h2>
              <p class="section-text mb-6">
                {{ t('privacy.section10Text', 'If you have questions about this Privacy Policy or our data practices, please contact us:') }}
              </p>

              <div class="contact-grid">
                <div class="contact-item">
                  <commonIcon name="lucide:mail" class="contact-icon" />
                  <div>
                    <div class="contact-label">{{ t('privacy.email', 'Email') }}</div>
                    <a href="mailto:privacy@moldovadirect.com" class="contact-value">privacy@moldovadirect.com</a>
                  </div>
                </div>

                <div class="contact-item">
                  <commonIcon name="lucide:phone" class="contact-icon" />
                  <div>
                    <div class="contact-label">{{ t('privacy.phone', 'Phone') }}</div>
                    <a href="tel:+34910000000" class="contact-value">+34 910 000 000</a>
                  </div>
                </div>

                <div class="contact-item">
                  <commonIcon name="lucide:map-pin" class="contact-icon" />
                  <div>
                    <div class="contact-label">{{ t('privacy.address', 'Address') }}</div>
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
  title: t('privacy.metaTitle', 'Privacy Policy - Moldova Direct'),
  meta: [
    {
      name: 'description',
      content: t('privacy.metaDescription', 'Read our privacy policy to understand how Moldova Direct collects, uses, and protects your personal information.'),
    },
  ],
})

// Sections for navigation
const sections = computed(() => [
  { id: 'information-collect', title: t('privacy.section1Title', 'Information We Collect') },
  { id: 'information-use', title: t('privacy.section2Title', 'How We Use Your Information') },
  { id: 'information-sharing', title: t('privacy.section3Title', 'Information Sharing') },
  { id: 'data-security', title: t('privacy.section4Title', 'Data Security') },
  { id: 'cookies', title: t('privacy.section5Title', 'Cookies') },
  { id: 'your-rights', title: t('privacy.section6Title', 'Your Rights') },
  { id: 'international-transfers', title: t('privacy.section7Title', 'International Transfers') },
  { id: 'children-privacy', title: t('privacy.section8Title', 'Children\'s Privacy') },
  { id: 'policy-changes', title: t('privacy.section9Title', 'Changes to This Policy') },
  { id: 'contact', title: t('privacy.section10Title', 'Contact Us') },
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

.section-text.mb-4 {
  margin-bottom: 1rem;
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

/* ===== HIGHLIGHT CARD (GDPR Rights) ===== */
.highlight-card {
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.05) 0%, rgba(139, 46, 59, 0.05) 100%);
  border: 1px solid rgba(201, 162, 39, 0.2);
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
