<template>
  <div class="track-order-page">
    <!-- Hero Section - Luxury Editorial -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="glow-wine"></div>
        <div class="glow-gold"></div>
        <div class="grain-pattern"></div>
      </div>

      <div class="container">
        <div
          v-motion
          class="hero-content"
        >
          <!-- Luxury Badge -->
          <div class="hero-badge">
            <span class="badge-line"></span>
            <commonIcon
              name="lucide:package-search"
              class="badge-icon"
            />
            <span>{{ t('trackOrder.badge', 'Order Tracking') }}</span>
            <span class="badge-line"></span>
          </div>

          <!-- Hero Title - Serif -->
          <h1 class="hero-title">
            {{ t('trackOrder.title', 'Track Your Order') }}
          </h1>

          <p class="hero-description">
            {{ t('trackOrder.subtitle', 'Enter your order details to track your delivery') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Tracking Content -->
    <section class="content-section">
      <div class="container">
        <div class="content-wrapper">
          <!-- Search Form -->
          <div
            v-if="!trackingData"
            class="form-card"
          >
            <form
              class="tracking-form"
              @submit.prevent="trackOrder"
            >
              <div class="form-group">
                <label
                  for="orderNumber"
                  class="form-label"
                >
                  <commonIcon
                    name="lucide:hash"
                    class="label-icon"
                  />
                  <span>{{ t('trackOrder.orderNumber', 'Order Number') }}</span>
                </label>
                <input
                  id="orderNumber"
                  v-model="orderNumber"
                  type="text"
                  :placeholder="t('trackOrder.orderNumberPlaceholder', 'e.g., MD-12345')"
                  class="form-input"
                  required
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
                  <span>{{ t('trackOrder.email', 'Email Address') }}</span>
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  :placeholder="t('trackOrder.emailPlaceholder', 'your.email@example.com')"
                  class="form-input"
                  required
                />
              </div>

              <!-- Error Message -->
              <div
                v-if="error"
                class="error-message"
              >
                <commonIcon
                  name="lucide:alert-circle"
                  class="error-icon"
                />
                <span>{{ error }}</span>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="btn-primary"
              >
                <commonIcon
                  v-if="loading"
                  name="lucide:loader-2"
                  class="btn-icon animate-spin"
                />
                <commonIcon
                  v-else
                  name="lucide:search"
                  class="btn-icon"
                />
                <span>{{ loading ? t('common.loading', 'Loading...') : t('trackOrder.trackButton', 'Track Order') }}</span>
              </button>
            </form>
          </div>

          <!-- Tracking Results -->
          <div
            v-if="trackingData"
            class="results-wrapper"
          >
            <!-- Back Button -->
            <button
              type="button"
              class="back-button"
              @click="resetSearch"
            >
              <commonIcon
                name="lucide:arrow-left"
                class="back-icon"
              />
              <span>{{ t('trackOrder.trackAnother', 'Track another order') }}</span>
            </button>

            <!-- Order Summary Card -->
            <div class="summary-card">
              <div class="summary-header">
                <div class="summary-info">
                  <p class="summary-label">
                    {{ t('trackOrder.orderNumber', 'Order Number') }}
                  </p>
                  <p class="summary-value">
                    {{ trackingData.orderNumber }}
                  </p>
                </div>
                <span
                  class="status-badge"
                  :class="getStatusClasses(trackingData.status)"
                >
                  {{ t(`trackOrder.status.${trackingData.status}`) }}
                </span>
              </div>

              <!-- Tracking Number -->
              <div
                v-if="trackingData.trackingNumber"
                class="tracking-info"
              >
                <commonIcon
                  name="lucide:truck"
                  class="info-icon"
                />
                <span class="info-label">{{ t('trackOrder.trackingNumber', 'Tracking') }}:</span>
                <span class="info-value">{{ trackingData.trackingNumber }}</span>
                <span
                  v-if="trackingData.carrier"
                  class="info-carrier"
                >({{ trackingData.carrier }})</span>
              </div>

              <!-- Estimated Delivery -->
              <div
                v-if="trackingData.estimatedDelivery"
                class="tracking-info"
              >
                <commonIcon
                  name="lucide:calendar-clock"
                  class="info-icon"
                />
                <span class="info-label">{{ t('trackOrder.estimatedDelivery', 'Estimated Delivery') }}:</span>
                <span class="info-value">{{ formatDate(trackingData.estimatedDelivery) }}</span>
              </div>

              <!-- Status Progress -->
              <div class="progress-section">
                <div class="progress-track">
                  <div class="progress-line"></div>
                  <div
                    class="progress-fill"
                    :style="{ width: `${getProgressWidth(trackingData.status)}%` }"
                  ></div>

                  <div
                    v-for="(step, index) in statusSteps"
                    :key="step.key"
                    class="progress-step"
                  >
                    <div
                      class="step-circle"
                      :class="getStepClasses(step.key, trackingData.status)"
                    >
                      <commonIcon
                        v-if="isStepCompleted(step.key, trackingData.status)"
                        name="lucide:check"
                        class="step-check"
                      />
                      <span
                        v-else
                        class="step-number"
                      >{{ index + 1 }}</span>
                    </div>
                    <span class="step-label">
                      {{ t(`trackOrder.steps.${step.key}`) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div
              v-if="trackingData.items && trackingData.items.length > 0"
              class="items-card"
            >
              <h3 class="card-title">
                <commonIcon
                  name="lucide:package"
                  class="title-icon"
                />
                {{ t('trackOrder.orderItems', 'Order Items') }}
              </h3>
              <div class="items-list">
                <div
                  v-for="(item, index) in trackingData.items"
                  :key="index"
                  class="item-row"
                >
                  <div class="item-image">
                    <img
                      v-if="item.image"
                      :src="item.image"
                      :alt="getLocalizedText(item.name)"
                    />
                    <commonIcon
                      v-else
                      name="lucide:package"
                      class="placeholder-icon"
                    />
                  </div>
                  <div class="item-details">
                    <p class="item-name">
                      {{ getLocalizedText(item.name) }}
                    </p>
                    <p class="item-quantity">
                      {{ t('common.quantity', 'Quantity') }}: {{ item.quantity }}
                    </p>
                  </div>
                  <div class="item-price">
                    {{ formatPrice(item.price * item.quantity) }}
                  </div>
                </div>
              </div>

              <div class="items-total">
                <span class="total-label">{{ t('common.total', 'Total') }}</span>
                <span class="total-value">{{ formatPrice(trackingData.total) }}</span>
              </div>
            </div>

            <!-- Tracking Events -->
            <div
              v-if="trackingData.events && trackingData.events.length > 0"
              class="timeline-card"
            >
              <h3 class="card-title">
                <commonIcon
                  name="lucide:clock"
                  class="title-icon"
                />
                {{ t('trackOrder.trackingHistory', 'Tracking History') }}
              </h3>
              <div class="timeline">
                <div
                  v-for="(event, index) in trackingData.events"
                  :key="index"
                  class="timeline-event"
                >
                  <div class="timeline-marker">
                    <div
                      class="marker-dot"
                      :class="{ active: index === 0 }"
                    ></div>
                    <div
                      v-if="index < trackingData.events.length - 1"
                      class="marker-line"
                    ></div>
                  </div>
                  <div class="event-content">
                    <p class="event-status">
                      {{ event.status }}
                    </p>
                    <p
                      v-if="event.description"
                      class="event-description"
                    >
                      {{ event.description }}
                    </p>
                    <div class="event-meta">
                      <span class="event-time">{{ formatDateTime(event.timestamp) }}</span>
                      <span
                        v-if="event.location"
                        class="event-location"
                      >
                        <commonIcon
                          name="lucide:map-pin"
                          class="location-icon"
                        />
                        {{ event.location }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Info -->
            <div
              v-if="trackingData.shippingAddress"
              class="shipping-card"
            >
              <h3 class="card-title">
                <commonIcon
                  name="lucide:map-pin"
                  class="title-icon"
                />
                {{ t('trackOrder.shippingTo', 'Shipping To') }}
              </h3>
              <p class="shipping-line">
                {{ trackingData.shippingAddress.city }}, {{ trackingData.shippingAddress.postalCode }}
              </p>
              <p class="shipping-line">
                {{ trackingData.shippingAddress.country }}
              </p>
            </div>

            <!-- Help Section -->
            <div class="help-section">
              <p class="help-text">
                {{ t('trackOrder.needHelp', 'Need help with your order?') }}
              </p>
              <NuxtLink
                :to="localePath('/contact')"
                class="help-link"
              >
                <commonIcon
                  name="lucide:message-circle"
                  class="help-icon"
                />
                {{ t('trackOrder.contactSupport', 'Contact Support') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

// TypeScript interfaces for tracking data
interface TrackingItem {
  name: string | Record<string, string>
  quantity: number
  price: number
  image?: string
}

interface TrackingEvent {
  status: string
  description: string
  location?: string
  timestamp: string
}

interface TrackingAddress {
  city: string
  country: string
  postalCode: string
}

interface TrackingData {
  orderNumber: string
  status: string
  trackingNumber?: string
  carrier?: string
  estimatedDelivery?: string
  shippedAt?: string
  createdAt: string
  total: number
  currency: string
  shippingAddress: TrackingAddress | null
  items: TrackingItem[]
  events: TrackingEvent[]
  lastUpdate: string
  dataIncomplete?: boolean
}

// Form state
const orderNumber = ref('')
const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const trackingData = ref<TrackingData | null>(null)

// Status steps for progress display
const statusSteps = [
  { key: 'confirmed' },
  { key: 'processing' },
  { key: 'shipped' },
  { key: 'delivered' },
]

// SEO
useHead({
  title: () => t('trackOrder.pageTitle', 'Track Your Order - Moldova Direct'),
  meta: [
    { name: 'description', content: () => t('trackOrder.pageDescription', 'Track your Moldova Direct order and view real-time delivery updates.') },
  ],
})

// Methods
const trackOrder = async () => {
  if (!orderNumber.value || !email.value) return

  loading.value = true
  error.value = null

  try {
    const response = await $fetch('/api/orders/track', {
      method: 'POST',
      body: {
        orderNumber: orderNumber.value,
        email: email.value,
      },
    })

    if (response.success && response.data) {
      trackingData.value = response.data as unknown as TrackingData
    }
  }
  catch (err: any) {
    // Log error for debugging
    console.error('Order tracking error:', err)

    // Handle specific error codes
    if (err.statusCode === 404) {
      error.value = t('trackOrder.errors.notFound', 'Order not found. Please check your order number and email.')
    }
    else if (err.statusCode === 400) {
      error.value = t('trackOrder.errors.invalidInput', 'Invalid order number or email.')
    }
    else if (err.statusCode === 429) {
      error.value = t('trackOrder.errors.tooManyRequests', 'Too many requests. Please try again later.')
    }
    else if (err.statusCode >= 500) {
      error.value = t('trackOrder.errors.serverError', 'Server error. Please try again later.')
    }
    else if (err.name === 'FetchError' || err.message?.includes('network') || err.message?.includes('Network')) {
      error.value = t('trackOrder.errors.networkError', 'Network error. Please check your connection.')
    }
    else {
      error.value = t('trackOrder.errors.generic', 'An error occurred. Please try again.')
    }
  }
  finally {
    loading.value = false
  }
}

const resetSearch = () => {
  trackingData.value = null
  orderNumber.value = ''
  email.value = ''
  error.value = null
}

const getLocalizedText = (text: any): string => {
  if (!text) return ''
  if (typeof text === 'string') return text
  return text[locale.value] || text.es || text.en || Object.values(text)[0] || ''
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: trackingData.value?.currency || 'EUR',
  }).format(price)
}

const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

const getStatusClasses = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    processing: 'status-processing',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  }
  return statusMap[status] ?? 'status-pending'
}

const getProgressWidth = (status: string): number => {
  const statusProgress: Record<string, number> = {
    pending: 0,
    confirmed: 25,
    processing: 50,
    shipped: 75,
    delivered: 100,
  }
  return statusProgress[status] || 0
}

const getStepClasses = (stepKey: string, currentStatus: string): string => {
  const stepOrder = ['confirmed', 'processing', 'shipped', 'delivered']
  const currentIndex = stepOrder.indexOf(currentStatus)
  const stepIndex = stepOrder.indexOf(stepKey)

  if (stepIndex <= currentIndex) {
    return 'step-active'
  }
  return 'step-inactive'
}

const isStepCompleted = (stepKey: string, currentStatus: string): boolean => {
  const stepOrder = ['confirmed', 'processing', 'shipped', 'delivered']
  const currentIndex = stepOrder.indexOf(currentStatus)
  const stepIndex = stepOrder.indexOf(stepKey)
  return stepIndex < currentIndex
}
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
  max-width: 700px;
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
}

/* ===== CONTENT SECTION ===== */
.content-section {
  padding: 4rem 0 8rem;
  background: linear-gradient(to bottom, var(--md-cream) 0%, #fff 50%);
}

.content-wrapper {
  max-width: 700px;
  margin: 0 auto;
}

/* ===== FORM CARD ===== */
.form-card {
  background: #fff;
  border: 1px solid rgba(10, 10, 10, 0.08);
  border-radius: var(--md-radius-2xl);
  padding: 3rem;
  box-shadow: var(--md-shadow-lg);
}

.tracking-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--md-charcoal);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.label-icon {
  width: 18px;
  height: 18px;
  color: var(--md-gold);
}

.form-input {
  padding: 1rem 1.25rem;
  border: 1px solid rgba(10, 10, 10, 0.15);
  border-radius: var(--md-radius-xl);
  font-size: 1rem;
  color: var(--md-charcoal);
  background: #fff;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--md-gold);
  box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
}

.form-input::placeholder {
  color: rgba(10, 10, 10, 0.4);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(220, 38, 38, 0.05);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--md-radius-xl);
  color: #991b1b;
  font-size: 0.9375rem;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.btn-primary {
  position: relative;
  padding: 1rem 2rem;
  background: var(--md-charcoal);
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: var(--md-radius-xl);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-gradient-gold);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary > * {
  position: relative;
  z-index: 1;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* ===== RESULTS ===== */
.results-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  background: none;
  border: none;
  color: rgba(10, 10, 10, 0.6);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: var(--md-gold);
}

.back-icon {
  width: 18px;
  height: 18px;
}

.summary-card,
.items-card,
.timeline-card,
.shipping-card {
  background: #fff;
  border: 1px solid rgba(10, 10, 10, 0.08);
  border-radius: var(--md-radius-2xl);
  padding: 2rem;
  box-shadow: var(--md-shadow-sm);
}

.summary-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(10, 10, 10, 0.08);
}

.summary-label {
  font-size: 0.875rem;
  color: rgba(10, 10, 10, 0.5);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-family: var(--md-font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--md-charcoal);
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--md-radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pending { background: rgba(234, 179, 8, 0.1); color: #a16207; }
.status-confirmed { background: rgba(59, 130, 246, 0.1); color: #1e40af; }
.status-processing { background: rgba(99, 102, 241, 0.1); color: #4338ca; }
.status-shipped { background: rgba(168, 85, 247, 0.1); color: #7e22ce; }
.status-delivered { background: rgba(34, 197, 94, 0.1); color: #15803d; }
.status-cancelled { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }

.tracking-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  font-size: 0.9375rem;
}

.info-icon {
  width: 18px;
  height: 18px;
  color: var(--md-gold);
  flex-shrink: 0;
}

.info-label {
  color: rgba(10, 10, 10, 0.5);
}

.info-value {
  color: var(--md-charcoal);
  font-weight: 500;
}

.info-carrier {
  color: rgba(10, 10, 10, 0.4);
}

/* ===== PROGRESS ===== */
.progress-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(10, 10, 10, 0.08);
}

.progress-track {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.progress-line {
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(10, 10, 10, 0.1);
}

.progress-fill {
  position: absolute;
  top: 16px;
  left: 0;
  height: 2px;
  background: var(--md-gold);
  transition: width 0.5s ease;
}

.progress-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all 0.3s ease;
}

.step-active {
  background: var(--md-gold);
  color: #fff;
}

.step-inactive {
  background: rgba(10, 10, 10, 0.1);
  color: rgba(10, 10, 10, 0.4);
}

.step-check {
  width: 16px;
  height: 16px;
}

.step-number {
  font-size: 0.875rem;
  font-weight: 600;
}

.step-label {
  font-size: 0.8125rem;
  color: rgba(10, 10, 10, 0.6);
  text-align: center;
  max-width: 80px;
}

/* ===== CARDS ===== */
.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--md-font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.title-icon {
  width: 24px;
  height: 24px;
  color: var(--md-gold);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(10, 10, 10, 0.08);
  border-radius: var(--md-radius-xl);
  transition: all 0.2s ease;
}

.item-row:hover {
  border-color: var(--md-gold);
  box-shadow: var(--md-shadow-sm);
}

.item-image {
  width: 64px;
  height: 64px;
  border-radius: var(--md-radius-lg);
  overflow: hidden;
  background: rgba(10, 10, 10, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-icon {
  width: 32px;
  height: 32px;
  color: rgba(10, 10, 10, 0.2);
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 500;
  color: var(--md-charcoal);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-quantity {
  font-size: 0.875rem;
  color: rgba(10, 10, 10, 0.5);
}

.item-price {
  font-weight: 500;
  color: var(--md-charcoal);
}

.items-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(10, 10, 10, 0.08);
}

.total-label {
  font-weight: 500;
  color: var(--md-charcoal);
}

.total-value {
  font-family: var(--md-font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--md-charcoal);
}

/* ===== TIMELINE ===== */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-event {
  display: flex;
  gap: 1rem;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0.25rem;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(10, 10, 10, 0.2);
  flex-shrink: 0;
}

.marker-dot.active {
  background: var(--md-gold);
}

.marker-line {
  width: 2px;
  flex: 1;
  background: rgba(10, 10, 10, 0.1);
  margin: 0.5rem 0;
  min-height: 2rem;
}

.event-content {
  flex: 1;
  padding-bottom: 1.5rem;
}

.event-status {
  font-weight: 500;
  color: var(--md-charcoal);
  margin-bottom: 0.25rem;
}

.event-description {
  font-size: 0.9375rem;
  color: rgba(10, 10, 10, 0.6);
  margin-bottom: 0.5rem;
}

.event-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8125rem;
  color: rgba(10, 10, 10, 0.5);
}

.event-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.location-icon {
  width: 12px;
  height: 12px;
}

/* ===== SHIPPING CARD ===== */
.shipping-line {
  font-size: 1rem;
  color: rgba(10, 10, 10, 0.7);
  margin-bottom: 0.5rem;
}

/* ===== HELP SECTION ===== */
.help-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.03) 0%, rgba(139, 46, 59, 0.03) 100%);
  border: 1px solid rgba(201, 162, 39, 0.15);
  border-radius: var(--md-radius-2xl);
  text-align: center;
}

.help-text {
  color: rgba(10, 10, 10, 0.7);
  font-size: 1rem;
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--md-charcoal);
  color: #fff;
  font-weight: 500;
  text-decoration: none;
  border-radius: var(--md-radius-full);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.help-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-gradient-gold);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.help-link:hover::before {
  opacity: 1;
}

.help-link > * {
  position: relative;
  z-index: 1;
}

.help-icon {
  width: 18px;
  height: 18px;
}

/* ===== RESPONSIVE ===== */
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

  .form-card,
  .summary-card,
  .items-card,
  .timeline-card,
  .shipping-card {
    padding: 1.5rem;
  }

  .progress-step {
    flex: 0 0 auto;
    min-width: 60px;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .item-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-price {
    align-self: flex-end;
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

  .form-card {
    padding: 1.5rem;
  }

  .summary-header {
    flex-direction: column;
  }

  .status-badge {
    align-self: flex-start;
  }

  .step-circle {
    width: 28px;
    height: 28px;
  }

  .step-number {
    font-size: 0.75rem;
  }
}
</style>
