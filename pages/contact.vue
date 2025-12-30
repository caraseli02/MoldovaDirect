<template>
  <div class="contact-page">
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
              name="lucide:mail"
              class="badge-icon"
            />
            <span>{{ $t('contact.hero.badge', 'Contacto') }}</span>
          </div>

          <!-- Hero Title - Serif -->
          <h1 class="hero-title">
            {{ $t('contact.hero.title', 'We\'d Love to Hear From You') }}
          </h1>

          <!-- Subtitle -->
          <p class="hero-subtitle">
            {{ $t('contact.hero.subtitle', 'Whether you have questions about our products, need assistance with an order, or want to explore partnership opportunities – our team is here to help.') }}
          </p>

          <!-- Decorative Divider -->
          <div class="hero-divider">
            <commonIcon
              name="lucide:mail"
              class="divider-icon"
            />
            <div class="divider-line"></div>
            <commonIcon
              name="lucide:heart"
              class="divider-icon"
            />
            <div class="divider-line"></div>
            <commonIcon
              name="lucide:mail"
              class="divider-icon"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Form & Info Section -->
    <section class="contact-section">
      <div class="container">
        <div class="contact-grid">
          <!-- Contact Form -->
          <div class="form-wrapper">
            <div class="section-badge">
              <commonIcon
                name="lucide:message-circle"
                class="badge-icon-sm"
              />
              <span>{{ $t('contact.form.badge', 'Envíanos un Mensaje') }}</span>
            </div>

            <h2 class="section-title">
              {{ $t('contact.form.title', 'Send us a Message') }}
            </h2>

            <p class="section-subtitle">
              {{ $t('contact.form.subtitle', 'Fill out the form below and we\'ll get back to you within 24 hours.') }}
            </p>

            <form
              class="contact-form"
              @submit.prevent="handleSubmit"
            >
              <div class="form-group">
                <label
                  for="name"
                  class="form-label"
                >
                  <commonIcon
                    name="lucide:user"
                    class="label-icon"
                  />
                  {{ $t('contact.form.name', 'Name') }}
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="form-input"
                  :placeholder="$t('contact.form.namePlaceholder', 'Your full name')"
                />
              </div>

              <div class="form-group">
                <label
                  for="email"
                  class="form-label"
                >
                  <commonIcon
                    name="lucide:mail"
                    class="label-icon"
                  />
                  {{ $t('contact.form.email', 'Email') }}
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="form-input"
                  :placeholder="$t('contact.form.emailPlaceholder', 'your.email@example.com')"
                />
              </div>

              <div class="form-group">
                <label
                  for="subject"
                  class="form-label"
                >
                  <commonIcon
                    name="lucide:tag"
                    class="label-icon"
                  />
                  {{ $t('contact.form.subject', 'Subject') }}
                </label>
                <input
                  id="subject"
                  v-model="form.subject"
                  type="text"
                  required
                  class="form-input"
                  :placeholder="$t('contact.form.subjectPlaceholder', 'How can we help you?')"
                />
              </div>

              <div class="form-group">
                <label
                  for="message"
                  class="form-label"
                >
                  <commonIcon
                    name="lucide:message-square"
                    class="label-icon"
                  />
                  {{ $t('contact.form.message', 'Message') }}
                </label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="6"
                  required
                  class="form-input form-textarea"
                  :placeholder="$t('contact.form.messagePlaceholder', 'Tell us more about your inquiry...')"
                ></textarea>
              </div>

              <button
                type="submit"
                class="btn-primary-submit"
              >
                <span>{{ $t('contact.form.submit', 'Send Message') }}</span>
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
              </button>
            </form>
          </div>

          <!-- Contact Information -->
          <div class="info-wrapper">
            <div class="section-badge">
              <commonIcon
                name="lucide:info"
                class="badge-icon-sm"
              />
              <span>{{ $t('contact.info.badge', 'Información de Contacto') }}</span>
            </div>

            <h2 class="section-title">
              {{ $t('contact.info.title', 'Get in Touch') }}
            </h2>

            <p class="section-subtitle">
              {{ $t('contact.info.subtitle', 'Reach out to us through any of these channels. We\'re here to help.') }}
            </p>

            <div class="info-cards">
              <!-- Email Card -->
              <div class="info-card">
                <div class="info-icon-wrapper">
                  <commonIcon
                    name="lucide:mail"
                    class="info-icon"
                  />
                </div>
                <h3 class="info-title">
                  {{ $t('contact.info.email.title', 'Email') }}
                </h3>
                <div class="info-details">
                  <a
                    href="mailto:info@moldovadirect.com"
                    class="info-link"
                  >
                    info@moldovadirect.com
                  </a>
                  <a
                    href="mailto:support@moldovadirect.com"
                    class="info-link"
                  >
                    support@moldovadirect.com
                  </a>
                </div>
              </div>

              <!-- Phone Card -->
              <div class="info-card">
                <div class="info-icon-wrapper">
                  <commonIcon
                    name="lucide:phone"
                    class="info-icon"
                  />
                </div>
                <h3 class="info-title">
                  {{ $t('contact.info.phone.title', 'Phone') }}
                </h3>
                <div class="info-details">
                  <a
                    href="tel:+34910000000"
                    class="info-link"
                  >
                    +34 910 000 000
                  </a>
                  <p class="info-hours">
                    {{ $t('contact.info.phone.hours', 'Monday - Friday: 9:00 - 18:00') }}
                  </p>
                </div>
              </div>

              <!-- Office Card -->
              <div class="info-card">
                <div class="info-icon-wrapper">
                  <commonIcon
                    name="lucide:map-pin"
                    class="info-icon"
                  />
                </div>
                <h3 class="info-title">
                  {{ $t('contact.info.office.title', 'Office') }}
                </h3>
                <div class="info-details">
                  <p class="info-text">
                    Moldova Direct S.L.
                  </p>
                  <p class="info-text">
                    Madrid, Spain
                  </p>
                </div>
              </div>

              <!-- Social Card -->
              <div class="info-card">
                <div class="info-icon-wrapper">
                  <commonIcon
                    name="lucide:share-2"
                    class="info-icon"
                  />
                </div>
                <h3 class="info-title">
                  {{ $t('contact.info.social.title', 'Follow Us') }}
                </h3>
                <div class="info-details">
                  <div class="social-links">
                    <a
                      href="#"
                      class="social-link"
                      aria-label="Facebook"
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      class="social-link"
                      aria-label="Instagram"
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                      </svg>
                    </a>
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
import { ref } from 'vue'
import { CONTACT_INFO } from '~/constants/seo'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const form = ref<ContactForm>({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const handleSubmit = () => {
  // TODO: Implement form submission
  // Reset form
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }
  alert('Thank you for your message! We will get back to you soon.')
}

const description
  = 'Contact Moldova Direct for questions about Moldovan products, orders, or partnerships. We are here to help!'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  'name': 'Contact Moldova Direct',
  'url': toAbsoluteUrl('/contact'),
  description,
  'mainEntity': {
    '@type': 'Organization',
    'name': 'Moldova Direct',
    'url': siteUrl,
    'logo': toAbsoluteUrl('/icon.svg'),
    'contactPoint': [
      {
        '@type': 'ContactPoint',
        'contactType': 'customer service',
        'email': CONTACT_INFO.EMAIL.SUPPORT,
        'telephone': CONTACT_INFO.PHONE,
        'areaServed': 'ES',
        'availableLanguage': ['es', 'en', 'ro', 'ru'],
      },
    ],
  },
}

useLandingSeo({
  title: 'Contact Us - Moldova Direct',
  description,
  image: '/icon.svg',
  imageAlt: 'Customer support team ready to assist Moldova Direct shoppers',
  pageType: 'webpage',
  keywords: ['contact Moldova Direct', 'Moldovan products support', 'Moldova Direct customer service'],
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ],
  structuredData,
})
</script>

<style scoped>
/* ============================================
 * CONTACT PAGE - LUXURY EDITORIAL DESIGN
 * ============================================ */

.contact-page {
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
 * CONTACT SECTION
 * ============================================ */

.contact-section {
  padding: 6rem 0;
  background: var(--md-cream);
}

@media (min-width: 768px) {
  .contact-section {
    padding: 10rem 0;
  }
}

.contact-grid {
  display: grid;
  gap: 4rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .contact-grid {
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
  margin-bottom: 2.5rem;
}

/* ============================================
 * CONTACT FORM
 * ============================================ */

.form-wrapper,
.info-wrapper {
  max-width: 42rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  text-transform: uppercase;
  letter-spacing: var(--md-tracking-wide);
}

.label-icon {
  width: 1rem;
  height: 1rem;
  color: var(--md-gold);
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  font-family: var(--md-font-sans);
  font-size: 1rem;
  color: var(--md-charcoal);
  background: var(--md-cream-light);
  border: var(--md-border-thin) solid var(--md-gray-300);
  border-radius: var(--md-radius-xl);
  transition: var(--md-transition-all);
}

.form-input:focus {
  outline: none;
  border-color: var(--md-gold);
  box-shadow: 0 0 0 3px var(--md-gold-muted);
}

.form-input::placeholder {
  color: var(--md-gray-500);
}

.form-textarea {
  resize: vertical;
  min-height: 150px;
}

.btn-primary-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.875rem;
  padding: 1.25rem 2.5rem;
  margin-top: 1rem;
  background: var(--md-cream);
  color: var(--md-charcoal);
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: var(--md-font-semibold);
  letter-spacing: var(--md-tracking-wider);
  text-transform: uppercase;
  text-decoration: none;
  border: none;
  border-radius: var(--md-radius-full);
  box-shadow: var(--md-shadow-lg);
  transition: var(--md-transition-all);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.btn-primary-submit::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-gradient-gold);
  opacity: 0;
  transition: opacity var(--md-duration-normal) var(--md-ease-smooth);
}

.btn-primary-submit span,
.btn-primary-submit svg {
  position: relative;
  z-index: 1;
}

.btn-primary-submit:hover {
  box-shadow: var(--md-shadow-gold-lg);
  transform: translateY(-3px);
}

.btn-primary-submit:hover::before {
  opacity: 1;
}

.btn-arrow {
  transition: transform var(--md-duration-normal) var(--md-ease-smooth);
}

.btn-primary-submit:hover .btn-arrow {
  transform: translateX(0.25rem);
}

/* ============================================
 * CONTACT INFO
 * ============================================ */

.info-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  padding: 2rem;
  background: var(--md-cream-light);
  border-radius: var(--md-radius-2xl);
  border: var(--md-border-thin) solid var(--md-gray-200);
  transition: var(--md-transition-all);
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--md-shadow-xl);
  border-color: var(--md-gold-muted);
}

.info-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--md-gradient-gold);
  border-radius: var(--md-radius-xl);
  box-shadow: var(--md-shadow-md);
}

.info-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: white;
}

.info-title {
  font-family: var(--md-font-serif);
  font-size: 1.375rem;
  font-weight: var(--md-font-semibold);
  color: var(--md-charcoal);
  margin-bottom: 1rem;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-link {
  font-family: var(--md-font-sans);
  font-size: 1rem;
  color: var(--md-gray-700);
  text-decoration: none;
  transition: color var(--md-duration-fast) var(--md-ease-smooth);
}

.info-link:hover {
  color: var(--md-gold-dark);
}

.info-text {
  font-family: var(--md-font-sans);
  font-size: 1rem;
  color: var(--md-gray-700);
  line-height: var(--md-leading-relaxed);
}

.info-hours {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  color: var(--md-gray-600);
  font-style: italic;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--md-gray-700);
  background: var(--md-cream);
  border-radius: var(--md-radius-lg);
  border: var(--md-border-thin) solid var(--md-gray-300);
  transition: var(--md-transition-all);
}

.social-link:hover {
  color: var(--md-gold-dark);
  border-color: var(--md-gold);
  transform: translateY(-2px);
  box-shadow: var(--md-shadow-md);
}

/* Responsive */
@media (max-width: 1024px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .form-wrapper,
  .info-wrapper {
    max-width: 100%;
  }
}
</style>
