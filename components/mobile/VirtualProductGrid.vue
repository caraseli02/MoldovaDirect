<template>
  <div 
    ref="containerRef"
    class="virtual-scroll-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <!-- Virtual spacer for items before visible area -->
    <div :style="{ height: offsetY + 'px' }" />
    
    <!-- Visible items -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
      <ProductCard
        v-for="item in visibleItems"
        :key="item.id"
        :product="item"
        class="virtual-item"
      />
    </div>
    
    <!-- Virtual spacer for items after visible area -->
    <div :style="{ height: remainingHeight + 'px' }" />
    
    <!-- Loading indicator -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'

interface Props {
  items: ProductWithRelations[]
  itemHeight?: number
  containerHeight?: number
  overscan?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 320, // Approximate height of ProductCard
  containerHeight: 600,
  overscan: 5, // Number of items to render outside visible area
  loading: false
})

const emit = defineEmits<{
  loadMore: []
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const { isMobile } = useDevice()

// Calculate grid columns based on screen size
const columnsCount = computed(() => {
  if (isMobile.value) return 2
  return 4 // Default for larger screens
})

// Calculate rows per screen
const rowsPerScreen = computed(() => {
  return Math.ceil(props.containerHeight / props.itemHeight)
})

// Calculate items per row
const itemsPerRow = computed(() => columnsCount.value)

// Calculate total rows
const totalRows = computed(() => {
  return Math.ceil(props.items.length / itemsPerRow.value)
})

// Calculate visible range
const visibleRange = computed(() => {
  const startRow = Math.floor(scrollTop.value / props.itemHeight)
  const endRow = Math.min(
    startRow + rowsPerScreen.value + props.overscan * 2,
    totalRows.value
  )
  
  return {
    start: Math.max(0, startRow - props.overscan),
    end: endRow
  }
})

// Calculate visible items
const visibleItems = computed(() => {
  const startIndex = visibleRange.value.start * itemsPerRow.value
  const endIndex = visibleRange.value.end * itemsPerRow.value
  
  return props.items.slice(startIndex, Math.min(endIndex, props.items.length))
})

// Calculate offset for virtual scrolling
const offsetY = computed(() => {
  return visibleRange.value.start * props.itemHeight
})

// Calculate remaining height
const remainingHeight = computed(() => {
  const totalHeight = totalRows.value * props.itemHeight
  const visibleHeight = (visibleRange.value.end - visibleRange.value.start) * props.itemHeight
  return Math.max(0, totalHeight - offsetY.value - visibleHeight)
})

// Handle scroll events
const handleScroll = useDebounceFn(() => {
  if (!containerRef.value) return
  
  scrollTop.value = containerRef.value.scrollTop
  
  // Check if we need to load more items
  const scrollHeight = containerRef.value.scrollHeight
  const clientHeight = containerRef.value.clientHeight
  const scrollPosition = scrollTop.value + clientHeight
  
  // Load more when 80% scrolled
  if (scrollPosition >= scrollHeight * 0.8) {
    emit('loadMore')
  }
}, 16) // ~60fps

// Optimize scroll performance
const optimizeScrolling = () => {
  if (!containerRef.value) return
  
  // Enable hardware acceleration
  containerRef.value.style.transform = 'translateZ(0)'
  containerRef.value.style.willChange = 'scroll-position'
}

// Cleanup optimizations
const cleanupOptimizations = () => {
  if (!containerRef.value) return
  
  containerRef.value.style.transform = ''
  containerRef.value.style.willChange = ''
}

onMounted(() => {
  optimizeScrolling()
})

onUnmounted(() => {
  cleanupOptimizations()
})

// Expose methods for parent component
defineExpose({
  scrollToTop: () => {
    if (containerRef.value) {
      containerRef.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },
  scrollToItem: (index: number) => {
    if (containerRef.value) {
      const row = Math.floor(index / itemsPerRow.value)
      const targetScrollTop = row * props.itemHeight
      containerRef.value.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
    }
  }
})
</script>

<style scoped>
.virtual-scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
  scroll-behavior: smooth;
}

.virtual-item {
  contain: layout style paint; /* CSS containment for performance */
}

/* Optimize for mobile */
@media (max-width: 768px) {
  .virtual-scroll-container {
    /* Reduce scroll momentum on mobile for better control */
    -webkit-overflow-scrolling: auto;
  }
}
</style>