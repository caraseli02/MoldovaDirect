<template>
  <div class="landing-luxury">
    <Head>
      <Title>Moldova Direct - Luxury Editorial Design</Title>
      <Link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <Link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin="anonymous"
      />
      <Link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
    </Head>

    <!-- Navigation -->
    <nav
      class="nav"
      :class="{ scrolled: isScrolled }"
    >
      <a
        href="#"
        class="nav-logo"
      >Moldova Direct</a>
      <ul class="nav-links">
        <li><a href="#collections">Collections</a></li>
        <li><a href="#wines">Wines</a></li>
        <li><a href="#gourmet">Gourmet</a></li>
        <li><a href="#gifts">Gifts</a></li>
        <li><a href="#story">Our Story</a></li>
      </ul>
      <div class="nav-actions">
        <a
          href="#"
          class="nav-cart"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line
              x1="3"
              y1="6"
              x2="21"
              y2="6"
            />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span class="cart-count">2</span>
        </a>
        <button
          class="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-video-container">
        <video
          class="hero-video"
          autoplay
          muted
          loop
          playsinline
          poster="/videos/hero/hero-1-poster.jpg"
        >
          <source
            src="/videos/hero/hero-1.webm"
            type="video/webm"
          />
          <source
            src="/videos/hero/hero-1.mp4"
            type="video/mp4"
          />
        </video>
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <span class="hero-badge">Direct from Moldova's Finest Producers</span>
        <h1 class="hero-title">
          Taste Moldova in <em>Every</em> Delivery
        </h1>
        <p class="hero-description">
          Premium wines, gourmet foods, and authentic flavours curated from Moldova's finest artisan producers. Delivered with care across Spain.
        </p>
        <div class="hero-cta">
          <a
            href="#"
            class="btn-primary"
          >
            <span>Shop Collections</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line
                x1="5"
                y1="12"
                x2="19"
                y2="12"
              />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a
            href="#story"
            class="btn-secondary"
          >Our Story</a>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <div class="stat-value">
              2k+
            </div>
            <div class="stat-label">
              Orders Delivered
            </div>
          </div>
          <div class="stat">
            <div class="stat-value">
              48h
            </div>
            <div class="stat-label">
              Average Delivery
            </div>
          </div>
          <div class="stat">
            <div class="stat-value">
              4.9/5
            </div>
            <div class="stat-label">
              Customer Rating
            </div>
          </div>
        </div>
      </div>
      <a
        href="#collections"
        class="scroll-indicator"
      >
        <span>Scroll</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </a>
    </section>

    <!-- Categories Section -->
    <section
      id="collections"
      class="section"
    >
      <div class="section-header">
        <span class="section-eyebrow">Start Your Journey</span>
        <h2 class="section-title">
          Explore Our Most-Loved Selections
        </h2>
        <p class="section-subtitle">
          Find the perfect pairing for any occasion, from intimate dinners to grand celebrations.
        </p>
      </div>
      <div class="categories-grid">
        <article class="category-card">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=1200&fit=crop"
            alt="Signature Moldovan wines"
          />
          <div class="category-overlay">
            <h3 class="category-title">
              Signature Wines
            </h3>
            <p class="category-description">
              Small-batch vintages and award-winning cellars from Moldova's premier regions.
            </p>
            <a
              href="#"
              class="category-link"
            >
              Shop Wines
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </article>
        <article class="category-card">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=600&fit=crop"
            alt="Gourmet Moldovan foods"
          />
          <div class="category-overlay">
            <h3 class="category-title">
              Gourmet Pantry
            </h3>
            <p class="category-description">
              Handmade preserves, honey, and artisanal treats.
            </p>
            <a
              href="#"
              class="category-link"
            >
              Browse Pantry
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </article>
        <article class="category-card">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=600&fit=crop"
            alt="Luxury gift hampers"
          />
          <div class="category-overlay">
            <h3 class="category-title">
              Gift Hampers
            </h3>
            <p class="category-description">
              Ready-to-gift sets for holidays and celebrations.
            </p>
            <a
              href="#"
              class="category-link"
            >
              See Gift Sets
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </article>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            Moldova Direct
          </div>
          <p class="footer-description">
            Premium wines, gourmet foods, and authentic flavours curated from Moldova's finest artisan producers.
          </p>
        </div>
        <div>
          <h4 class="footer-heading">
            Shop
          </h4>
          <ul class="footer-links">
            <li><a href="#">All Products</a></li>
            <li><a href="#">Wines</a></li>
            <li><a href="#">Gourmet</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-heading">
            Company
          </h4>
          <ul class="footer-links">
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copyright">
          2024 Moldova Direct. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const isScrolled = ref(false)

onMounted(() => {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 50
  })
})
</script>

<style scoped>
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-luxury {
  --color-cream: #F8F5EE;
  --color-cream-dark: #EBE7DC;
  --color-black: #0A0A0A;
  --color-charcoal: #151515;
  --color-gray: #7A7A7A;
  --color-gold: #C9A227;
  --color-gold-light: #DDB93D;
  --color-wine: #8B2E3B;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  font-family: var(--font-sans);
  background-color: var(--md-cream);
  color: var(--color-black);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1.5rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  transition: background 0.4s ease, padding 0.3s ease;
}

.nav.scrolled {
  background: var(--md-cream);
  padding: 1rem 4rem;
  box-shadow: 0 1px 0 rgba(0,0,0,0.08);
}

.nav-logo {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--md-cream);
  text-decoration: none;
  transition: color 0.4s ease;
}

.nav.scrolled .nav-logo {
  color: var(--color-black);
}

.nav-links {
  display: flex;
  gap: 3rem;
  list-style: none;
}

.nav-links a {
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(248,245,238,0.85);
  text-decoration: none;
  position: relative;
  padding: 0.5rem 0;
  transition: color 0.4s var(--transition-smooth);
}

.nav.scrolled .nav-links a {
  color: var(--md-charcoal);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1px;
  background: var(--md-gold);
  transition: width 0.4s var(--transition-smooth), left 0.4s var(--transition-smooth);
}

.nav-links a:hover {
  color: var(--color-gold-light);
}

.nav.scrolled .nav-links a:hover {
  color: var(--md-gold);
}

.nav-links a:hover::after {
  width: 100%;
  left: 0;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-cart {
  position: relative;
  color: var(--md-cream);
  text-decoration: none;
  transition: color 0.4s ease;
}

.nav.scrolled .nav-cart {
  color: var(--color-black);
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  background: var(--md-wine);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--md-cream);
  margin: 5px 0;
}

.nav.scrolled .mobile-menu-btn span {
  background: var(--color-black);
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-video-container {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(10,10,10,0.82) 0%, rgba(94,31,40,0.55) 100%),
    linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.3) 100%);
}

.hero-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, transparent 0%, rgba(10,10,10,0.2) 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8rem 6rem 4rem;
  max-width: 800px;
  opacity: 0;
  animation: heroFadeIn 1.2s ease-out 0.3s forwards;
}

@keyframes heroFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(248,245,238,0.75);
  margin-bottom: 2.5rem;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

.hero-badge::before {
  content: '';
  width: 48px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--md-gold), transparent);
}

.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(3rem, 6.5vw, 6rem);
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--md-cream);
  margin-bottom: 2.25rem;
  text-shadow: 0 4px 20px rgba(0,0,0,0.4);
}

.hero-title em {
  font-style: italic;
  color: var(--md-gold);
  text-shadow: 0 4px 20px rgba(201,162,39,0.3);
}

.hero-description {
  font-size: 1.125rem;
  color: rgba(245,242,235,0.85);
  max-width: 420px;
  margin-bottom: 3rem;
  line-height: 1.8;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.hero-cta {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.125rem 2.25rem;
  background: var(--md-cream);
  color: var(--color-black);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.4s var(--transition-smooth);
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--md-gold) 0%, var(--color-gold-light) 100%);
  opacity: 0;
  transition: opacity 0.4s var(--transition-smooth);
}

.btn-primary span,
.btn-primary svg {
  position: relative;
  z-index: 1;
}

.btn-primary:hover {
  color: var(--color-black);
  box-shadow: 0 8px 35px rgba(201,162,39,0.35), 0 4px 15px rgba(0,0,0,0.2);
  transform: translateY(-3px);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary svg {
  transition: transform 0.3s var(--transition-smooth);
}

.btn-primary:hover svg {
  transform: translateX(4px);
}

.btn-secondary {
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: rgba(248,245,238,0.9);
  text-decoration: none;
  border-bottom: 1px solid var(--md-gold);
  padding-bottom: 4px;
  transition: all 0.3s var(--transition-smooth);
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

.btn-secondary:hover {
  color: var(--color-gold-light);
  border-bottom-color: var(--color-gold-light);
  padding-bottom: 6px;
}

.hero-stats {
  display: flex;
  gap: 3.5rem;
  margin-top: 4.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(201,162,39,0.25);
}

.stat {
  text-align: left;
  position: relative;
}

.stat::after {
  content: '';
  position: absolute;
  right: -1.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 60%;
  background: rgba(248,245,238,0.15);
}

.stat:last-child::after {
  display: none;
}

.stat-value {
  font-family: var(--font-serif);
  font-size: 2.75rem;
  font-weight: 500;
  color: var(--md-cream);
  text-shadow: 0 3px 12px rgba(0,0,0,0.35);
  line-height: 1;
}

.stat-label {
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(248,245,238,0.6);
  margin-top: 0.5rem;
  text-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: rgba(248,245,238,0.6);
  font-size: 0.625rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color 0.3s var(--transition-smooth);
}

.scroll-indicator:hover {
  color: var(--color-gold-light);
}

.scroll-indicator svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  stroke-width: 1.5;
  animation: scrollFloat 2.5s ease-in-out infinite;
}

@keyframes scrollFloat {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(6px);
    opacity: 1;
  }
}

/* Section Styles */
.section {
  padding: 8rem 4rem;
}

.section-header {
  max-width: 600px;
  margin-bottom: 5rem;
}

.section-eyebrow {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--md-gold);
  margin-bottom: 1.5rem;
}

.section-title {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--color-gray);
  margin-top: 1.5rem;
  line-height: 1.7;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  grid-template-rows: repeat(2, 400px);
  gap: 2rem;
}

.category-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.category-card:first-child {
  grid-row: span 2;
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.category-card:hover img {
  transform: scale(1.05);
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2.5rem;
}

.category-title {
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 400;
  color: white;
  margin-bottom: 0.5rem;
}

.category-description {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 1rem;
}

.category-link {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: white;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.category-link svg {
  transition: transform 0.3s ease;
}

.category-card:hover .category-link svg {
  transform: translateX(4px);
}

/* Footer */
.footer {
  padding: 6rem 4rem 3rem;
  background: var(--md-charcoal);
  color: var(--md-cream);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 4rem;
  margin-bottom: 4rem;
}

.footer-brand {
  max-width: 320px;
}

.footer-logo {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.footer-description {
  font-size: 0.875rem;
  color: rgba(245,242,235,0.6);
  line-height: 1.7;
}

.footer-heading {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  font-size: 0.875rem;
  color: rgba(245,242,235,0.6);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: var(--md-cream);
}

.footer-bottom {
  padding-top: 3rem;
  border-top: 1px solid rgba(245,242,235,0.1);
}

.footer-copyright {
  font-size: 0.75rem;
  color: rgba(245,242,235,0.5);
}

/* Mobile Styles */
@media (max-width: 1024px) {
  .nav {
    padding: 1rem 2rem;
  }

  .nav-links {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .hero-content {
    padding: 8rem 2rem 4rem;
  }

  .hero-stats {
    flex-wrap: wrap;
    gap: 2rem;
  }

  .section {
    padding: 5rem 2rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 300px);
  }

  .category-card:first-child {
    grid-row: span 1;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-cta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
