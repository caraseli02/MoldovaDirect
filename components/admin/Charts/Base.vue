<template>
  <div class="relative">
    <canvas
      ref="chartCanvas"
      :width="width"
      :height="height"
      class="max-w-full"
    ></canvas>
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-lg"
    >
      <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span class="text-sm">Loading chart...</span>
      </div>
    </div>
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-lg"
    >
      <div class="text-center text-red-600 dark:text-red-400">
        <p class="text-sm font-medium">
          Failed to load chart
        </p>
        <p class="text-xs mt-1">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  LineController,
  BarController,
  DoughnutController,
  PieController,
  ArcElement,
  type ChartConfiguration,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  LineController,
  BarController,
  DoughnutController,
  PieController,
)

interface Props {
  type: 'line' | 'bar' | 'doughnut' | 'pie'
  data: ChartData
  options?: ChartOptions
  width?: number
  height?: number
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 200,
  loading: false,
  error: null,
})

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

// Default chart options
const defaultOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        color: '#374151', // gray-700
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      intersect: false,
      mode: 'index',
    },
  },
  scales: {
    x: {
      grid: {
        color: '#f3f4f6', // gray-100
        drawOnChartArea: true,
      },
      ticks: {
        color: '#6b7280', // gray-500
      },
    },
    y: {
      grid: {
        color: '#f3f4f6', // gray-100
        drawOnChartArea: true,
      },
      ticks: {
        color: '#6b7280', // gray-500
      },
      beginAtZero: true,
    },
  },
}

// Merge options
const mergedOptions = computed(() => {
  return {
    ...defaultOptions,
    ...props.options,
  }
})

// Create chart
const createChart = () => {
  if (!chartCanvas.value || props.loading || props.error) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const config: ChartConfiguration = {
    type: props.type,
    data: props.data,
    options: mergedOptions.value,
  }

  chartInstance = new Chart(chartCanvas.value, config)
}

// Update chart data
const updateChart = () => {
  if (!chartInstance || props.loading || props.error) return

  chartInstance.data = props.data
  chartInstance.options = mergedOptions.value
  chartInstance.update('none')
}

// Watch for data changes
watch(() => props.data, () => {
  if (chartInstance) {
    updateChart()
  }
  else {
    createChart()
  }
}, { deep: true })

// Watch for options changes
watch(() => props.options, () => {
  if (chartInstance) {
    updateChart()
  }
}, { deep: true })

// Watch for loading/error state changes
watch(() => [props.loading, props.error], () => {
  if (!props.loading && !props.error && chartCanvas.value) {
    nextTick(() => {
      createChart()
    })
  }
})

// Initialize chart on mount
onMounted(() => {
  nextTick(() => {
    if (!props.loading && !props.error) {
      createChart()
    }
  })
})

// Cleanup on unmount
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

// Handle theme changes
const { $colorMode } = useNuxtApp()
watch(() => ($colorMode as unknown)?.value, (newMode) => {
  if (chartInstance && newMode) {
    // Update colors based on theme
    const isDark = newMode === 'dark'

    if (chartInstance.options.plugins?.legend?.labels) {
      chartInstance.options.plugins.legend.labels.color = isDark ? '#d1d5db' : '#374151'
    }

    if (chartInstance.options.scales?.x?.grid) {
      chartInstance.options.scales.x.grid.color = isDark ? '#374151' : '#f3f4f6'
    }

    if (chartInstance.options.scales?.x?.ticks) {
      chartInstance.options.scales.x.ticks.color = isDark ? '#9ca3af' : '#6b7280'
    }

    if (chartInstance.options.scales?.y?.grid) {
      chartInstance.options.scales.y.grid.color = isDark ? '#374151' : '#f3f4f6'
    }

    if (chartInstance.options.scales?.y?.ticks) {
      chartInstance.options.scales.y.ticks.color = isDark ? '#9ca3af' : '#6b7280'
    }

    chartInstance.update('none')
  }
})
</script>
