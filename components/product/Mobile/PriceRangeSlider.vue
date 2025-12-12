<template>
  <div class="price-range-slider">
    <!-- Price Display -->
    <div class="flex items-center justify-between mb-4">
      <div class="text-sm text-gray-600">
        <span class="font-medium">€{{ localValue[0] }}</span>
      </div>
      <div class="text-sm text-gray-600">
        <span class="font-medium">€{{ localValue[1] }}</span>
      </div>
    </div>

    <!-- Dual Range Slider -->
    <div class="relative">
      <div class="relative h-2 bg-gray-200 rounded-lg">
        <!-- Track highlight -->
        <div
          class="absolute h-2 bg-blue-600 rounded-lg"
          :style="{
            left: `${((localValue[0] - min) / (max - min)) * 100}%`,
            width: `${((localValue[1] - localValue[0]) / (max - min)) * 100}%`,
          }"
        ></div>

        <!-- Min thumb -->
        <div
          class="absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full cursor-pointer transform -translate-y-1.5 -translate-x-2.5 hover:scale-110 transition-transform"
          :style="{ left: `${((localValue[0] - min) / (max - min)) * 100}%` }"
          @mousedown="startDrag('min', $event)"
          @touchstart="startDrag('min', $event)"
        ></div>

        <!-- Max thumb -->
        <div
          class="absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full cursor-pointer transform -translate-y-1.5 -translate-x-2.5 hover:scale-110 transition-transform"
          :style="{ left: `${((localValue[1] - min) / (max - min)) * 100}%` }"
          @mousedown="startDrag('max', $event)"
          @touchstart="startDrag('max', $event)"
        ></div>
      </div>

      <!-- Hidden range inputs for accessibility -->
      <input
        v-model.number="localValue[0]"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        :aria-label="$t('products.filters.minPrice')"
        @input="updateValue"
      />
      <input
        v-model.number="localValue[1]"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        :aria-label="$t('products.filters.maxPrice')"
        @input="updateValue"
      />
    </div>

    <!-- Price Input Fields -->
    <div class="flex items-center space-x-3 mt-4">
      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">
          {{ $t('products.filters.minPrice') }}
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
          <input
            v-model.number="localValue[0]"
            type="number"
            :min="min"
            :max="localValue[1]"
            :step="step"
            class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            @input="updateValue"
          />
        </div>
      </div>

      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">
          {{ $t('products.filters.maxPrice') }}
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
          <input
            v-model.number="localValue[1]"
            type="number"
            :min="localValue[0]"
            :max="max"
            :step="step"
            class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            @input="updateValue"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  min: number
  max: number
  value: [number, number]
  step?: number
}

interface Emits {
  (e: 'update:value', value: [number, number]): void
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
})

const emit = defineEmits<Emits>()

// Local reactive state
const localValue = ref<[number, number]>([...props.value])
const isDragging = ref(false)
const dragType = ref<'min' | 'max' | null>(null)

// Methods
// Debounce utility
let updateTimeout: NodeJS.Timeout

const updateValue = () => {
  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => {
    // Ensure min <= max
    if (localValue.value[0] > localValue.value[1]) {
      if (dragType.value === 'min') {
        localValue.value[1] = localValue.value[0]
      }
      else {
        localValue.value[0] = localValue.value[1]
      }
    }

    // Clamp values to bounds
    localValue.value[0] = Math.max(props.min, Math.min(props.max, localValue.value[0]))
    localValue.value[1] = Math.max(props.min, Math.min(props.max, localValue.value[1]))

    emit('update:value', [...localValue.value])
  }, 300)
}

const startDrag = (type: 'min' | 'max', event: MouseEvent | TouchEvent) => {
  isDragging.value = true
  dragType.value = type

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return

    const rect = (event.target as HTMLElement).closest('.relative')?.getBoundingClientRect()
    if (!rect) return

    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newValue = props.min + percentage * (props.max - props.min)

    if (type === 'min') {
      localValue.value[0] = Math.min(newValue, localValue.value[1])
    }
    else {
      localValue.value[1] = Math.max(newValue, localValue.value[0])
    }

    updateValue()
  }

  const handleEnd = () => {
    isDragging.value = false
    dragType.value = null
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)

  event.preventDefault()
}

// Watch for external value changes
watch(() => props.value, (newValue) => {
  localValue.value = [...newValue]
}, { deep: true })

// Initialize local value
onMounted(() => {
  localValue.value = [...props.value]
})
</script>
