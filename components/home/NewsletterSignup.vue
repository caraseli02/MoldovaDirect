<template>
  <section
    class="luxury-newsletter"
    aria-labelledby="newsletter-heading"
  >
    <div class="newsletter-container">
      <div class="newsletter-content">
        <div class="content-wrapper">
          <span class="section-eyebrow">{{ t('home.newsletter.eyebrow') || 'Stay Connected' }}</span>
          <h2
            id="newsletter-heading"
            class="section-title"
          >
            {{ t('home.newsletter.title') }}
          </h2>
          <p class="section-subtitle">
            {{ t('home.newsletter.subtitle') }}
          </p>
        </div>

        <form
          class="newsletter-form"
          aria-labelledby="newsletter-heading"
          @submit.prevent="submitNewsletter"
        >
          <div class="form-row">
            <label
              for="newsletter-email"
              class="sr-only"
            >{{ t('home.newsletter.placeholder') }}</label>
            <input
              id="newsletter-email"
              v-model="email"
              type="email"
              required
              :disabled="loading"
              :aria-busy="loading"
              :aria-describedby="submitted ? 'newsletter-success' : error ? 'newsletter-error' : undefined"
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              title="Please enter a valid email address"
              class="email-input"
              :placeholder="t('home.newsletter.placeholder')"
            />
            <button
              type="submit"
              :disabled="loading"
              :aria-label="t('home.newsletter.subscribeButton')"
              :aria-busy="loading"
              class="submit-btn"
            >
              <svg
                v-if="loading"
                class="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span v-else>{{ t('home.newsletter.cta') }}</span>
              <svg
                v-if="!loading"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            class="form-status"
          >
            <p
              v-if="submitted"
              id="newsletter-success"
              class="success-message"
            >
              {{ t('home.newsletter.success') }}
            </p>
            <p
              v-if="error"
              id="newsletter-error"
              class="error-message"
              role="alert"
            >
              {{ error }}
            </p>
          </div>
        </form>

        <p class="disclaimer">
          {{ t('home.newsletter.disclaimer') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

const email = ref('')
const submitted = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const submitNewsletter = async () => {
  if (!email.value) return

  loading.value = true
  error.value = null

  try {
    const { data, error: apiError } = await useFetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: {
        email: email.value,
        locale: locale?.value || 'es',
        source: 'landing_page',
      },
    })

    if (apiError.value) {
      console.error('Newsletter subscription error:', apiError.value)
      error.value = t('home.newsletter.error')
      return
    }

    if (data.value?.success) {
      submitted.value = true
      email.value = ''

      // Reset success message after 5 seconds
      setTimeout(() => {
        submitted.value = false
      }, 5000)
    }
    else {
      error.value = t('home.newsletter.error')
    }
  }
  catch (e: unknown) {
    console.error('Newsletter submission failed:', e)
    error.value = t('home.newsletter.error')
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ============================================
 * LUXURY NEWSLETTER SECTION
 * Moldova Direct - Premium Design System
 * ============================================ */

.luxury-newsletter {
  --nl-cream: #F8F5EE;
  --nl-black: #0A0A0A;
  --nl-charcoal: #151515;
  --nl-gold: #C9A227;
  --nl-gold-light: #DDB93D;
  --nl-wine: #8B2E3B;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  padding: 8rem 4rem;
  background: var(--nl-black);
}

.newsletter-container {
  max-width: 900px;
  margin: 0 auto;
}

.newsletter-content {
  text-align: center;
}

.content-wrapper {
  margin-bottom: 3rem;
}

.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  font-family: var(--md-font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--md-gold);
  margin-bottom: 1.25rem;
  text-shadow: 0 0 20px rgba(201, 162, 39, 0.3);
}

.section-eyebrow::before,
.section-eyebrow::after {
  content: '';
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--md-gold), transparent);
}

.section-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--md-cream);
  margin-bottom: 1rem;
}

.section-subtitle {
  font-family: var(--md-font-sans);
  font-size: 1rem;
  color: rgba(248, 245, 238, 0.6);
  line-height: 1.7;
  max-width: 500px;
  margin: 0 auto;
}

/* Form */
.newsletter-form {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 0;
  max-width: 600px;
  margin: 0 auto;
}

.email-input {
  flex: 1;
  padding: 1rem 1.5rem;
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  color: var(--md-cream);
  background: rgba(248, 245, 238, 0.05);
  border: 1px solid rgba(248, 245, 238, 0.15);
  border-right: none;
  outline: none;
  transition: all 0.4s var(--transition-smooth);
}

.email-input::placeholder {
  color: rgba(248, 245, 238, 0.4);
  transition: color 0.3s ease;
}

.email-input:hover {
  background: rgba(248, 245, 238, 0.07);
  border-color: rgba(248, 245, 238, 0.25);
}

.email-input:focus {
  background: rgba(248, 245, 238, 0.1);
  border-color: var(--md-gold);
  box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.15);
}

.email-input:focus::placeholder {
  color: rgba(248, 245, 238, 0.5);
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-family: var(--md-font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--md-gold);
  color: var(--nl-black);
  border: 1px solid var(--md-gold);
  cursor: pointer;
  transition: all 0.4s var(--transition-smooth);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
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

.submit-btn:hover:not(:disabled)::before {
  transform: translateX(100%);
}

.submit-btn:hover:not(:disabled) {
  background: var(--nl-gold-light);
  border-color: var(--nl-gold-light);
  box-shadow: 0 4px 20px rgba(201, 162, 39, 0.35);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn svg {
  transition: transform 0.3s ease;
  position: relative;
}

.submit-btn:hover:not(:disabled) svg {
  transform: translateX(4px);
}

/* Form Status */
.form-status {
  min-height: 1.5rem;
  margin-top: 1rem;
}

.success-message {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  color: #4ADE80;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: fadeInUp 0.4s var(--transition-smooth);
}

.success-message::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #4ADE80;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.error-message {
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  color: #F87171;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: shake 0.4s ease-in-out;
}

.error-message::before {
  content: '!';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #F87171;
  color: var(--nl-black);
  border-radius: 50%;
  font-size: 0.625rem;
  font-weight: 700;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

/* Disclaimer */
.disclaimer {
  font-family: var(--md-font-sans);
  font-size: 0.75rem;
  color: rgba(248, 245, 238, 0.4);
  max-width: 400px;
  margin: 0 auto;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .luxury-newsletter {
    padding: 5rem 1.5rem;
  }

  .section-eyebrow::before,
  .section-eyebrow::after {
    width: 24px;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .email-input {
    border-right: 1px solid rgba(248, 245, 238, 0.15);
    text-align: center;
  }

  .email-input:focus {
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.12);
  }

  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
