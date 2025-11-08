<template>
  <div class="luxury-video-hero relative overflow-hidden">
    <!-- Background Video/Image (To'ak Style) -->
    <figure class="video-container">
      <!-- Poster Image (Always Visible) -->
      <picture>
        <img
          src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070&auto=format&fit=crop"
          fetchpriority="high"
          decoding="async"
          alt="Moldovan vineyard at golden hour"
          class="poster-image"
        />
      </picture>

      <!-- Video (Desktop Only - To'ak Style) -->
      <video
        v-if="shouldShowVideo && !reducedMotion && !isMobile"
        ref="videoRef"
        preload="none"
        autoplay
        muted
        loop
        playsinline
        :poster="'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070&auto=format&fit=crop'"
        class="hero-video"
        @loadeddata="onVideoLoaded"
        @error="onVideoError"
        @canplay="onVideoCanPlay"
      >
        <source
          data-src="https://customer-ql4f2gmhm7b7owxe.cloudflarestream.com/5e3e02e038fbe9e71e23b4ac52fbf43b/downloads/default.mp4"
          type="video/mp4"
        />
        <source
          data-src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          type="video/mp4"
        />
      </video>
    </figure>

    <!-- Hero Content (To'ak Style - Absolutely Positioned) -->
    <div class="hero-content">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Main Heading (To'ak Style - Split) -->
        <h1 class="hero-title-line1 text-white font-light mb-2">
          {{ $t('luxury.hero.title_line1') || 'From Moldovan Soil' }}
        </h1>

        <div class="hero-subtitle-section">
          <h1 class="hero-title-line2 text-white font-light mb-6">
            {{ $t('luxury.hero.title_line2') || 'to Spanish Tables' }}
          </h1>

          <p class="hero-description text-white/90 mb-8">
            {{ $t('luxury.hero.description') || 'Experience premium Moldovan wines and artisan gourmet products in their finest form—from the heart of Moldova.' }}
          </p>

          <p class="hero-cta">
            <NuxtLink
              to="/products"
              class="cta-button"
            >
              {{ $t('luxury.hero.cta') || 'Shop collection now' }}
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>

    <!-- Scroll Button (To'ak Style) -->
    <a href="#next-section" class="scroll-button">
      <span class="scroll-text">Scroll</span>
    </a>
  </div>
</template>

<script setup lang="ts">
const videoRef = ref<HTMLVideoElement | null>(null)
const reducedMotion = ref(false)
const videoLoaded = ref(false)
const isMobile = ref(false)
const shouldShowVideo = ref(false)

// Check device type and reduced motion preference
onMounted(() => {
  if (typeof window !== 'undefined') {
    // Check for mobile device (< 768px)
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mediaQuery.matches

    // Load video only on desktop after a delay (To'ak style)
    if (!reducedMotion.value && !isMobile.value) {
      setTimeout(() => {
        shouldShowVideo.value = true

        // Load video source after mount (To'ak style lazy loading)
        if (videoRef.value) {
          const sources = videoRef.value.querySelectorAll('source')
          sources.forEach((source) => {
            const dataSrc = source.getAttribute('data-src')
            if (dataSrc) {
              source.setAttribute('src', dataSrc)
            }
          })
          videoRef.value.load()
        }
      }, 500)
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }
})

// Video event handlers
const onVideoLoaded = () => {
  videoLoaded.value = true
}

const onVideoCanPlay = () => {
  if (videoRef.value) {
    videoRef.value.play().catch((err) => {
      console.warn('Video autoplay prevented:', err)
    })
  }
}

const onVideoError = () => {
  console.warn('Video failed to load, showing poster image')
}
</script>

<style scoped>
/* Hero Container (To'ak Style) */
.luxury-video-hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background-color: #241405;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Video Container (To'ak Style) */
.video-container {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

/* Poster Image (To'ak Style - Always Visible) */
.poster-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* Video Element (To'ak Style) */
.hero-video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Hero Content (To'ak Style - Absolutely Positioned) */
.hero-content {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(0, -50%);
  z-index: 10;
  width: 100%;
  text-align: left;
}

/* Typography (To'ak Style) */
.hero-title-line1,
.hero-title-line2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 300;
  font-size: clamp(2.5rem, 7vw, 5rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-description {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.6;
  max-width: 600px;
}

/* CTA Button (To'ak Style) */
.hero-cta {
  margin-top: 20px;
}

.cta-button {
  display: inline-block;
  padding: 14px 32px;
  background-color: #FCFAF2;
  color: #241405;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid #FCFAF2;
}

.cta-button:hover {
  background-color: transparent;
  color: #FCFAF2;
  border-color: #FCFAF2;
}

/* Scroll Button (To'ak Style) */
.scroll-button {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  text-decoration: none;
  display: none;
}

@media (min-width: 768px) {
  .scroll-button {
    display: block;
  }
}

.scroll-text {
  display: block;
  color: #FCFAF2;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.8;
  transition: opacity 0.3s ease;
  position: relative;
  padding-bottom: 24px;
}

.scroll-text::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 16px;
  background-color: #FCFAF2;
  animation: scroll-indicator 2s ease-in-out infinite;
}

@keyframes scroll-indicator {
  0%, 100% {
    opacity: 0.4;
    transform: translateX(-50%) translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) translateY(8px);
  }
}

.scroll-button:hover .scroll-text {
  opacity: 1;
}

/* Mobile Adjustments */
@media (max-width: 767px) {
  .hero-content {
    top: 50%;
    transform: translate(0, -50%);
    text-align: center;
  }

  .hero-description,
  .hero-cta {
    margin-left: auto;
    margin-right: auto;
  }

  .poster-image,
  .hero-video {
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

/* Tablet Adjustments */
@media (min-width: 768px) and (max-width: 1023px) {
  .hero-title-line1,
  .hero-title-line2 {
    font-size: clamp(3rem, 6vw, 4.5rem);
  }
}
</style>
