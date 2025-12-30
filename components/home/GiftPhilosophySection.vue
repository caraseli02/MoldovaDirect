<template>
  <section class="gift-philosophy-section">
    <!-- Background Decorations -->
    <div class="bg-decorations">
      <div class="glow-wine"></div>
      <div class="glow-gold"></div>
      <div class="grain-pattern"></div>
    </div>

    <div class="container">
      <!-- Section Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="section-header"
      >
        <div class="section-badge">
          <span class="badge-line"></span>
          <commonIcon
            name="lucide:gift"
            class="badge-icon"
          />
          <span>{{ t('wineStory.giftPhilosophy.badge', 'Gift Philosophy') }}</span>
          <span class="badge-line"></span>
        </div>

        <h2 class="section-title">
          {{ t('wineStory.giftPhilosophy.title') }}
        </h2>
        <p class="section-subtitle">
          {{ t('wineStory.giftPhilosophy.subtitle') }}
        </p>
        <p class="section-description">
          {{ t('wineStory.giftPhilosophy.description') }}
        </p>
      </div>

      <!-- Reasons Grid -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600, delay: 200 },
        }"
        class="reasons-section"
      >
        <h3 class="subsection-title">
          {{ t('wineStory.giftPhilosophy.reasons.title') }}
        </h3>

        <div class="reasons-grid">
          <!-- Authenticity -->
          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <commonIcon
                name="lucide:heart"
                class="reason-icon"
              />
            </div>
            <h4 class="reason-title">
              {{ t('wineStory.giftPhilosophy.reasons.authenticity.title') }}
            </h4>
            <p class="reason-description">
              {{ t('wineStory.giftPhilosophy.reasons.authenticity.description') }}
            </p>
          </div>

          <!-- Quality -->
          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <commonIcon
                name="lucide:award"
                class="reason-icon"
              />
            </div>
            <h4 class="reason-title">
              {{ t('wineStory.giftPhilosophy.reasons.quality.title') }}
            </h4>
            <p class="reason-description">
              {{ t('wineStory.giftPhilosophy.reasons.quality.description') }}
            </p>
          </div>

          <!-- Sustainability -->
          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <commonIcon
                name="lucide:leaf"
                class="reason-icon"
              />
            </div>
            <h4 class="reason-title">
              {{ t('wineStory.giftPhilosophy.reasons.sustainability.title') }}
            </h4>
            <p class="reason-description">
              {{ t('wineStory.giftPhilosophy.reasons.sustainability.description') }}
            </p>
          </div>

          <!-- Unique -->
          <div class="reason-card">
            <div class="reason-icon-wrapper">
              <commonIcon
                name="lucide:sparkles"
                class="reason-icon"
              />
            </div>
            <h4 class="reason-title">
              {{ t('wineStory.giftPhilosophy.reasons.unique.title') }}
            </h4>
            <p class="reason-description">
              {{ t('wineStory.giftPhilosophy.reasons.unique.description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Gift Scenarios -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600, delay: 400 },
        }"
        class="scenarios-section"
      >
        <h3 class="subsection-title">
          {{ t('wineStory.giftPhilosophy.scenarios.title') }}
        </h3>

        <div class="scenarios-grid">
          <!-- Corporate Gifts -->
          <div class="scenario-card">
            <div class="scenario-header">
              <div class="scenario-icon-wrapper">
                <commonIcon
                  name="lucide:briefcase"
                  class="scenario-icon"
                />
              </div>
              <h4 class="scenario-title">
                {{ t('wineStory.giftPhilosophy.scenarios.corporate.title') }}
              </h4>
            </div>
            <p class="scenario-description">
              {{ t('wineStory.giftPhilosophy.scenarios.corporate.description') }}
            </p>
          </div>

          <!-- Celebrations -->
          <div class="scenario-card">
            <div class="scenario-header">
              <div class="scenario-icon-wrapper">
                <commonIcon
                  name="lucide:party-popper"
                  class="scenario-icon"
                />
              </div>
              <h4 class="scenario-title">
                {{ t('wineStory.giftPhilosophy.scenarios.celebration.title') }}
              </h4>
            </div>
            <p class="scenario-description">
              {{ t('wineStory.giftPhilosophy.scenarios.celebration.description') }}
            </p>
          </div>

          <!-- Gratitude -->
          <div class="scenario-card">
            <div class="scenario-header">
              <div class="scenario-icon-wrapper">
                <commonIcon
                  name="lucide:gift"
                  class="scenario-icon"
                />
              </div>
              <h4 class="scenario-title">
                {{ t('wineStory.giftPhilosophy.scenarios.gratitude.title') }}
              </h4>
            </div>
            <p class="scenario-description">
              {{ t('wineStory.giftPhilosophy.scenarios.gratitude.description') }}
            </p>
          </div>

          <!-- Exploration -->
          <div class="scenario-card">
            <div class="scenario-header">
              <div class="scenario-icon-wrapper">
                <commonIcon
                  name="lucide:compass"
                  class="scenario-icon"
                />
              </div>
              <h4 class="scenario-title">
                {{ t('wineStory.giftPhilosophy.scenarios.exploration.title') }}
              </h4>
            </div>
            <p class="scenario-description">
              {{ t('wineStory.giftPhilosophy.scenarios.exploration.description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible="{
          opacity: 1,
          y: 0,
          transition: { duration: 600, delay: 600 },
        }"
        class="cta-section"
      >
        <h3 class="cta-title">
          {{ t('wineStory.giftPhilosophy.cta.title') }}
        </h3>
        <p class="cta-description">
          {{ t('wineStory.giftPhilosophy.cta.description') }}
        </p>
        <NuxtLink
          :to="localePath('/products')"
          class="cta-button"
        >
          {{ t('wineStory.giftPhilosophy.cta.button') }}
          <commonIcon
            name="lucide:arrow-right"
            class="cta-icon"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* ===== SECTION ===== */
.gift-philosophy-section {
  position: relative;
  padding: 6rem 0;
  background: var(--md-charcoal);
  color: #fff;
  overflow: hidden;
}

/* ===== BACKGROUND DECORATIONS ===== */
.bg-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.glow-wine {
  position: absolute;
  top: 10%;
  left: 20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(139, 46, 59, 0.15) 0%, transparent 70%);
  filter: blur(80px);
}

.glow-gold {
  position: absolute;
  bottom: 20%;
  right: 15%;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(201, 162, 39, 0.12) 0%, transparent 70%);
  filter: blur(90px);
}

.grain-pattern {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03' /%3E%3C/svg%3E");
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
}

/* ===== SECTION HEADER ===== */
.section-header {
  text-align: center;
  max-width: 900px;
  margin: 0 auto 4rem;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(201, 162, 39, 0.15);
  border: 1px solid rgba(201, 162, 39, 0.3);
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

.section-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: var(--md-tracking-tight);
  color: #fff;
  margin-bottom: 1.5rem;
}

.section-subtitle {
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 1.5rem;
}

.section-description {
  max-width: 700px;
  margin: 0 auto;
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
}

/* ===== SUBSECTION TITLE ===== */
.subsection-title {
  font-family: var(--md-font-serif);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 500;
  text-align: center;
  color: #fff;
  margin-bottom: 3rem;
}

/* ===== REASONS SECTION ===== */
.reasons-section {
  margin-bottom: 5rem;
}

.reasons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.reason-card {
  padding: 2rem 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--md-radius-2xl);
  transition: all 0.3s ease;
}

.reason-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(201, 162, 39, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(201, 162, 39, 0.15);
}

.reason-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(201, 162, 39, 0.2);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.reason-card:hover .reason-icon-wrapper {
  background: rgba(201, 162, 39, 0.3);
  transform: scale(1.1);
}

.reason-icon {
  width: 24px;
  height: 24px;
  color: var(--md-gold);
}

.reason-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.75rem;
}

.reason-description {
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

/* ===== SCENARIOS SECTION ===== */
.scenarios-section {
  margin-bottom: 5rem;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.scenario-card {
  padding: 2.5rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--md-radius-2xl);
  transition: all 0.3s ease;
}

.scenario-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(201, 162, 39, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(139, 46, 59, 0.2);
}

.scenario-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.scenario-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(201, 162, 39, 0.2);
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.scenario-card:hover .scenario-icon-wrapper {
  background: rgba(201, 162, 39, 0.3);
  transform: rotate(5deg) scale(1.05);
}

.scenario-icon {
  width: 20px;
  height: 20px;
  color: var(--md-gold);
}

.scenario-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
}

.scenario-description {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
}

/* ===== CTA SECTION ===== */
.cta-section {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-family: var(--md-font-serif);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 500;
  color: #fff;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: #fff;
  color: var(--md-charcoal);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--md-radius-full);
  box-shadow: 0 12px 32px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cta-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-gradient-gold);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-button:hover::before {
  opacity: 1;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 48px rgba(201, 162, 39, 0.4);
}

.cta-button > * {
  position: relative;
  z-index: 1;
}

.cta-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.cta-button:hover .cta-icon {
  transform: translateX(4px);
}

/* ===== RESPONSIVE ===== */
@media (min-width: 768px) {
  .gift-philosophy-section {
    padding: 8rem 0;
  }

  .reasons-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .scenarios-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 1rem;
  }

  .section-header {
    margin-bottom: 3rem;
  }

  .reasons-section,
  .scenarios-section {
    margin-bottom: 3rem;
  }

  .reasons-grid,
  .scenarios-grid {
    gap: 1rem;
  }
}

/* ===== ACCESSIBILITY ===== */
.cta-button:focus-visible {
  outline: 2px solid var(--md-gold);
  outline-offset: 4px;
}
</style>
