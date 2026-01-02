<template>
  <div
    class="announcement-bar"
    role="banner"
    aria-label="Promotional announcement"
  >
    <!-- Subtle gold accent line at top -->
    <div class="accent-line-top"></div>

    <div class="container">
      <div class="announcement-content">
        <commonIcon
          name="lucide:sparkles"
          class="announcement-icon"
        />
        <p class="announcement-text">
          <span class="announcement-highlight">{{ t('home.announcement.highlight') }}</span>
          <span class="announcement-separator">|</span>
          <span class="announcement-description">{{ t('home.announcement.description') }}</span>
        </p>
        <NuxtLink
          v-if="showCta"
          :to="localePath('/products')"
          class="announcement-cta"
        >
          {{ t('home.announcement.cta') }}
          <commonIcon
            name="lucide:arrow-right"
            class="cta-arrow"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Refined luxury shimmer overlay -->
    <div class="shimmer-overlay"></div>

    <!-- Subtle gold accent line at bottom -->
    <div class="accent-line-bottom"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showCta?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* Uses global design tokens from design-tokens.css */

.announcement-bar {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 60;
  overflow: hidden;
  border-bottom: 1px solid rgba(var(--md-gold-rgb, 201, 162, 39), 0.2);
  background: linear-gradient(135deg, var(--md-charcoal) 0%, var(--md-wine) 50%, var(--md-charcoal) 100%);
}

.accent-line-top {
  position: absolute;
  inset: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--md-gold), transparent);
  opacity: 0.6;
}

.announcement-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.625rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--md-font-sans);
  color: var(--md-cream);
}

@media (min-width: 768px) {
  .announcement-content {
    padding: 0.75rem 0;
    font-size: 1rem;
  }
}

.announcement-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: var(--md-gold);
}

.announcement-text {
  text-align: center;
  letter-spacing: 0.025em;
}

.announcement-highlight {
  font-weight: 600;
  color: var(--md-gold);
}

.announcement-separator {
  margin: 0 0.5rem;
  opacity: 0.6;
  display: none;
}

@media (min-width: 640px) {
  .announcement-separator {
    display: inline;
  }
}

.announcement-description {
  display: block;
}

@media (min-width: 640px) {
  .announcement-description {
    display: inline;
  }
}

.announcement-cta {
  display: none;
  align-items: center;
  margin-left: 0.5rem;
  padding: 0.375rem 1rem;
  font-family: var(--md-font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
  border-radius: 0.125rem;
  background: linear-gradient(135deg, var(--md-gold) 0%, var(--md-gold-light) 50%, var(--md-gold) 100%);
  color: var(--md-charcoal);
  border: 1px solid var(--md-gold);
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .announcement-cta {
    display: inline-flex;
  }
}

.announcement-cta:hover {
  background: linear-gradient(135deg, var(--md-gold-light) 0%, #E5C158 50%, var(--md-gold-light) 100%);
}

.cta-arrow {
  margin-left: 0.375rem;
  width: 0.75rem;
  height: 0.75rem;
}

.shimmer-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(var(--md-gold-rgb, 201, 162, 39), 0.05), transparent);
  opacity: 0.3;
}

.accent-line-bottom {
  position: absolute;
  inset: 0;
  bottom: 0;
  top: auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(var(--md-gold-rgb, 201, 162, 39), 0.4), transparent);
}
</style>
