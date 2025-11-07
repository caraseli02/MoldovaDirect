<template>
  <div class="media-mentions-bar bg-cream-50 py-4 border-b border-cream-200">
    <div class="container mx-auto px-4">
      <p class="text-center text-sm text-gray-600 mb-3 uppercase tracking-wider">
        {{ t('landing.mediaMentions.heading') }}
      </p>

      <div class="mentions-carousel relative overflow-hidden">
        <div
          ref="carouselTrack"
          class="flex gap-8 md:gap-12 animate-scroll"
          :style="{ animationDuration: `${duration}s` }"
        >
          <!-- First set of logos -->
          <div
            v-for="mention in mentions"
            :key="`first-${mention.id}`"
            class="flex-shrink-0"
          >
            <a
              :href="mention.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
              :aria-label="`Read article on ${mention.name}`"
            >
              <NuxtImg
                :src="mention.logo"
                :alt="`${mention.name} logo`"
                width="120"
                height="40"
                class="h-8 w-auto object-contain"
                loading="lazy"
              />
            </a>
          </div>

          <!-- Duplicate set for seamless loop -->
          <div
            v-for="mention in mentions"
            :key="`second-${mention.id}`"
            class="flex-shrink-0"
            aria-hidden="true"
          >
            <a
              :href="mention.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
              tabindex="-1"
            >
              <NuxtImg
                :src="mention.logo"
                :alt="`${mention.name} logo`"
                width="120"
                height="40"
                class="h-8 w-auto object-contain"
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface MediaMention {
  id: string
  name: string
  logo: string
  url: string
}

interface Props {
  duration?: number // Animation duration in seconds
}

const props = withDefaults(defineProps<Props>(), {
  duration: 30
})

// Press mentions data - replace with real data or fetch from CMS
const mentions: MediaMention[] = [
  {
    id: 'wine-spectator',
    name: 'Wine Spectator',
    logo: '/images/press/wine-spectator.svg',
    url: 'https://winespectator.com'
  },
  {
    id: 'food-wine',
    name: 'Food & Wine',
    logo: '/images/press/food-wine.svg',
    url: 'https://foodandwine.com'
  },
  {
    id: 'forbes',
    name: 'Forbes',
    logo: '/images/press/forbes.svg',
    url: 'https://forbes.com'
  },
  {
    id: 'nyt',
    name: 'New York Times',
    logo: '/images/press/nyt.svg',
    url: 'https://nytimes.com'
  },
  {
    id: 'wsj',
    name: 'Wall Street Journal',
    logo: '/images/press/wsj.svg',
    url: 'https://wsj.com'
  }
]

const carouselTrack = ref<HTMLElement | null>(null)

// Pause animation on hover
const pauseAnimation = () => {
  if (carouselTrack.value) {
    carouselTrack.value.style.animationPlayState = 'paused'
  }
}

const resumeAnimation = () => {
  if (carouselTrack.value) {
    carouselTrack.value.style.animationPlayState = 'running'
  }
}

onMounted(() => {
  if (carouselTrack.value) {
    carouselTrack.value.addEventListener('mouseenter', pauseAnimation)
    carouselTrack.value.addEventListener('mouseleave', resumeAnimation)
  }
})

onUnmounted(() => {
  if (carouselTrack.value) {
    carouselTrack.value.removeEventListener('mouseenter', pauseAnimation)
    carouselTrack.value.removeEventListener('mouseleave', resumeAnimation)
  }
})
</script>

<style scoped>
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation: scroll linear infinite;
}

/* Ensure smooth loop by having exact 50% */
.mentions-carousel {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
}

@media (prefers-reduced-motion: reduce) {
  .animate-scroll {
    animation: none;
  }
}
</style>
