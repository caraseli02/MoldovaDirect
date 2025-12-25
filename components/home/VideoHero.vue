<template>
  <section class="video-hero relative flex items-center overflow-hidden bg-[var(--md-black)]">
    <!-- Full viewport height for immersive hero -->
    <div class="relative flex min-h-[100vh] w-full items-center">
      <!-- Video Background (Optional - controlled by showVideo prop) -->
      <div
        v-if="showVideo && !videoLoadError"
        class="absolute inset-0 z-0"
        aria-hidden="true"
      >
        <video
          ref="videoRef"
          autoplay
          muted
          playsinline
          :poster="posterImage"
          class="h-full w-full object-cover"
          aria-hidden="true"
          @ended="handleVideoEnded"
          @error="handleVideoError"
        >
          <source
            v-if="videoWebm"
            :src="videoWebm"
            type="video/webm"
            @error="handleSourceError('webm', $event)"
          />
          <source
            v-if="videoMp4"
            :src="videoMp4"
            type="video/mp4"
            @error="handleSourceError('mp4', $event)"
          />
        </video>
        <!-- Luxury overlay gradient - wine-tinted depth -->
        <div class="hero-overlay absolute inset-0"></div>
      </div>

      <!-- Fallback background: Image or Gradient -->
      <div
        v-else
        class="absolute inset-0 z-0"
      >
        <!-- Background Image (if provided) -->
        <div
          v-if="backgroundImage"
          class="absolute inset-0"
        >
          <NuxtImg
            preset="hero"
            :src="backgroundImage"
            :alt="backgroundImageAlt"
            loading="eager"
            fetchpriority="high"
            sizes="sm:100vw md:100vw lg:100vw"
            class="h-full w-full object-cover object-center"
          />
          <!-- Luxury overlay gradient -->
          <div class="hero-overlay absolute inset-0"></div>
        </div>

        <!-- Poster fallback (mobile or error state) -->
        <div
          v-else-if="posterImage"
          class="absolute inset-0"
        >
          <NuxtImg
            preset="hero"
            :src="posterImage"
            :alt="backgroundImageAlt || 'Hero poster'"
            loading="eager"
            fetchpriority="high"
            sizes="sm:100vw md:100vw lg:100vw"
            class="h-full w-full object-cover object-center"
          />
          <div class="hero-overlay absolute inset-0"></div>
        </div>

        <!-- Luxury gradient fallback background -->
        <div
          v-else
          class="absolute inset-0 bg-[linear-gradient(135deg,_#241405_0%,_#1a0e03_50%,_#722F37_100%),_radial-gradient(circle_at_10%_10%,_rgba(252,250,242,0.05),_transparent_45%)]"
        ></div>
      </div>

      <!-- Content Container - Luxury Editorial Layout -->
      <div class="hero-content relative z-10 flex flex-col justify-center px-6 pb-40 pt-32 md:px-16 md:pb-44 lg:px-24 lg:pb-48">
        <div
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 100,
              delay: 100,
            },
          }"
          class="max-w-[800px]"
        >
          <!-- Luxury eyebrow badge with gold accent line -->
          <div
            v-if="badge"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{
              opacity: 1,
              scale: 1,
              transition: { delay: 200 },
            }"
            class="hero-badge mb-8 inline-flex items-center gap-3"
          >
            <span class="badge-line"></span>
            <commonIcon
              v-if="badgeIcon"
              :name="badgeIcon"
              class="h-4 w-4 text-[var(--md-cream)]/75"
            />
            <span>{{ badge }}</span>
          </div>

          <!-- Luxury heading with serif typography -->
          <h1
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { delay: 300 },
            }"
            class="hero-title mb-6 md:mb-8"
            v-html="formatTitle(title)"
          >
          </h1>

          <!-- Refined subtitle -->
          <p
            v-if="subtitle"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { delay: 400 },
            }"
            class="hero-subtitle mb-8 max-w-[420px] md:mb-12"
          >
            {{ subtitle }}
          </p>

          <!-- CTAs - Luxury Buttons -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { delay: 500 },
            }"
            class="hero-cta mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <NuxtLink
              v-if="primaryCta"
              :to="primaryCta.link"
              class="btn-primary group"
            >
              <span>{{ primaryCta.text }}</span>
              <svg
                v-if="primaryCta.icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="transition-transform duration-300 group-hover:translate-x-1"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </NuxtLink>

            <NuxtLink
              v-if="secondaryCta"
              :to="secondaryCta.link"
              class="btn-secondary"
            >
              {{ secondaryCta.text }}
            </NuxtLink>
          </div>

          <!-- Stats/Highlights - Luxury Layout with Dividers -->
          <div
            v-if="highlights && highlights.length > 0"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { delay: 600 },
            }"
            class="hero-stats"
          >
            <div
              v-for="(highlight, index) in highlights"
              :key="highlight.label"
              v-motion
              :initial="{ opacity: 0, scale: 0.9 }"
              :visible-once="{
                opacity: 1,
                scale: 1,
                transition: { delay: 700 + index * 100 },
              }"
              class="stat group"
            >
              <div class="stat-value">
                {{ highlight.value }}
              </div>
              <div class="stat-label">
                {{ highlight.label }}
              </div>
              <!-- Vertical divider (hidden on last item and mobile) -->
              <span
                v-if="index < highlights.length - 1"
                class="stat-divider"
                aria-hidden="true"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator - Luxury Style -->
      <a
        v-motion
        href="#content"
        :initial="{ opacity: 0, y: -10 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { delay: 1000 },
        }"
        class="scroll-indicator"
      >
        <span>Scroll</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="1.5"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface CtaButton {
  text: string
  link: string
  icon?: string
}

interface Highlight {
  value: string
  label: string
}

// Format title to add gold italic styling to key words
// Wraps text between asterisks (*word*) or the word "Every" in <em> tags
const formatTitle = (title: string): string => {
  // First check for asterisk-wrapped words
  let formatted = title.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  // If no asterisks found, highlight "Every" as fallback for the tagline
  if (!formatted.includes('<em>') && title.toLowerCase().includes('every')) {
    formatted = title.replace(/(every)/gi, '<em>$1</em>')
  }
  return formatted
}

const props = withDefaults(
  defineProps<{
    // Video settings
    showVideo?: boolean
    videoWebm?: string
    videoMp4?: string
    posterImage?: string

    // Background image settings
    backgroundImage?: string
    backgroundImageAlt?: string

    // Content
    badge?: string
    badgeIcon?: string
    title: string
    subtitle?: string

    // CTAs
    primaryCta?: CtaButton
    secondaryCta?: CtaButton

    // Stats
    highlights?: Highlight[]
  }>(),
  {
    showVideo: false,
    posterImage: '/hero-fallback.jpg',
    backgroundImageAlt: 'Moldova vineyard landscape',
  },
)

const videoRef = ref<HTMLVideoElement | null>(null)
const videoLoadError = ref(false)
const videoPlaybackFailed = ref(false)

// Handle video loading errors
const handleVideoError = (event: Event) => {
  console.error('[VideoHero] Video loading error:', {
    error: event,
    webmSrc: props.videoWebm,
    mp4Src: props.videoMp4,
  })
  videoLoadError.value = true
}

const handleVideoEnded = () => {
  setTimeout(() => {
    if (videoRef.value) {
      videoRef.value.play().catch(() => {
        // Prepare for next user interaction if autoplay fails
        videoPlaybackFailed.value = true
      })
    }
  }, 15000)
}

// Handle individual source errors
const handleSourceError = (type: string, event: Event) => {
  console.warn(`[VideoHero] ${type.toUpperCase()} source failed to load`, event)
  // If both sources fail, the video's error handler will fire
}

onMounted(() => {
  // Programmatically start playback as fallback for browsers that don't
  // respect the autoplay attribute. Gracefully handles autoplay policy rejections.
  if (videoRef.value && props.showVideo) {
    videoRef.value.play().catch((error: any) => {
      console.error('[VideoHero] Video autoplay failed (likely browser policy):', {
        error: error.message,
        errorType: error.name,
        videoSrc: props.videoMp4,
      })
      videoPlaybackFailed.value = true
      // Fallback: poster image will remain visible
    })
  }
})
</script>

<style scoped>
/* ============================================
 * LUXURY EDITORIAL HERO STYLES
 * Moldova Direct - Premium Design System
 * ============================================ */

.video-hero {
  --color-cream: #F8F5EE;
  --color-gold: #C9A227;
  --color-gold-light: #DDB93D;
  --color-wine: #8B2E3B;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --transition-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Smooth fade-in for video */
video {
  animation: videoFadeIn 0.8s ease-in;
}

@keyframes videoFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Luxury Overlay Gradient */
.hero-overlay {
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

/* Hero Content Animation */
.hero-content {
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

/* Luxury Badge */
.hero-badge {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(248, 245, 238, 0.75);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.badge-line {
  width: 48px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
}

/* Luxury Hero Title - Editorial Serif */
.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 6.5vw, 6rem);
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--color-cream);
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.hero-title :deep(em) {
  font-style: italic;
  color: var(--color-gold);
  text-shadow: 0 4px 20px rgba(201, 162, 39, 0.3);
}

/* Luxury Subtitle */
.hero-subtitle {
  font-family: var(--font-sans);
  font-size: 1.125rem;
  color: rgba(245, 242, 235, 0.85);
  line-height: 1.8;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Luxury Primary Button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.125rem 2.25rem;
  background: var(--color-cream);
  color: #0A0A0A;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.4s var(--transition-smooth);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
  opacity: 0;
  transition: opacity 0.4s var(--transition-smooth);
}

.btn-primary span,
.btn-primary svg {
  position: relative;
  z-index: 1;
}

.btn-primary:hover {
  color: #0A0A0A;
  box-shadow: 0 8px 35px rgba(201, 162, 39, 0.35), 0 4px 15px rgba(0, 0, 0, 0.2);
  transform: translateY(-3px);
}

.btn-primary:hover::before {
  opacity: 1;
}

/* Luxury Secondary Button */
.btn-secondary {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: rgba(248, 245, 238, 0.9);
  text-decoration: none;
  border-bottom: 1px solid var(--color-gold);
  padding-bottom: 4px;
  transition: all 0.3s var(--transition-smooth);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.btn-secondary:hover {
  color: var(--color-gold-light);
  border-bottom-color: var(--color-gold-light);
  padding-bottom: 6px;
}

/* Luxury Stats Section */
.hero-stats {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(201, 162, 39, 0.2);
}

@media (min-width: 640px) {
  .hero-stats {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 2.5rem;
    margin-top: 3rem;
    padding-top: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .hero-stats {
    flex-wrap: nowrap;
    gap: 3.5rem;
  }
}

.stat {
  text-align: left;
  position: relative;
  padding: 0.75rem 0;
  cursor: default;
  transition: transform 0.3s var(--transition-smooth);
}

/* Hover effect - subtle lift */
.stat:hover {
  transform: translateY(-2px);
}

/* Stat value with hover color transition */
.stat-value {
  font-family: var(--font-serif);
  font-size: 2.25rem;
  font-weight: 500;
  color: var(--color-cream);
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.35);
  line-height: 1;
  transition: color 0.3s var(--transition-smooth), text-shadow 0.3s var(--transition-smooth);
}

@media (min-width: 640px) {
  .stat-value {
    font-size: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .stat-value {
    font-size: 2.75rem;
  }
}

/* Hover: Gold accent on value */
.stat:hover .stat-value {
  color: var(--color-gold-light);
  text-shadow: 0 3px 16px rgba(201, 162, 39, 0.25);
}

.stat-label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(248, 245, 238, 0.55);
  margin-top: 0.625rem;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: color 0.3s var(--transition-smooth);
}

/* Hover: Brighter label */
.stat:hover .stat-label {
  color: rgba(248, 245, 238, 0.8);
}

/* Vertical divider between stats */
.stat-divider {
  display: none;
}

@media (min-width: 640px) {
  .stat-divider {
    display: block;
    position: absolute;
    right: -1.25rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 50%;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(201, 162, 39, 0.35) 20%,
      rgba(201, 162, 39, 0.35) 80%,
      transparent 100%
    );
    transition: opacity 0.3s var(--transition-smooth);
  }
}

@media (min-width: 1024px) {
  .stat-divider {
    right: -1.75rem;
    height: 60%;
  }
}

/* Horizontal divider for mobile (between stacked items) */
@media (max-width: 639px) {
  .stat {
    padding-bottom: 1.25rem;
    border-bottom: 1px solid rgba(201, 162, 39, 0.15);
  }

  .stat:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
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
  color: rgba(248, 245, 238, 0.6);
  font-family: var(--font-sans);
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

/* Mobile Responsive - Additional Refinements */
@media (max-width: 640px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    line-height: 1.7;
  }

  .scroll-indicator {
    bottom: 1.5rem;
  }
}

/* Tablet adjustments */
@media (min-width: 641px) and (max-width: 1023px) {
  .hero-title {
    font-size: clamp(2.75rem, 5vw, 4rem);
  }
}
</style>
