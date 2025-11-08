<template>
  <div class="mobile-carousel-wrapper">
    <!-- Mobile: Horizontal Scroll Carousel -->
    <div
      ref="scrollContainer"
      class="mobile-carousel"
      :class="{ 'has-padding': withPadding }"
      @scroll="onScroll"
    >
      <slot />
    </div>

    <!-- Scroll Indicators (optional dots) -->
    <div v-if="showIndicators && itemCount > 1" class="carousel-indicators">
      <button
        v-for="i in itemCount"
        :key="i"
        type="button"
        :aria-label="`Go to slide ${i}`"
        class="indicator-dot"
        :class="{ active: currentIndex === i - 1 }"
        @click="scrollToIndex(i - 1)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  itemCount: {
    type: Number,
    default: 0
  },
  showIndicators: {
    type: Boolean,
    default: true
  },
  withPadding: {
    type: Boolean,
    default: true
  }
})

const scrollContainer = ref<HTMLElement | null>(null)
const currentIndex = ref(0)

const onScroll = () => {
  if (!scrollContainer.value) return

  const container = scrollContainer.value
  const scrollLeft = container.scrollLeft
  const itemWidth = container.scrollWidth / props.itemCount

  currentIndex.value = Math.round(scrollLeft / itemWidth)
}

const scrollToIndex = (index: number) => {
  if (!scrollContainer.value) return

  const container = scrollContainer.value
  const itemWidth = container.scrollWidth / props.itemCount

  container.scrollTo({
    left: itemWidth * index,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
.mobile-carousel-wrapper {
  position: relative;
  width: 100%;
}

.mobile-carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.mobile-carousel::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.mobile-carousel.has-padding {
  padding: 0 1rem;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-bottom: 0.5rem;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(114, 47, 55, 0.2);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background-color: #722F37;
  width: 24px;
  border-radius: 4px;
}

/* Desktop: Hide carousel, show grid */
@media (min-width: 768px) {
  .mobile-carousel-wrapper {
    display: none;
  }
}
</style>
