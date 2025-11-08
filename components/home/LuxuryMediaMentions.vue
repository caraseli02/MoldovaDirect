<template>
  <div class="press-mentions-bar py-12 md:py-16 overflow-hidden">
    <div class="container mx-auto px-4 md:px-6 mb-8">
      <p class="text-xs uppercase tracking-[0.2em] text-[#241405]/60 font-medium text-center">
        {{ $t('luxury.press.title') || 'As Featured In' }}
      </p>
    </div>

    <!-- Infinite Scrolling Container -->
    <div class="relative">
      <!-- Gradient Overlays -->
      <div class="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

      <!-- Scrolling Track -->
      <div class="scrolling-wrapper">
        <!-- First Set -->
        <div class="scrolling-content">
          <div
            v-for="mention in pressMentions"
            :key="`first-${mention.id}`"
            class="press-logo"
          >
            <span class="text-[#241405]/50 font-serif text-lg md:text-xl font-semibold whitespace-nowrap">
              {{ mention.name }}
            </span>
          </div>
        </div>

        <!-- Duplicate Set for Seamless Loop -->
        <div class="scrolling-content" aria-hidden="true">
          <div
            v-for="mention in pressMentions"
            :key="`second-${mention.id}`"
            class="press-logo"
          >
            <span class="text-[#241405]/50 font-serif text-lg md:text-xl font-semibold whitespace-nowrap">
              {{ mention.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const pressMentions = [
  { id: 1, name: 'El País' },
  { id: 2, name: 'La Vanguardia' },
  { id: 3, name: 'Wine Spectator' },
  { id: 4, name: 'Food & Wine' },
  { id: 5, name: 'Decanter' },
  { id: 6, name: 'The Guardian' },
  { id: 7, name: 'Financial Times' },
  { id: 8, name: 'Forbes' },
]
</script>

<style scoped>
.press-mentions-bar {
  border-top: 1px solid rgba(36, 20, 5, 0.08);
  border-bottom: 1px solid rgba(36, 20, 5, 0.08);
}

.scrolling-wrapper {
  display: flex;
  width: 100%;
  overflow: hidden;
}

.scrolling-content {
  display: flex;
  animation: scroll 40s linear infinite;
  gap: 4rem;
  padding: 0 2rem;
}

.press-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.press-logo:hover {
  opacity: 1;
  transform: translateY(-2px);
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

/* Pause animation on hover */
.scrolling-wrapper:hover .scrolling-content {
  animation-play-state: paused;
}

/* Responsive speed adjustments */
@media (max-width: 768px) {
  .scrolling-content {
    animation-duration: 30s;
    gap: 3rem;
  }
}
</style>
