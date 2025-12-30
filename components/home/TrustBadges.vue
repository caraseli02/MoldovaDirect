<template>
  <section class="luxury-trust-badges">
    <div class="trust-container">
      <!-- Trust Guarantees -->
      <div class="badges-grid">
        <div
          v-for="(badge, index) in badges"
          :key="badge.title"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            transition: { duration: 400, delay: 100 + index * 100 },
          }"
          class="badge-card"
        >
          <div class="badge-icon">
            <commonIcon
              :name="badge.icon"
              class="h-6 w-6"
            />
          </div>
          <div class="badge-content">
            <h3 class="badge-title">
              {{ badge.title }}
            </h3>
            <p class="badge-description">
              {{ badge.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Payment Methods & Security -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 500, delay: 500 },
        }"
        class="payment-security-section"
      >
        <!-- Payment Methods -->
        <div class="payment-methods">
          <p class="section-label">
            {{ t('home.trustBadges.paymentMethods') }}
          </p>
          <div class="methods-grid">
            <div
              v-for="(method, index) in paymentMethods"
              :key="method.name"
              v-motion
              :initial="{ opacity: 0, scale: 0.8 }"
              :visible-once="{
                opacity: 1,
                scale: 1,
                transition: { duration: 300, delay: 600 + index * 50 },
              }"
              class="method-item"
              :title="method.name"
              :aria-label="`We accept ${method.name}`"
            >
              <commonIcon
                :name="method.icon"
                class="h-6 w-6"
                :aria-label="method.name"
              />
            </div>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- Security Badges -->
        <div class="security-badges">
          <p class="section-label">
            {{ t('home.trustBadges.security') }}
          </p>
          <div class="security-grid">
            <div
              v-for="(security, index) in securityBadges"
              :key="security.name"
              v-motion
              :initial="{ opacity: 0, y: 10 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 300, delay: 700 + index * 50 },
              }"
              class="security-item"
            >
              <commonIcon
                :name="security.icon"
                class="h-4 w-4"
              />
              <span>{{ security.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Support CTA -->
      <div
        v-if="showSupportCta"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 500, delay: 800 },
        }"
        class="support-cta"
      >
        <p class="support-text">
          {{ t('home.trustBadges.supportText') }}
        </p>
        <NuxtLink
          :to="localePath('/contact')"
          class="support-link"
        >
          <span>{{ t('home.trustBadges.contactUs') }}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Badge {
  title: string
  description: string
  icon: string
}

interface PaymentMethod {
  name: string
  icon: string
}

interface SecurityBadge {
  name: string
  icon: string
}

withDefaults(
  defineProps<{
    badges?: Badge[]
    paymentMethods?: PaymentMethod[]
    securityBadges?: SecurityBadge[]
    showSupportCta?: boolean
  }>(),
  {
    showSupportCta: true,
    badges: () => [
      {
        title: 'Free Shipping',
        description: 'On orders over €50',
        icon: 'lucide:truck',
      },
      {
        title: '30-Day Returns',
        description: 'Money-back guarantee',
        icon: 'lucide:rotate-ccw',
      },
      {
        title: 'Secure Payment',
        description: 'SSL encrypted checkout',
        icon: 'lucide:shield-check',
      },
      {
        title: '24/7 Support',
        description: 'We\'re here to help',
        icon: 'lucide:headphones',
      },
    ],
    paymentMethods: () => [
      { name: 'Visa', icon: 'lucide:credit-card' },
      { name: 'Mastercard', icon: 'lucide:credit-card' },
      { name: 'PayPal', icon: 'lucide:wallet' },
      { name: 'Apple Pay', icon: 'lucide:apple' },
      { name: 'Google Pay', icon: 'lucide:smartphone' },
      { name: 'Bank Transfer', icon: 'lucide:landmark' },
    ],
    securityBadges: () => [
      { name: 'SSL Secure', icon: 'lucide:lock' },
      { name: 'PCI Compliant', icon: 'lucide:shield' },
      { name: 'GDPR Protected', icon: 'lucide:shield-check' },
    ],
  },
)

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* ============================================
 * LUXURY TRUST BADGES SECTION
 * Moldova Direct - Premium Design System
 * ============================================ */

.luxury-trust-badges {
  --trust-cream: #F8F5EE;
  --trust-black: #0A0A0A;
  --trust-charcoal: #151515;
  --trust-gold: #C9A227;
  --trust-gold-light: #DDB93D;
  --trust-wine: #8B2E3B;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  padding: 5rem 4rem;
  background: var(--trust-cream);
}

.trust-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Badges Grid */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.badge-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  background: white;
  border: 1px solid rgba(10, 10, 10, 0.06);
  transition: all 0.4s var(--transition-smooth);
}

.badge-card:hover {
  border-color: var(--trust-gold);
  box-shadow: 0 8px 24px -8px rgba(10, 10, 10, 0.08);
}

.badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(201, 162, 39, 0.1);
  color: var(--trust-gold);
  margin-bottom: 1.25rem;
}

.badge-title {
  font-family: var(--font-serif);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--trust-black);
  margin-bottom: 0.375rem;
}

.badge-description {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  color: #5E5E5E;
}

/* Payment & Security Section */
.payment-security-section {
  padding: 2.5rem;
  background: white;
  border: 1px solid rgba(10, 10, 10, 0.06);
}

.section-label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #5E5E5E;
  text-align: center;
  margin-bottom: 1.25rem;
}

.methods-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.method-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 40px;
  background: var(--trust-cream);
  color: var(--trust-charcoal);
  transition: all 0.3s ease;
}

.method-item:hover {
  background: var(--trust-gold);
  color: var(--trust-black);
}

.section-divider {
  width: 100%;
  height: 1px;
  background: rgba(10, 10, 10, 0.08);
  margin: 2rem 0;
}

.security-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  color: #2D6A4F;
}

/* Support CTA */
.support-cta {
  text-align: center;
  margin-top: 3rem;
}

.support-text {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: #5E5E5E;
  margin-bottom: 0.75rem;
}

.support-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--trust-gold);
  text-decoration: none;
  transition: all 0.3s ease;
}

.support-link:hover {
  color: var(--trust-wine);
}

.support-link svg {
  transition: transform 0.3s ease;
}

.support-link:hover svg {
  transform: translateX(4px);
}

/* Dark Mode */
.dark .luxury-trust-badges {
  background: var(--trust-charcoal);
}

.dark .badge-card {
  background: rgba(248, 245, 238, 0.03);
  border-color: rgba(248, 245, 238, 0.08);
}

.dark .badge-title {
  color: var(--trust-cream);
}

.dark .badge-description {
  color: rgba(248, 245, 238, 0.6);
}

.dark .payment-security-section {
  background: rgba(248, 245, 238, 0.03);
  border-color: rgba(248, 245, 238, 0.08);
}

.dark .section-label {
  color: rgba(248, 245, 238, 0.5);
}

.dark .method-item {
  background: rgba(248, 245, 238, 0.05);
  color: var(--trust-cream);
}

.dark .section-divider {
  background: rgba(248, 245, 238, 0.1);
}

.dark .support-text {
  color: rgba(248, 245, 238, 0.6);
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .luxury-trust-badges {
    padding: 4rem 1.5rem;
  }

  .badges-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .badges-grid {
    grid-template-columns: 1fr;
  }

  .badge-card {
    flex-direction: row;
    text-align: left;
    padding: 1.5rem;
    gap: 1rem;
  }

  .badge-icon {
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .payment-security-section {
    padding: 1.5rem;
  }

  .security-grid {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
}
</style>
