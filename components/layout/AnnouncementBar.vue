<template>
  <div
    class="fixed top-0 left-0 right-0 z-[60] bg-luxury-dark-chocolate text-luxury-cream transition-transform duration-300"
    :class="{ '-translate-y-full': isHidden }"
  >
    <div class="container mx-auto">
      <!-- Desktop: Three columns -->
      <div class="hidden md:grid md:grid-cols-3 gap-4 py-3 px-4">
        <div class="flex items-center justify-center gap-2 text-sm">
          <svg class="w-5 h-5 text-luxury-wine-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span class="font-medium">{{ $t('announcement.shipping') || 'Free Worldwide Shipping' }}</span>
        </div>

        <div class="flex items-center justify-center gap-2 text-sm border-l border-r border-luxury-cream/20">
          <svg class="w-5 h-5 text-luxury-wine-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span class="font-medium">{{ $t('announcement.vip') || 'VIP Rewards Program' }}</span>
        </div>

        <div class="flex items-center justify-center gap-2 text-sm">
          <svg class="w-5 h-5 text-luxury-wine-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span class="font-medium">{{ $t('announcement.gifting') || 'Luxury Gift Subscriptions' }}</span>
        </div>
      </div>

      <!-- Mobile: Rotating ticker -->
      <div class="md:hidden overflow-hidden py-3 px-4">
        <div class="announcement-ticker">
          <div class="announcement-item flex items-center justify-center gap-2 text-xs sm:text-sm">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-luxury-wine-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span class="font-medium">{{ currentMessage }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const isHidden = ref(false)
let lastScrollY = 0
let ticking = false

const messages = [
  'Free Worldwide Shipping',
  'VIP Rewards Program',
  'Luxury Gift Subscriptions'
]

const currentMessageIndex = ref(0)
const currentMessage = computed(() => messages[currentMessageIndex.value])

// Rotate messages on mobile
let messageInterval: NodeJS.Timeout

onMounted(() => {
  // Only rotate on mobile
  if (window.innerWidth < 768) {
    messageInterval = setInterval(() => {
      currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length
    }, 3000)
  }

  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  if (messageInterval) {
    clearInterval(messageInterval)
  }
  window.removeEventListener('scroll', handleScroll)
})

const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY

      // Hide bar when scrolling down past 100px, show when scrolling up
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        isHidden.value = true
      } else {
        isHidden.value = false
      }

      lastScrollY = currentScrollY
      ticking = false
    })
    ticking = true
  }
}
</script>

<style scoped>
.announcement-ticker {
  animation: fade-in-out 3s ease-in-out infinite;
}

@keyframes fade-in-out {
  0%, 100% { opacity: 1; }
  45%, 55% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
