<template>
  <section class="luxury-featured">
    <div class="featured-container">
      <!-- Section Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="section-header"
      >
        <span class="section-eyebrow">
          <span class="eyebrow-line"></span>
          <span class="eyebrow-text">{{ t('home.featuredProducts.eyebrow') || 'Featured' }}</span>
          <span class="eyebrow-line"></span>
        </span>
        <h2 class="section-title">
          {{ t('home.featuredProducts.title') }}
        </h2>
        <p class="section-subtitle">
          {{ t('home.featuredProducts.subtitle') }}
        </p>
      </div>

      <!-- Luxury Filter Tabs -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 500, delay: 100 },
        }"
        class="filter-tabs-wrapper"
      >
        <div
          class="filter-tabs"
          role="tablist"
          aria-label="Product filters"
          @keydown="handleTabKeydown"
        >
          <button
            v-for="(filter, index) in filters"
            :key="filter.value"
            :ref="el => { if (el) tabRefs[index] = el as HTMLButtonElement }"
            type="button"
            role="tab"
            :tabindex="activeFilter === filter.value ? 0 : -1"
            :aria-selected="activeFilter === filter.value"
            :aria-controls="'products-panel'"
            :class="['filter-tab', { 'filter-tab-active': activeFilter === filter.value }]"
            @click="setActiveFilter(filter.value)"
          >
            <span class="filter-tab-text">{{ filter.label }}</span>
            <span class="filter-tab-underline"></span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <Transition
        name="fade"
        mode="out-in"
      >
        <div
          v-if="pending"
          key="loading"
          class="products-grid loading"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="loading-card"
            :style="{ animationDelay: `${i * 100}ms` }"
          >
            <div class="loading-image">
              <div class="loading-shimmer"></div>
              <div class="loading-badge"></div>
            </div>
            <div class="loading-content">
              <div class="loading-line loading-category"></div>
              <div class="loading-line loading-title"></div>
              <div class="loading-line loading-price"></div>
              <div class="loading-button"></div>
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div
          v-else-if="filteredProducts.length"
          id="products-panel"
          key="products"
          role="tabpanel"
          class="products-grid"
          :class="{ 'is-transitioning': isTransitioning }"
        >
          <TransitionGroup
            name="product-list"
            tag="div"
            class="products-grid-inner"
          >
            <article
              v-for="(product, index) in filteredProducts"
              :key="product.id"
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{
                opacity: 1,
                y: 0,
                transition: { duration: 500, delay: index * 80 },
              }"
              class="product-item"
            >
              <ProductCard :product="product" />
            </article>
          </TransitionGroup>
        </div>

        <!-- Empty State -->
        <div
          v-else
          key="empty"
          class="empty-state"
        >
          <div class="empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line
                x1="12"
                y1="22.08"
                x2="12"
                y2="12"
              />
            </svg>
          </div>
          <p class="empty-text">
            {{ t('home.featuredProducts.noProducts') }}
          </p>
          <NuxtLink
            :to="localePath('/products')"
            class="view-all-btn"
          >
            <span>{{ t('home.featuredProducts.viewAll') }}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </Transition>

      <!-- Error State -->
      <Transition name="fade">
        <div
          v-if="error"
          class="error-state"
        >
          <div class="error-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
              />
              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
              />
            </svg>
          </div>
          <p class="error-text">
            {{ t('home.featuredProducts.error') }}
          </p>
          <button
            type="button"
            class="retry-btn"
            @click="emit('retry')"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>{{ t('common.retry') }}</span>
          </button>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'

const props = defineProps<{
  products: ProductWithRelations[]
  pending: boolean
  error: Error | null
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const { t } = useI18n()
const localePath = useLocalePath()

// Filter state
const activeFilter = ref('all')
const isTransitioning = ref(false)

// Tab refs for keyboard navigation
const tabRefs: HTMLButtonElement[] = reactive([])

// Filter options
const filters = computed(() => [
  { value: 'all', label: t('home.featuredProducts.filters.all') },
  { value: 'bestsellers', label: t('home.featuredProducts.filters.bestsellers') },
  { value: 'new', label: t('home.featuredProducts.filters.new') },
  { value: 'sale', label: t('home.featuredProducts.filters.sale') },
])

// Set active filter with transition
const setActiveFilter = (value: string) => {
  if (value === activeFilter.value) return

  isTransitioning.value = true

  // Small delay for smooth transition effect
  setTimeout(() => {
    activeFilter.value = value
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }, 150)
}

// Keyboard navigation for tabs (ARIA best practices)
const handleTabKeydown = (event: KeyboardEvent) => {
  const currentIndex = filters.value.findIndex(f => f.value === activeFilter.value)
  let nextIndex = currentIndex

  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      nextIndex = currentIndex > 0 ? currentIndex - 1 : filters.value.length - 1
      break
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      nextIndex = currentIndex < filters.value.length - 1 ? currentIndex + 1 : 0
      break
    case 'Home':
      event.preventDefault()
      nextIndex = 0
      break
    case 'End':
      event.preventDefault()
      nextIndex = filters.value.length - 1
      break
    default:
      return
  }

  // Update active filter and focus the new tab
  activeFilter.value = filters.value[nextIndex]?.value || filters.value[0]?.value || 'all'
  nextTick(() => {
    tabRefs[nextIndex]?.focus()
  })
}

// Filtered products based on active filter
const filteredProducts = computed(() => {
  if (activeFilter.value === 'all') {
    return props.products
  }

  if (activeFilter.value === 'bestsellers') {
    // Sort by low stock as proxy for popularity (low stock = more sales)
    // Products with isFeatured flag shown first, then sorted by stock depletion
    return [...props.products].sort((a, b) => {
      // Prioritize featured products
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      // Then sort by stock quantity (lower stock = more popular)
      return (a.stockQuantity || 0) - (b.stockQuantity || 0)
    })
  }

  if (activeFilter.value === 'new') {
    // Sort by createdAt date (newest first)
    return [...props.products].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  if (activeFilter.value === 'sale') {
    // Filter products with sale prices (comparePrice > price)
    return [...props.products].filter(p => p.comparePrice && p.comparePrice > p.price)
  }

  return props.products
})
</script>

<style scoped>
/* ============================================
 * LUXURY FEATURED PRODUCTS SECTION
 * Moldova Direct - Premium Design System
 * ============================================ */

.luxury-featured {
  --feat-cream: #F8F5EE;
  --feat-black: #0A0A0A;
  --feat-charcoal: #151515;
  --feat-gold: #C9A227;
  --feat-gold-light: #DDB93D;
  --feat-gold-glow: rgba(201, 162, 39, 0.15);
  --feat-wine: #8B2E3B;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

  padding: 8rem 4rem;
  background: white;
  position: relative;
  overflow: hidden;
}

/* Subtle background texture */
.luxury-featured::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 0%, var(--feat-gold-glow) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, var(--feat-gold-glow) 0%, transparent 50%);
  opacity: 0.3;
  pointer-events: none;
}

.featured-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ============================================
 * SECTION HEADER WITH LUXURY EYEBROW
 * ============================================ */

.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
}

.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.eyebrow-text {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--feat-gold);
  position: relative;
}

.eyebrow-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--feat-gold), transparent);
  position: relative;
}

.eyebrow-line::before {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: var(--feat-gold);
  border-radius: 50%;
}

.eyebrow-line:first-child::before {
  right: 0;
}

.eyebrow-line:last-child::before {
  left: 0;
}

.section-title {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--feat-black);
  margin-bottom: 1rem;
}

.section-subtitle {
  font-family: var(--font-sans);
  font-size: 1rem;
  color: #5E5E5E;
  line-height: 1.7;
  max-width: 500px;
  margin: 0 auto;
}

/* ============================================
 * LUXURY FILTER TABS WITH GOLD ACCENTS
 * ============================================ */

.filter-tabs-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 4rem;
}

.filter-tabs {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.375rem;
  background: rgba(10, 10, 10, 0.02);
  border: 1px solid rgba(10, 10, 10, 0.06);
  border-radius: 0;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-tab {
  position: relative;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 1rem 1.75rem;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  transition: all 0.4s var(--transition-smooth);
  overflow: hidden;
}

.filter-tab-text {
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.filter-tab-underline {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 24px;
  height: 2px;
  background: var(--feat-gold);
  transition: transform 0.4s var(--transition-smooth);
}

.filter-tab::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--feat-black);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.4s var(--transition-smooth);
}

.filter-tab:hover:not(.filter-tab-active) {
  color: var(--feat-gold);
}

.filter-tab:hover:not(.filter-tab-active) .filter-tab-underline {
  transform: translateX(-50%) scaleX(1);
}

.filter-tab:focus-visible {
  outline: 2px solid var(--feat-gold);
  outline-offset: 2px;
}

/* Active filter state with gold accent */
.filter-tab-active {
  color: var(--feat-cream);
}

.filter-tab-active::before {
  transform: scaleY(1);
}

.filter-tab-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--feat-gold), var(--feat-gold-light), var(--feat-gold));
  z-index: 2;
}

.filter-tab-active .filter-tab-text {
  color: var(--feat-cream);
}

.filter-tab-active .filter-tab-underline {
  display: none;
}

/* ============================================
 * PRODUCTS GRID WITH TRANSITIONS
 * ============================================ */

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.5rem;
  transition: opacity 0.3s ease;
}

.products-grid.is-transitioning {
  opacity: 0.5;
  pointer-events: none;
}

.products-grid-inner {
  display: contents;
}

.product-item {
  transition: all 0.5s var(--transition-smooth);
}

/* Product list transitions */
.product-list-enter-active,
.product-list-leave-active {
  transition: all 0.4s var(--transition-smooth);
}

.product-list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.product-list-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.product-list-move {
  transition: transform 0.4s var(--transition-smooth);
}

/* ============================================
 * LUXURY LOADING SKELETON STATES
 * ============================================ */

.loading-card {
  background: white;
  border: 1px solid rgba(10, 10, 10, 0.04);
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-image {
  position: relative;
  aspect-ratio: 3/4;
  background: var(--feat-cream);
  overflow: hidden;
}

.loading-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 0%,
    transparent 40%,
    rgba(201, 162, 39, 0.08) 50%,
    transparent 60%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

.loading-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 60px;
  height: 24px;
  background: rgba(10, 10, 10, 0.06);
  border-radius: 0;
}

.loading-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-line {
  height: 10px;
  background: rgba(10, 10, 10, 0.04);
  border-radius: 0;
  position: relative;
  overflow: hidden;
}

.loading-line::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 162, 39, 0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

.loading-category {
  width: 30%;
  height: 8px;
}

.loading-title {
  width: 80%;
  height: 14px;
}

.loading-price {
  width: 40%;
  height: 12px;
  margin-top: 0.5rem;
}

.loading-button {
  width: 100%;
  height: 48px;
  background: rgba(10, 10, 10, 0.04);
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
}

.loading-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 162, 39, 0.08) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ============================================
 * EMPTY STATE WITH LUXURY STYLING
 * ============================================ */

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: linear-gradient(135deg, rgba(248, 245, 238, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  border: 1px solid rgba(10, 10, 10, 0.04);
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--feat-cream);
  color: var(--feat-gold);
  margin-bottom: 1.5rem;
}

.empty-text {
  font-family: var(--font-sans);
  font-size: 1rem;
  color: #5E5E5E;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 1.125rem 2.5rem;
  background: var(--feat-black);
  color: var(--feat-cream);
  text-decoration: none;
  transition: all 0.4s var(--transition-smooth);
  position: relative;
  overflow: hidden;
}

.view-all-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--feat-gold) 0%, var(--feat-gold-light) 100%);
  transform: translateX(-100%);
  transition: transform 0.4s var(--transition-smooth);
}

.view-all-btn:hover {
  color: var(--feat-black);
}

.view-all-btn:hover::before {
  transform: translateX(0);
}

.view-all-btn span,
.view-all-btn svg {
  position: relative;
  z-index: 1;
}

.view-all-btn svg {
  transition: transform 0.3s ease;
}

.view-all-btn:hover svg {
  transform: translateX(4px);
}

/* ============================================
 * ERROR STATE WITH LUXURY STYLING
 * ============================================ */

.error-state {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(139, 46, 59, 0.03) 0%, rgba(255, 255, 255, 0) 100%);
  border: 1px solid rgba(139, 46, 59, 0.1);
}

.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(139, 46, 59, 0.08);
  color: var(--feat-wine);
  margin-bottom: 1rem;
}

.error-text {
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--feat-wine);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 1rem 2rem;
  background: transparent;
  border: 1px solid var(--feat-wine);
  color: var(--feat-wine);
  cursor: pointer;
  transition: all 0.4s var(--transition-smooth);
}

.retry-btn:hover {
  background: var(--feat-wine);
  color: white;
}

.retry-btn svg {
  transition: transform 0.3s ease;
}

.retry-btn:hover svg {
  transform: rotate(-180deg);
}

/* ============================================
 * TRANSITIONS
 * ============================================ */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ============================================
 * DARK MODE
 * ============================================ */

.dark .luxury-featured {
  background: var(--feat-charcoal);
}

.dark .luxury-featured::before {
  opacity: 0.15;
}

.dark .section-title {
  color: var(--feat-cream);
}

.dark .section-subtitle {
  color: rgba(248, 245, 238, 0.6);
}

.dark .filter-tabs {
  background: rgba(248, 245, 238, 0.02);
  border-color: rgba(248, 245, 238, 0.06);
}

.dark .filter-tab {
  color: rgba(248, 245, 238, 0.6);
}

.dark .filter-tab:hover:not(.filter-tab-active) {
  color: var(--feat-gold);
}

.dark .filter-tab::before {
  background: var(--feat-cream);
}

.dark .filter-tab-active .filter-tab-text {
  color: var(--feat-black);
}

.dark .loading-card {
  background: rgba(248, 245, 238, 0.02);
  border-color: rgba(248, 245, 238, 0.04);
}

.dark .loading-image {
  background: rgba(248, 245, 238, 0.04);
}

.dark .loading-line,
.dark .loading-button {
  background: rgba(248, 245, 238, 0.04);
}

.dark .empty-state {
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.03) 0%, rgba(21, 21, 21, 0) 100%);
  border-color: rgba(248, 245, 238, 0.06);
}

.dark .empty-icon {
  background: rgba(201, 162, 39, 0.1);
}

.dark .empty-text {
  color: rgba(248, 245, 238, 0.6);
}

.dark .error-state {
  background: linear-gradient(135deg, rgba(139, 46, 59, 0.05) 0%, rgba(21, 21, 21, 0) 100%);
  border-color: rgba(139, 46, 59, 0.15);
}

.dark .error-icon {
  background: rgba(139, 46, 59, 0.15);
}

/* ============================================
 * RESPONSIVE DESIGN
 * ============================================ */

@media (max-width: 1280px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 1024px) {
  .luxury-featured {
    padding: 5rem 1.5rem;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .filter-tabs {
    padding: 0.25rem;
  }

  .filter-tab {
    padding: 0.75rem 1.25rem;
    font-size: 0.625rem;
  }

  .eyebrow-line {
    width: 24px;
  }
}

@media (max-width: 768px) {
  .luxury-featured {
    padding: 4rem 1rem;
  }

  .section-header {
    margin-bottom: 2.5rem;
  }

  .section-eyebrow {
    gap: 0.75rem;
  }

  .eyebrow-line {
    width: 20px;
  }

  .filter-tabs-wrapper {
    margin-bottom: 2.5rem;
    padding: 0 0.5rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .filter-tabs-wrapper::-webkit-scrollbar {
    display: none;
  }

  .filter-tabs {
    flex-wrap: nowrap;
    min-width: max-content;
  }

  .filter-tab {
    padding: 0.75rem 1rem;
    white-space: nowrap;
  }
}

@media (max-width: 640px) {
  .luxury-featured {
    padding: 3rem 1rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .section-header {
    margin-bottom: 2rem;
  }

  .filter-tabs-wrapper {
    margin-bottom: 2rem;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
  }

  .empty-icon svg {
    width: 32px;
    height: 32px;
  }
}

/* ============================================
 * REDUCED MOTION
 * ============================================ */

@media (prefers-reduced-motion: reduce) {
  .luxury-featured,
  .filter-tab,
  .filter-tab::before,
  .filter-tab-underline,
  .loading-shimmer,
  .loading-line::after,
  .loading-button::after,
  .view-all-btn::before,
  .product-item,
  .product-list-enter-active,
  .product-list-leave-active,
  .product-list-move,
  .fade-enter-active,
  .fade-leave-active,
  .retry-btn svg {
    animation: none;
    transition: none;
  }

  .loading-card {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
