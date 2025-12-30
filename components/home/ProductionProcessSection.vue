<template>
  <section class="production-process-section">
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
            name="lucide:factory"
            class="badge-icon"
          />
          <span>{{ t('wineStory.production.badge', 'Our Process') }}</span>
          <span class="badge-line"></span>
        </div>

        <h2 class="section-title">
          {{ t('wineStory.production.title') }}
        </h2>
        <p class="section-subtitle">
          {{ t('wineStory.production.subtitle') }}
        </p>
      </div>

      <!-- Timeline -->
      <div class="timeline-wrapper">
        <!-- Timeline Line - Desktop -->
        <div class="timeline-line timeline-line-desktop"></div>
        <!-- Timeline Line - Mobile -->
        <div class="timeline-line timeline-line-mobile"></div>

        <!-- Steps -->
        <div class="timeline-steps">
          <!-- Step 1: Harvest -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 100 },
            }"
            class="timeline-step step-left"
          >
            <div class="step-content">
              <div class="step-badge">
                <commonIcon
                  name="lucide:calendar"
                  class="badge-icon-sm"
                />
                {{ t('wineStory.production.steps.harvest.timing') }}
              </div>
              <h3 class="step-title">
                {{ t('wineStory.production.steps.harvest.title') }}
              </h3>
              <p class="step-description">
                {{ t('wineStory.production.steps.harvest.description') }}
              </p>
            </div>
            <div class="step-marker">
              <div class="marker-circle">
                <commonIcon
                  name="lucide:grape"
                  class="marker-icon"
                />
              </div>
            </div>
            <div class="step-spacer"></div>
          </div>

          <!-- Step 2: Crushing & Fermentation -->
          <div
            v-motion
            :initial="{ opacity: 0, x: 40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 200 },
            }"
            class="timeline-step step-right"
          >
            <div class="step-spacer"></div>
            <div class="step-marker">
              <div class="marker-circle">
                <commonIcon
                  name="lucide:droplet"
                  class="marker-icon"
                />
              </div>
            </div>
            <div class="step-content">
              <div class="step-badge">
                <commonIcon
                  name="lucide:calendar"
                  class="badge-icon-sm"
                />
                {{ t('wineStory.production.steps.crushing.timing') }}
              </div>
              <h3 class="step-title">
                {{ t('wineStory.production.steps.crushing.title') }}
              </h3>
              <p class="step-description">
                {{ t('wineStory.production.steps.crushing.description') }}
              </p>
            </div>
          </div>

          <!-- Step 3: Aging -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 300 },
            }"
            class="timeline-step step-left"
          >
            <div class="step-content">
              <div class="step-badge">
                <commonIcon
                  name="lucide:calendar"
                  class="badge-icon-sm"
                />
                {{ t('wineStory.production.steps.aging.timing') }}
              </div>
              <h3 class="step-title">
                {{ t('wineStory.production.steps.aging.title') }}
              </h3>
              <p class="step-description">
                {{ t('wineStory.production.steps.aging.description') }}
              </p>
            </div>
            <div class="step-marker">
              <div class="marker-circle">
                <commonIcon
                  name="lucide:clock"
                  class="marker-icon"
                />
              </div>
            </div>
            <div class="step-spacer"></div>
          </div>

          <!-- Step 4: Bottling -->
          <div
            v-motion
            :initial="{ opacity: 0, x: 40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 400 },
            }"
            class="timeline-step step-right"
          >
            <div class="step-spacer"></div>
            <div class="step-marker">
              <div class="marker-circle">
                <commonIcon
                  name="lucide:wine"
                  class="marker-icon"
                />
              </div>
            </div>
            <div class="step-content">
              <div class="step-badge">
                <commonIcon
                  name="lucide:calendar"
                  class="badge-icon-sm"
                />
                {{ t('wineStory.production.steps.bottling.timing') }}
              </div>
              <h3 class="step-title">
                {{ t('wineStory.production.steps.bottling.title') }}
              </h3>
              <p class="step-description">
                {{ t('wineStory.production.steps.bottling.description') }}
              </p>
            </div>
          </div>

          <!-- Step 5: Quality Selection -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 500 },
            }"
            class="timeline-step step-left"
          >
            <div class="step-content">
              <div class="step-badge">
                <commonIcon
                  name="lucide:calendar"
                  class="badge-icon-sm"
                />
                {{ t('wineStory.production.steps.selection.timing') }}
              </div>
              <h3 class="step-title">
                {{ t('wineStory.production.steps.selection.title') }}
              </h3>
              <p class="step-description">
                {{ t('wineStory.production.steps.selection.description') }}
              </p>
            </div>
            <div class="step-marker">
              <div class="marker-circle">
                <commonIcon
                  name="lucide:award"
                  class="marker-icon"
                />
              </div>
            </div>
            <div class="step-spacer"></div>
          </div>

          <!-- Step 6: Delivery -->
          <div
            v-motion
            :initial="{ opacity: 0, x: 40 }"
            :visible="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 600 },
            }"
            class="timeline-step step-right"
          >
            <div class="step-spacer"></div>
            <div class="step-marker">
              <div class="marker-circle">
                <commonIcon
                  name="lucide:truck"
                  class="marker-icon"
                />
              </div>
            </div>
            <div class="step-content">
              <div class="step-badge">
                <commonIcon
                  name="lucide:calendar"
                  class="badge-icon-sm"
                />
                {{ t('wineStory.production.steps.delivery.timing') }}
              </div>
              <h3 class="step-title">
                {{ t('wineStory.production.steps.delivery.title') }}
              </h3>
              <p class="step-description">
                {{ t('wineStory.production.steps.delivery.description') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Traditions & Sustainability -->
      <div class="values-grid">
        <!-- Traditions -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: { duration: 600, delay: 700 },
          }"
          class="value-card value-traditions"
        >
          <div class="value-icon-wrapper">
            <commonIcon
              name="lucide:scroll-text"
              class="value-icon"
            />
          </div>
          <h3 class="value-title">
            {{ t('wineStory.production.traditions.title') }}
          </h3>
          <p class="value-description">
            {{ t('wineStory.production.traditions.description') }}
          </p>
        </div>

        <!-- Sustainability -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: { duration: 600, delay: 800 },
          }"
          class="value-card value-sustainability"
        >
          <div class="value-icon-wrapper">
            <commonIcon
              name="lucide:leaf"
              class="value-icon"
            />
          </div>
          <h3 class="value-title">
            {{ t('wineStory.production.sustainability.title') }}
          </h3>
          <p class="value-description">
            {{ t('wineStory.production.sustainability.description') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
/* ===== SECTION ===== */
.production-process-section {
  position: relative;
  padding: 6rem 0;
  background: #fff;
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ===== SECTION HEADER ===== */
.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 5rem;
}

.section-badge {
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

.section-title {
  font-family: var(--md-font-serif);
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: var(--md-tracking-tight);
  color: var(--md-charcoal);
  margin-bottom: 1.5rem;
}

.section-subtitle {
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  line-height: 1.6;
  color: rgba(10, 10, 10, 0.7);
}

/* ===== TIMELINE ===== */
.timeline-wrapper {
  position: relative;
  margin-bottom: 5rem;
}

.timeline-line {
  position: absolute;
  background: linear-gradient(to bottom, rgba(201, 162, 39, 0.3), var(--md-gold), rgba(201, 162, 39, 0.3));
  z-index: 0;
}

.timeline-line-desktop {
  display: none;
}

.timeline-line-mobile {
  left: 2rem;
  top: 0;
  width: 2px;
  height: 100%;
}

.timeline-steps {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* ===== TIMELINE STEPS ===== */
.timeline-step {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
}

.step-content {
  max-width: 500px;
}

.step-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(201, 162, 39, 0.1);
  border: 1px solid rgba(201, 162, 39, 0.2);
  border-radius: var(--md-radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--md-gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.badge-icon-sm {
  width: 14px;
  height: 14px;
}

.step-title {
  font-family: var(--md-font-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--md-charcoal);
  margin-bottom: 0.75rem;
}

.step-description {
  font-size: 1rem;
  line-height: 1.75;
  color: rgba(10, 10, 10, 0.7);
}

.step-marker {
  position: relative;
  z-index: 2;
}

.marker-circle {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--md-gold);
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: var(--md-shadow-gold-lg);
  transition: all 0.3s ease;
}

.timeline-step:hover .marker-circle {
  transform: scale(1.1);
  box-shadow: 0 20px 40px rgba(201, 162, 39, 0.4);
}

.marker-icon {
  width: 28px;
  height: 28px;
  color: #fff;
}

.step-spacer {
  display: none;
}

/* Step Alignment - Mobile */
.step-left .step-content,
.step-right .step-content {
  grid-column: 3;
  padding-left: 2rem;
}

.step-left .step-marker,
.step-right .step-marker {
  grid-column: 1;
  justify-self: start;
  margin-left: 1rem;
}

/* ===== VALUES GRID ===== */
.values-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 5rem;
}

.value-card {
  padding: 2.5rem;
  border-radius: var(--md-radius-2xl);
  transition: all 0.3s ease;
}

.value-card:hover {
  transform: translateY(-4px);
}

.value-traditions {
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.05) 0%, rgba(139, 46, 59, 0.05) 100%);
  border: 1px solid rgba(201, 162, 39, 0.2);
}

.value-traditions:hover {
  box-shadow: 0 20px 40px rgba(201, 162, 39, 0.15);
}

.value-sustainability {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.value-sustainability:hover {
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15);
}

.value-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: var(--md-gold);
  border-radius: var(--md-radius-xl);
  margin-bottom: 1.5rem;
}

.value-sustainability .value-icon-wrapper {
  background: #10b981;
}

.value-icon {
  width: 28px;
  height: 28px;
  color: #fff;
}

.value-title {
  font-family: var(--md-font-serif);
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--md-charcoal);
  margin-bottom: 1rem;
}

.value-description {
  font-size: 1.0625rem;
  line-height: 1.75;
  color: rgba(10, 10, 10, 0.7);
}

/* ===== RESPONSIVE ===== */
@media (min-width: 768px) {
  .production-process-section {
    padding: 8rem 0;
  }

  .values-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
  }
}

@media (min-width: 1024px) {
  .timeline-line-desktop {
    display: block;
    left: 50%;
    top: 0;
    width: 2px;
    height: 100%;
    transform: translateX(-50%);
  }

  .timeline-line-mobile {
    display: none;
  }

  .step-left .step-content {
    grid-column: 1;
    justify-self: end;
    text-align: right;
    padding-left: 0;
    padding-right: 2rem;
  }

  .step-left .step-marker {
    grid-column: 2;
    justify-self: center;
    margin-left: 0;
  }

  .step-left .step-spacer {
    grid-column: 3;
    display: block;
  }

  .step-right .step-spacer {
    grid-column: 1;
    display: block;
  }

  .step-right .step-marker {
    grid-column: 2;
    justify-self: center;
    margin-left: 0;
  }

  .step-right .step-content {
    grid-column: 3;
    justify-self: start;
    text-align: left;
    padding-left: 2rem;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 1rem;
  }

  .section-header {
    margin-bottom: 3rem;
  }

  .timeline-steps {
    gap: 2rem;
  }

  .marker-circle {
    width: 48px;
    height: 48px;
  }

  .marker-icon {
    width: 24px;
    height: 24px;
  }

  .value-card {
    padding: 2rem 1.5rem;
  }
}
</style>
