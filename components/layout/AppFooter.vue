<template>
  <footer class="luxury-footer">
    <!-- Main Footer Content -->
    <div class="footer-main">
      <div class="footer-grid">
        <!-- Brand Column -->
        <div class="footer-brand">
          <NuxtLink
            :to="localePath('/')"
            class="brand-logo"
          >
            Moldova Direct
          </NuxtLink>
          <p class="brand-tagline">
            {{ $t('footer.info.about') }}
          </p>

          <!-- Social Links -->
          <div class="social-links">
            <a
              href="#"
              class="social-link"
              aria-label="Instagram"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                />
                <circle
                  cx="18"
                  cy="6"
                  r="1"
                  fill="currentColor"
                />
              </svg>
            </a>
            <a
              href="#"
              class="social-link"
              aria-label="Facebook"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Shop Links -->
        <div class="footer-column">
          <h4 class="column-title">
            {{ $t('common.shop') }}
          </h4>
          <ul class="footer-links">
            <li>
              <NuxtLink :to="localePath('/products')">
                {{ $t('nav.allProducts') || 'All Products' }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/products?category=wines')">
                {{ $t('nav.wines') || 'Wines' }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/products?category=gourmet')">
                {{ $t('nav.gourmet') || 'Gourmet' }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/products?category=gifts')">
                {{ $t('nav.gifts') || 'Gift Sets' }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Info Links -->
        <div class="footer-column">
          <h4 class="column-title">
            {{ $t('footer.info.title') }}
          </h4>
          <ul class="footer-links">
            <li>
              <NuxtLink :to="localePath('/about')">
                {{ $t('common.about') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/shipping')">
                {{ $t('footer.info.shipping') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/returns')">
                {{ $t('footer.help.returns') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/terms')">
                {{ $t('footer.info.terms') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Help Links -->
        <div class="footer-column">
          <h4 class="column-title">
            {{ $t('footer.help.title') }}
          </h4>
          <ul class="footer-links">
            <li>
              <NuxtLink :to="localePath('/contact')">
                {{ $t('footer.help.contact') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/faq')">
                {{ $t('footer.help.faq') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/track-order')">
                {{ $t('footer.help.track') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/privacy')">
                {{ $t('footer.info.privacy') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div class="footer-column footer-newsletter">
          <h4 class="column-title">
            {{ $t('footer.newsletter.title') }}
          </h4>
          <p class="newsletter-text">
            {{ $t('footer.newsletter.description') }}
          </p>
          <form
            class="newsletter-form"
            @submit.prevent="subscribeNewsletter"
          >
            <input
              v-model="email"
              type="email"
              :placeholder="$t('footer.newsletter.placeholder')"
              :disabled="isSubmitting"
              class="newsletter-input"
              required
            />
            <button
              type="submit"
              :disabled="isSubmitting"
              class="newsletter-btn"
            >
              <svg
                v-if="!isSubmitting"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <svg
                v-else
                class="animate-spin"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p class="copyright">
          &copy; {{ new Date().getFullYear() }} Moldova Direct. {{ $t('footer.copyright') || 'All rights reserved.' }}
        </p>

        <!-- Payment Methods -->
        <div class="payment-methods">
          <span class="payment-label">{{ $t('footer.payment.title') }}</span>
          <div class="payment-icons">
            <!-- Visa -->
            <div class="payment-icon">
              <svg
                viewBox="0 0 48 32"
                fill="none"
              >
                <rect
                  width="48"
                  height="32"
                  rx="4"
                  fill="white"
                />
                <path
                  d="M20.925 11h-3.085l-1.93 11.8h3.086L20.925 11zm8.696 7.65l1.623-4.47.934 4.47h-2.557zm3.436 4.17h2.852l-2.49-11.82h-2.631c-.592 0-1.091.34-1.312.87l-4.623 10.95h3.243l.645-1.78h3.965l.351 1.78zm-7.863-3.85c.013-3.12-4.31-3.29-4.281-4.68.009-.42.413-.87 1.297-.99.437-.06 1.643-.1 3.01.53l.536-2.5c-.735-.27-1.682-.52-2.858-.52-3.022 0-5.15 1.6-5.167 3.9-.019 1.7 1.518 2.65 2.677 3.22 1.19.58 1.59.95 1.585 1.47-.008.79-.948 1.14-1.825 1.15-1.533.02-2.422-.41-3.131-.74l-.553 2.58c.713.33 2.03.61 3.395.63 3.215 0 5.318-1.59 5.315-4.04zm-13.282-7.97l-4.975 11.82h-3.264l-2.443-9.47c-.148-.58-.277-.79-.727-.94-.735-.29-1.949-.56-3.014-.73l.073-.35h5.197c.662 0 1.257.44 1.408 1.2l1.286 6.83 3.175-8.03h3.284z"
                  fill="#1434CB"
                />
              </svg>
            </div>
            <!-- Mastercard -->
            <div class="payment-icon">
              <svg
                viewBox="0 0 48 32"
                fill="none"
              >
                <rect
                  width="48"
                  height="32"
                  rx="4"
                  fill="white"
                />
                <circle
                  cx="18"
                  cy="16"
                  r="8"
                  fill="#EB001B"
                />
                <circle
                  cx="30"
                  cy="16"
                  r="8"
                  fill="#F79E1B"
                />
                <path
                  d="M24 9.6c-1.64 1.52-2.67 3.69-2.67 6.12s1.03 4.6 2.67 6.12c1.64-1.52 2.67-3.69 2.67-6.12s-1.03-4.6-2.67-6.12z"
                  fill="#FF5F00"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const localePath = useLocalePath()
const email = ref('')
const isSubmitting = ref(false)

const subscribeNewsletter = async () => {
  if (!email.value || isSubmitting.value) return

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    toast.error(t('footer.newsletter.error.title') || 'Invalid email', {
      description: t('footer.newsletter.error.invalidEmail') || 'Please enter a valid email address',
    })
    return
  }

  isSubmitting.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    toast.success(t('footer.newsletter.success.title') || 'Subscribed!', {
      description: t('footer.newsletter.success.message') || `You've been subscribed to our newsletter`,
    })
    email.value = ''
  }
  catch {
    toast.error(t('footer.newsletter.error.title') || 'Subscription failed', {
      description: t('footer.newsletter.error.message') || 'Something went wrong. Please try again later.',
    })
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* ============================================
 * LUXURY FOOTER STYLES
 * Moldova Direct - Premium Design System
 * ============================================ */

.luxury-footer {
  --footer-charcoal: #151515;
  --footer-black: #0A0A0A;
  --footer-cream: #F8F5EE;
  --footer-cream-muted: rgba(248, 245, 238, 0.6);
  --footer-gold: #C9A227;
  --footer-gold-light: #DDB93D;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.footer-main {
  background: var(--md-charcoal);
  padding: 5rem 4rem 4rem;
  position: relative;
}

.footer-main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(80%, 800px);
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201, 162, 39, 0.3),
    transparent
  );
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr) 1.25fr;
  gap: 4rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Brand Column */
.footer-brand {
  padding-right: 2rem;
}

.brand-logo {
  font-family: var(--md-font-serif);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--md-cream);
  text-decoration: none;
  letter-spacing: -0.02em;
  display: block;
  margin-bottom: 1.25rem;
}

.brand-tagline {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  color: var(--footer-cream-muted);
  line-height: 1.7;
  margin-bottom: 2rem;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(248, 245, 238, 0.2);
  color: var(--footer-cream-muted);
  transition: all 0.4s var(--transition-smooth);
}

.social-link:hover {
  color: var(--md-gold);
  border-color: var(--md-gold);
}

/* Footer Columns with subtle dividers */
.footer-column {
  position: relative;
  padding-left: 2rem;
}

.footer-column::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(201, 162, 39, 0.3),
    rgba(248, 245, 238, 0.08) 50%,
    transparent
  );
}

.footer-brand + .footer-column::before,
.footer-newsletter::before {
  display: none;
}

/* Column Titles */
.column-title {
  font-family: var(--md-font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--md-gold);
  margin-bottom: 1.75rem;
  text-shadow: 0 0 20px rgba(201, 162, 39, 0.25);
  position: relative;
  display: inline-block;
}

.column-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.5rem;
  width: 20px;
  height: 1px;
  background: var(--md-gold);
  opacity: 0.5;
}

/* Footer Links */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.875rem;
}

.footer-links a {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  color: var(--footer-cream-muted);
  text-decoration: none;
  transition: all 0.3s var(--transition-smooth);
  position: relative;
  display: inline-block;
}

.footer-links a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 1px;
  background: var(--md-gold);
  transition: width 0.3s var(--transition-smooth);
}

.footer-links a:hover {
  color: var(--md-gold);
}

.footer-links a:hover::after {
  width: 100%;
}

/* Newsletter */
.newsletter-text {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  color: var(--footer-cream-muted);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.newsletter-form {
  display: flex;
  gap: 0;
}

.newsletter-input {
  flex: 1;
  padding: 0.875rem 1rem;
  background: rgba(248, 245, 238, 0.05);
  border: 1px solid rgba(248, 245, 238, 0.15);
  border-right: none;
  color: var(--md-cream);
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  outline: none;
  transition: all 0.4s var(--transition-smooth);
}

.newsletter-input::placeholder {
  color: rgba(248, 245, 238, 0.4);
  transition: color 0.3s ease;
}

.newsletter-input:hover {
  background: rgba(248, 245, 238, 0.07);
  border-color: rgba(248, 245, 238, 0.25);
}

.newsletter-input:focus {
  border-color: var(--md-gold);
  background: rgba(248, 245, 238, 0.1);
  box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.15);
}

.newsletter-input:focus::placeholder {
  color: rgba(248, 245, 238, 0.5);
}

.newsletter-btn {
  padding: 0.875rem 1.25rem;
  background: var(--md-gold);
  border: 1px solid var(--md-gold);
  color: var(--footer-black);
  cursor: pointer;
  transition: all 0.4s var(--transition-smooth);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.newsletter-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.newsletter-btn:hover:not(:disabled)::before {
  transform: translateX(100%);
}

.newsletter-btn:hover:not(:disabled) {
  background: var(--footer-gold-light);
  border-color: var(--footer-gold-light);
  box-shadow: 0 4px 16px rgba(201, 162, 39, 0.35);
}

.newsletter-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.newsletter-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.newsletter-btn svg {
  position: relative;
  transition: transform 0.3s ease;
}

.newsletter-btn:hover:not(:disabled) svg {
  transform: translateX(3px);
}

/* Footer Bottom */
.footer-bottom {
  background: var(--footer-black);
  padding: 1.5rem 4rem;
}

.footer-bottom-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  font-family: var(--md-font-sans);
  font-size: 0.75rem;
  color: rgba(248, 245, 238, 0.4);
}

/* Payment Methods */
.payment-methods {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payment-label {
  font-family: var(--md-font-sans);
  font-size: 0.6875rem;
  color: rgba(248, 245, 238, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.payment-icons {
  display: flex;
  gap: 0.5rem;
}

.payment-icon {
  height: 24px;
  width: 38px;
  background: white;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.payment-icon svg {
  width: 100%;
  height: 100%;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .footer-main {
    padding: 3rem 1.5rem;
  }

  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
  }

  .footer-brand {
    grid-column: span 2;
    padding-right: 0;
  }

  .footer-column {
    padding-left: 0;
  }

  .footer-column::before {
    display: none;
  }

  .footer-newsletter {
    grid-column: span 2;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(248, 245, 238, 0.08);
  }

  .footer-bottom {
    padding: 1.25rem 1.5rem;
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-brand,
  .footer-newsletter {
    grid-column: span 1;
  }

  .footer-column {
    padding-top: 1.5rem;
    border-top: 1px solid rgba(248, 245, 238, 0.06);
  }

  .footer-brand {
    border-top: none;
    padding-top: 0;
  }

  .column-title::after {
    display: none;
  }

  .newsletter-form {
    flex-direction: column;
    gap: 0.75rem;
  }

  .newsletter-input {
    border-right: 1px solid rgba(248, 245, 238, 0.15);
    text-align: center;
  }

  .newsletter-btn {
    width: 100%;
    justify-content: center;
    padding: 1rem;
  }

  .social-links {
    justify-content: flex-start;
  }
}
</style>
