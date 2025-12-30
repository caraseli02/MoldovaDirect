<template>
  <div class="landing-artisan">
    <Head>
      <Title>Moldova Direct - Warm Artisan Design</Title>
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
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>

    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-container">
        <a
          href="#"
          class="nav-logo"
        >
          <span class="logo-icon">M</span>
          <span>Moldova Direct</span>
        </a>
        <ul class="nav-links">
          <li><a href="#">Shop</a></li>
          <li><a href="#">Wines</a></li>
          <li><a href="#">Gourmet</a></li>
          <li><a href="#">Gifts</a></li>
          <li><a href="#">Our Story</a></li>
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
          poster="/videos/hero/hero-2-poster.jpg"
        >
          <source
            src="/videos/hero/hero-2.webm"
            type="video/webm"
          />
          <source
            src="/videos/hero/hero-2.mp4"
            type="video/mp4"
          />
        </video>
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <span class="hero-badge">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Hand-Picked from Moldova's Finest Producers
          </span>
          <h1 class="hero-title">
            Taste Moldova in <span class="highlight">Every</span> Delivery
          </h1>
          <p class="hero-description">
            Premium wines, gourmet foods, and authentic flavours handpicked from family farms and artisan producers. Delivered with care across Spain.
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <polygon
                  points="10 8 16 12 10 16 10 8"
                  fill="currentColor"
                />
              </svg>
              <span>Watch Our Story</span>
            </a>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-value">
                2k+
              </div>
              <div class="stat-label">
                Happy Customers
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
                Customer Rating
              </div>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-image-main">
            <img
              src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=700&fit=crop"
              alt="Wine and food"
            />
          </div>
          <div class="hero-image-float hero-image-float-1">
            <img
              src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=400&fit=crop"
              alt="Artisan bread"
            />
          </div>
          <div class="hero-image-float hero-image-float-2">
            <img
              src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&h=400&fit=crop"
              alt="Refreshing drink"
            />
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
</script>

<style scoped>
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-artisan {
  --color-cream: #FDF8F3;
  --color-cream-warm: #F7F0E8;
  --color-terracotta: #C75B39;
  --color-terracotta-dark: #A84830;
  --color-olive: #5D6B4C;
  --color-olive-light: #8A9A6D;
  --color-brown: #3D3229;
  --color-brown-light: #6B5D4D;
  --color-gold: #D4A853;
  --color-gold-warm: #E5BC6A;
  --color-sand: #E8DDD0;
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'DM Sans', -apple-system, sans-serif;
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  font-family: var(--font-body);
  background-color: var(--color-cream);
  color: var(--color-brown);
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
  padding: 1rem 2rem;
  background: var(--color-cream);
  box-shadow: 0 2px 20px rgba(61, 50, 41, 0.08);
}

.nav-container {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-brown);
  text-decoration: none;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--color-terracotta);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  list-style: none;
}

.nav-links a {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--color-brown-light);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all 0.3s var(--transition-smooth);
  position: relative;
}

.nav-links a::before {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--color-terracotta);
  border-radius: 2px;
  transition: all 0.3s var(--transition-smooth);
  transform: translateX(-50%);
}

.nav-links a:hover {
  background: var(--color-sand);
  color: var(--color-brown);
}

.nav-links a:hover::before {
  width: calc(100% - 2rem);
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
  background: var(--color-cream-warm);
  border-radius: 50%;
  color: var(--color-brown);
  text-decoration: none;
  transition: background 0.3s var(--transition-smooth);
}

.nav-cart:hover {
  background: var(--color-sand);
}

.cart-count {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  background: var(--color-terracotta);
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
  background: var(--color-terracotta);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.3s var(--transition-smooth);
}

.nav-cta:hover {
  background: var(--color-terracotta-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(199, 91, 57, 0.3);
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  padding: 8rem 2rem 4rem;
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
    linear-gradient(135deg, rgba(199,91,57,0.72) 0%, rgba(93,107,76,0.55) 50%, rgba(61,50,41,0.65) 100%),
    linear-gradient(to bottom, transparent 0%, rgba(61,50,41,0.25) 100%);
}

.hero-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 70% 30%, transparent 0%, transparent 40%, rgba(61,50,41,0.35) 100%);
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
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 1.125rem 0.5rem 0.875rem;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--color-cream);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  border-radius: 50px;
  margin-bottom: 1.75rem;
  border: 1px solid rgba(255,255,255,0.25);
  transition: all 0.3s var(--transition-smooth);
}

.hero-badge:hover {
  background: rgba(255,255,255,0.25);
  border-color: rgba(255,255,255,0.4);
}

.hero-badge svg {
  width: 15px;
  height: 15px;
  opacity: 0.9;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5.5vw, 4.25rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-cream);
  margin-bottom: 1.75rem;
  text-shadow: 0 4px 30px rgba(61,50,41,0.4);
}

.hero-title .highlight {
  color: var(--color-gold);
  font-style: italic;
}

.hero-description {
  font-size: 1.125rem;
  color: rgba(253,248,243,0.9);
  max-width: 480px;
  margin-bottom: 2.5rem;
  line-height: 1.7;
  text-shadow: 0 2px 10px rgba(61,50,41,0.3);
}

.hero-cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9375rem 1.875rem;
  background: var(--color-cream);
  color: var(--color-terracotta);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.4s var(--transition-smooth);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-warm) 100%);
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
  color: var(--color-brown);
  transform: translateY(-3px);
  box-shadow: 0 10px 35px rgba(212,168,83,0.45);
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
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--color-cream);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-decoration: none;
  border-radius: 50px;
  border: 1.5px solid rgba(255,255,255,0.35);
  transition: all 0.4s var(--transition-smooth);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.22);
  border-color: rgba(255,255,255,0.6);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.btn-secondary svg {
  transition: transform 0.3s var(--transition-smooth);
}

.btn-secondary:hover svg {
  transform: scale(1.1);
}

.hero-stats {
  display: flex;
  gap: 2.5rem;
  padding: 1.25rem 2rem;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255,255,255,0.2);
}

.stat {
  text-align: center;
  position: relative;
}

.stat::after {
  content: '';
  position: absolute;
  right: -1.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 70%;
  background: rgba(255,255,255,0.15);
}

.stat:last-child::after {
  display: none;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--color-cream);
  line-height: 1;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.stat-label {
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: rgba(253,248,243,0.75);
  margin-top: 0.375rem;
}

.hero-visual {
  position: relative;
  z-index: 3;
}

.hero-image-main {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow:
    0 25px 80px rgba(61, 50, 41, 0.35),
    0 10px 30px rgba(199, 91, 57, 0.15);
  border: 3px solid rgba(255,255,255,0.35);
  transition: all 0.5s var(--transition-smooth);
}

.hero-image-main:hover {
  transform: translateY(-10px) scale(1.015);
  box-shadow:
    0 35px 100px rgba(61, 50, 41, 0.4),
    0 15px 40px rgba(199, 91, 57, 0.2);
}

.hero-image-main img {
  width: 100%;
  height: 500px;
  object-fit: cover;
  transition: transform 0.6s var(--transition-smooth);
}

.hero-image-main:hover img {
  transform: scale(1.03);
}

.hero-image-float {
  position: absolute;
  width: 200px;
  height: 240px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(61, 50, 41, 0.3),
    0 8px 25px rgba(0, 0, 0, 0.15);
  border: 3px solid rgba(255,255,255,0.5);
  transition: all 0.4s var(--transition-smooth);
}

.hero-image-float:hover {
  transform: scale(1.06) rotate(2deg);
  box-shadow:
    0 25px 70px rgba(61, 50, 41, 0.35),
    0 12px 35px rgba(0, 0, 0, 0.2);
}

.hero-image-float img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-image-float-1 {
  top: -20px;
  right: -60px;
}

.hero-image-float-2 {
  bottom: 40px;
  right: -80px;
}

/* Footer */
.footer {
  padding: 4rem 2rem 2rem;
  background: var(--color-brown);
  color: var(--color-cream);
}

.footer-container {
  max-width: 1440px;
  margin: 0 auto;
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-description {
  font-size: 0.875rem;
  color: rgba(253,248,243,0.6);
  line-height: 1.7;
}

.footer-bottom {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(253,248,243,0.1);
}

.footer-copyright {
  font-size: 0.75rem;
  color: rgba(253,248,243,0.5);
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
    font-size: 2rem;
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
