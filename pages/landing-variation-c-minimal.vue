<template>
  <div class="landing-minimal">
    <Head>
      <Title>Moldova Direct - Modern Minimal Design</Title>
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
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>

    <!-- Scroll Progress Bar -->
    <div
      class="scroll-progress"
      :style="{ width: scrollProgress + '%' }"
    ></div>

    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-container">
        <a
          href="#"
          class="nav-logo"
        >Moldova Direct</a>
        <ul class="nav-links">
          <li><a href="#">Shop</a></li>
          <li><a href="#">Wines</a></li>
          <li><a href="#">Gourmet</a></li>
          <li><a href="#">Gifts</a></li>
          <li><a href="#">About</a></li>
        </ul>
        <div class="nav-actions">
          <a
            href="#"
            class="nav-cart"
          >
            <svg
              width="22"
              height="22"
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
          <a
            href="#"
            class="nav-cta"
          >Shop Now</a>
        </div>
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
          poster="/videos/hero/hero-3-poster.jpg"
        >
          <source
            src="/videos/hero/hero-3.webm"
            type="video/webm"
          />
          <source
            src="/videos/hero/hero-3.mp4"
            type="video/mp4"
          />
        </video>
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-tag">
            <span class="hero-tag-dot"></span>
            Direct from Moldova
          </div>
          <h1 class="hero-title">
            <span>Taste Moldova</span>
            <span>in Every</span>
            <span>Delivery</span>
          </h1>
          <p class="hero-description">
            Premium wines, gourmet foods, and authentic flavours from Moldova's finest artisan producers. Delivered across Spain.
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
              href="#"
              class="btn-secondary"
            >
              <span>Learn More</span>
            </a>
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
                Fast Delivery
              </div>
            </div>
            <div class="stat">
              <div class="stat-value">
                4.9
              </div>
              <div class="stat-label">
                Rating
              </div>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-image-grid">
            <div class="hero-image hero-image-1">
              <img
                src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&h=700&fit=crop"
                alt="Wine bottles"
              />
            </div>
            <div class="hero-image hero-image-2">
              <img
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop"
                alt="Artisan bread"
              />
            </div>
            <div class="hero-image hero-image-3">
              <img
                src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop"
                alt="Refreshing drink"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="footer-logo">
            Moldova Direct
          </div>
          <p class="footer-description">
            Premium wines and gourmet foods from Moldova's finest artisan producers.
          </p>
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

const scrollProgress = ref(0)

onMounted(() => {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value = (scrollTop / docHeight) * 100
  })
})
</script>

<style scoped>
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-minimal {
  --color-black: #000000;
  --color-off-black: #0A0A0A;
  --color-white: #FFFFFF;
  --color-gray-50: #FAFAFA;
  --color-gray-100: #F5F5F5;
  --color-gray-200: #E5E5E5;
  --color-gray-400: #A3A3A3;
  --color-gray-600: #525252;
  --color-gray-800: #262626;
  --color-gray-900: #171717;
  --color-accent: #DC2626;
  --color-accent-dark: #B91C1C;
  --font-main: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  --radius: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  font-family: var(--font-main);
  background-color: var(--color-white);
  color: var(--color-gray-900);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Scroll Progress Bar */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--color-accent);
  z-index: 1000;
  transition: width 0.1s linear;
}

/* Selection */
::selection {
  background: var(--color-black);
  color: var(--color-white);
}

/* Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-gray-200);
}

.nav-container {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-black);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2.5rem;
  list-style: none;
}

.nav-links a {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--color-gray-600);
  text-decoration: none;
  transition: color 0.3s var(--transition-smooth);
  position: relative;
  padding: 0.5rem 0;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-accent);
  transition: width 0.3s var(--transition-smooth);
}

.nav-links a:hover {
  color: var(--color-black);
}

.nav-links a:hover::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-cart {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-100);
  border-radius: 50%;
  color: var(--color-black);
  text-decoration: none;
  transition: background 0.3s var(--transition-smooth);
}

.nav-cart:hover {
  background: var(--color-gray-200);
}

.cart-count {
  position: absolute;
  top: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background: var(--color-accent);
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.nav-cta {
  padding: 0.75rem 1.5rem;
  background: var(--color-black);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 50px;
  transition: transform 0.3s var(--transition-smooth), box-shadow 0.3s var(--transition-smooth);
}

.nav-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 8rem 2rem 4rem;
  background: var(--color-black);
  position: relative;
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
    linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.45) 50%, rgba(0, 0, 0, 0.55) 100%),
    linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
  z-index: 1;
}

.hero-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 70% 40%, transparent 0%, rgba(0, 0, 0, 0.15) 100%);
}

.hero-container {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 1.125rem 0.5rem 0.875rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-white);
  border-radius: 50px;
  margin-bottom: 1.75rem;
  transition: all 0.3s var(--transition-smooth);
}

.hero-tag:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.hero-tag-dot {
  width: 8px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 10px var(--color-accent);
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.9); }
}

.hero-title {
  font-size: clamp(3rem, 6.5vw, 5.5rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.045em;
  color: var(--color-white);
  margin-bottom: 1.75rem;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.hero-title span {
  display: block;
}

.hero-description {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.85);
  max-width: 480px;
  margin-bottom: 2.5rem;
  line-height: 1.7;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  margin-bottom: 4rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.9375rem 1.875rem;
  background: var(--color-white);
  color: var(--color-black);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.4s var(--transition-smooth);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-accent);
  opacity: 0;
  transition: opacity 0.4s var(--transition-smooth);
  border-radius: inherit;
}

.btn-primary span,
.btn-primary svg {
  position: relative;
  z-index: 1;
}

.btn-primary:hover {
  color: var(--color-white);
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(220, 38, 38, 0.4);
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
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.75rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--color-white);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-decoration: none;
  border-radius: 50px;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  transition: all 0.4s var(--transition-smooth);
}

.btn-secondary:hover {
  background: var(--color-white);
  color: var(--color-black);
  border-color: var(--color-white);
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 255, 255, 0.2);
}

.hero-stats {
  display: flex;
  gap: 3.5rem;
}

.stat {
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
  background: rgba(255, 255, 255, 0.2);
}

.stat:last-child::after {
  display: none;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-white);
  line-height: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.stat-label {
  font-size: 0.8125rem;
  letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 0.375rem;
}

.hero-visual {
  position: relative;
  z-index: 3;
}

.hero-image-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.hero-image {
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  transition: all 0.5s var(--transition-smooth);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-image:hover {
  transform: scale(1.02) translateY(-4px);
  box-shadow:
    0 0 40px rgba(255, 255, 255, 0.15),
    0 25px 50px rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.2);
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s var(--transition-smooth);
}

.hero-image:hover img {
  transform: scale(1.06);
}

.hero-image-1 {
  grid-row: span 2;
  height: 500px;
}

.hero-image-2 {
  height: 240px;
}

.hero-image-3 {
  height: 240px;
}

/* Footer */
.footer {
  padding: 4rem 2rem 2rem;
  background: var(--color-gray-900);
  color: var(--color-white);
}

.footer-container {
  max-width: 1440px;
  margin: 0 auto;
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}

.footer-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
}

.footer-bottom {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-copyright {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Mobile Styles */
@media (max-width: 1024px) {
  .nav-links {
    display: none;
  }

  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-description {
    max-width: 100%;
  }

  .hero-cta {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-visual {
    display: none;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-cta {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }

  .stat::after {
    display: none;
  }
}
</style>
