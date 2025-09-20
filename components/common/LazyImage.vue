<template>
  <div 
    ref="imageContainer"
    :class="[
      'relative overflow-hidden bg-gray-100 dark:bg-gray-700',
      containerClass
    ]"
    :style="{ aspectRatio: aspectRatio }"
  >
    <!-- Loading placeholder -->
    <div 
      v-if="!loaded && !error"
      class="absolute inset-0 flex items-center justify-center animate-pulse"
    >
      <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-spin border-2 border-transparent border-t-gray-500"></div>
    </div>

    <!-- Error placeholder -->
    <div 
      v-else-if="error"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700"
    >
      <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>

    <!-- Actual image -->
    <img
      v-if="shouldLoad"
      :src="src"
      :alt="alt"
      :class="[
        'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
        loaded ? 'opacity-100' : 'opacity-0',
        imageClass
      ]"
      @load="handleLoad"
      @error="handleError"
      loading="lazy"
    >

    <!-- Blur placeholder for smooth loading -->
    <div 
      v-if="blurDataUrl && !loaded"
      class="absolute inset-0 w-full h-full"
      :style="{ 
        backgroundImage: `url(${blurDataUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px)',
        transform: 'scale(1.1)'
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt: string
  aspectRatio?: string
  containerClass?: string
  imageClass?: string
  blurDataUrl?: string
  rootMargin?: string
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: '1',
  containerClass: '',
  imageClass: '',
  blurDataUrl: '',
  rootMargin: '50px',
  threshold: 0.1
})

const imageContainer = ref<HTMLElement>()
const shouldLoad = ref(false)
const loaded = ref(false)
const error = ref(false)

// Intersection Observer for lazy loading
let observer: IntersectionObserver | null = null

const handleLoad = () => {
  loaded.value = true
  error.value = false
}

const handleError = () => {
  error.value = true
  loaded.value = false
}

const createObserver = () => {
  if (!process.client || !imageContainer.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          shouldLoad.value = true
          observer?.disconnect()
        }
      })
    },
    {
      rootMargin: props.rootMargin,
      threshold: props.threshold
    }
  )

  observer.observe(imageContainer.value)
}

onMounted(() => {
  // Check if image is already in viewport
  if (imageContainer.value) {
    const rect = imageContainer.value.getBoundingClientRect()
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0

    if (isInViewport) {
      shouldLoad.value = true
    } else {
      createObserver()
    }
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

// Watch for src changes to reset loading state
watch(() => props.src, () => {
  loaded.value = false
  error.value = false
  if (!shouldLoad.value) {
    createObserver()
  }
})
</script>