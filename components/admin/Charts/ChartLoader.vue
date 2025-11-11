<script setup lang="ts">
import { defineAsyncComponent, defineComponent, h, ref, onMounted, onBeforeUnmount, watch, type PropType } from 'vue'
import type { ChartConfiguration, ChartType, ChartData, ChartOptions } from 'chart.js'

/**
 * ChartLoader - Async wrapper for Chart.js
 *
 * Lazy loads Chart.js library (240KB) only when the component is mounted.
 * Reduces initial bundle size by code-splitting Chart.js on admin pages.
 *
 * @example
 * <ChartLoader
 *   type="line"
 *   :data="chartData"
 *   :options="chartOptions"
 * />
 */

const props = defineProps({
  /**
   * Chart type to render
   */
  type: {
    type: String as PropType<'line' | 'bar' | 'doughnut' | 'pie'>,
    required: true,
    validator: (value: string) => ['line', 'bar', 'doughnut', 'pie'].includes(value)
  },

  /**
   * Chart data configuration
   */
  data: {
    type: Object as PropType<ChartData>,
    required: true
  },

  /**
   * Chart options configuration
   */
  options: {
    type: Object as PropType<ChartOptions>,
    default: () => ({
      responsive: true,
      maintainAspectRatio: true
    })
  },

  /**
   * Chart canvas height
   */
  height: {
    type: Number,
    default: 300
  },

  /**
   * Chart canvas width
   */
  width: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits<{
  'chart-created': [chart: any]
  'chart-destroyed': []
  'error': [error: Error]
}>()

/**
 * Async Chart Component with Chart.js lazy loading
 */
const ChartComponent = defineAsyncComponent({
  loader: async () => {
    try {
      // Dynamic import of Chart.js - only loads when component is used
      const { Chart, registerables } = await import('chart.js')

      // Register all Chart.js components (scales, elements, controllers, etc.)
      Chart.register(...registerables)

      // Return a Vue component that renders the chart
      return defineComponent({
        name: 'ChartRenderer',
        props: {
          type: String as PropType<ChartType>,
          data: Object as PropType<ChartData>,
          options: Object as PropType<ChartOptions>,
          height: Number,
          width: Number
        },
        emits: ['chart-created', 'chart-destroyed', 'error'],
        setup(innerProps, { emit: innerEmit }) {
          const canvasRef = ref<HTMLCanvasElement>()
          let chartInstance: InstanceType<typeof Chart> | null = null

          /**
           * Initialize Chart.js instance
           */
          const initChart = () => {
            if (!canvasRef.value) return

            try {
              // Destroy existing instance if any
              if (chartInstance) {
                chartInstance.destroy()
                chartInstance = null
              }

              // Create new chart instance
              const config: ChartConfiguration = {
                type: innerProps.type as ChartType,
                data: innerProps.data as ChartData,
                options: innerProps.options as ChartOptions
              }

              chartInstance = new Chart(canvasRef.value, config)

              // Emit chart-created event with instance
              innerEmit('chart-created', chartInstance)
            } catch (error) {
              console.error('Failed to initialize chart:', error)
              innerEmit('error', error instanceof Error ? error : new Error('Chart initialization failed'))
            }
          }

          /**
           * Update chart data reactively
           */
          const updateChart = () => {
            if (!chartInstance) return

            try {
              // Update chart data
              chartInstance.data = innerProps.data as ChartData

              // Update chart options if provided
              if (innerProps.options) {
                chartInstance.options = innerProps.options as ChartOptions
              }

              // Re-render chart
              chartInstance.update()
            } catch (error) {
              console.error('Failed to update chart:', error)
              innerEmit('error', error instanceof Error ? error : new Error('Chart update failed'))
            }
          }

          // Initialize chart on mount
          onMounted(() => {
            initChart()
          })

          // Watch for data changes and update chart
          watch(
            () => innerProps.data,
            () => {
              updateChart()
            },
            { deep: true }
          )

          // Watch for options changes and update chart
          watch(
            () => innerProps.options,
            () => {
              updateChart()
            },
            { deep: true }
          )

          // Watch for type changes and reinitialize chart
          watch(
            () => innerProps.type,
            () => {
              initChart()
            }
          )

          // Cleanup chart instance on unmount
          onBeforeUnmount(() => {
            if (chartInstance) {
              chartInstance.destroy()
              chartInstance = null
              innerEmit('chart-destroyed')
            }
          })

          // Render canvas element
          return () => h('canvas', {
            ref: canvasRef,
            height: innerProps.height,
            width: innerProps.width,
            'aria-label': `${innerProps.type} chart`,
            role: 'img'
          })
        }
      })
    } catch (error) {
      console.error('Failed to load Chart.js:', error)
      throw error
    }
  },

  /**
   * Loading component - shown while Chart.js is being loaded
   */
  loadingComponent: defineComponent({
    name: 'ChartLoadingSkeleton',
    props: {
      height: Number
    },
    setup(skeletonProps) {
      return () => h('div', {
        class: 'chart-loader-skeleton',
        style: {
          width: '100%',
          height: `${skeletonProps.height || 300}px`,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }
      }, 'Loading chart...')
    }
  }),

  /**
   * Error component - shown if Chart.js fails to load
   */
  errorComponent: defineComponent({
    name: 'ChartError',
    props: {
      error: Object as PropType<Error>,
      height: Number
    },
    setup(errorProps) {
      return () => h('div', {
        class: 'chart-loader-error',
        style: {
          width: '100%',
          height: `${errorProps.height || 300}px`,
          background: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c53030',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }
      }, [
        h('div', {
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }
        }, 'Failed to load chart'),
        h('div', {
          style: {
            fontSize: '12px',
            color: '#9b2c2c',
            textAlign: 'center'
          }
        }, errorProps.error?.message || 'An error occurred while loading the chart library')
      ])
    }
  }),

  // Delay before showing loading component (avoids flash for fast loads)
  delay: 200,

  // Timeout for loading (10 seconds)
  timeout: 10000
})

/**
 * Handle chart creation event
 */
const handleChartCreated = (chart: any) => {
  emit('chart-created', chart)
}

/**
 * Handle chart destroyed event
 */
const handleChartDestroyed = () => {
  emit('chart-destroyed')
}

/**
 * Handle error event
 */
const handleError = (error: Error) => {
  emit('error', error)
}
</script>

<template>
  <div class="chart-loader-wrapper">
    <ChartComponent
      :type="type"
      :data="data"
      :options="options"
      :height="height"
      :width="width"
      @chart-created="handleChartCreated"
      @chart-destroyed="handleChartDestroyed"
      @error="handleError"
    />
  </div>
</template>

<style scoped>
.chart-loader-wrapper {
  width: 100%;
  position: relative;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.chart-loader-skeleton,
.chart-loader-error {
  box-sizing: border-box;
}
</style>
