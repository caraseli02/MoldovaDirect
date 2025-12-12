<template>
  <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 class="text-base font-medium text-gray-900">
          Revenue & Customer Momentum
        </h3>
        <p class="text-sm text-gray-400">
          Compare sales velocity with acquisition trends to spot momentum shifts early.
        </p>
      </div>
      <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Last 7 days</span>
    </header>

    <ClientOnly>
      <div class="mt-6 space-y-6">
        <div
          ref="chartRef"
          class="h-72 w-full"
        ></div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Revenue Today
            </p>
            <div class="mt-2 flex items-baseline gap-2">
              <span :class="['text-xl', summaryDirectionColor(revenueSummary.direction)]">{{ directionEmoji(revenueSummary.direction) }}</span>
              <p class="text-base font-semibold text-gray-900">
                {{ revenueSummary.value }}
              </p>
            </div>
            <p class="text-sm text-gray-400">
              {{ revenueSummary.caption }}
            </p>
            <p
              class="mt-2 text-sm font-medium"
              :class="summaryDirectionColor(revenueSummary.direction)"
            >
              {{ revenueSummary.delta }} vs avg
            </p>
          </div>
          <div class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Customer Activity
            </p>
            <div class="mt-2 flex items-baseline gap-2">
              <span :class="['text-xl', summaryDirectionColor(customerSummary.direction)]">{{ directionEmoji(customerSummary.direction) }}</span>
              <p class="text-base font-semibold text-gray-900">
                {{ customerSummary.value }}
              </p>
            </div>
            <p class="text-sm text-gray-400">
              {{ customerSummary.caption }}
            </p>
            <p
              class="mt-2 text-sm font-medium"
              :class="summaryDirectionColor(customerSummary.direction)"
            >
              {{ customerSummary.delta }} vs avg
            </p>
          </div>
        </div>
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
interface PerformanceDataset {
  categories: string[]
  revenueSeries: number[]
  customerSeries: number[]
}

interface TrendSummary {
  value: string
  delta: string
  caption: string
  direction: 'up' | 'down' | 'flat'
}

const props = defineProps<{ dataset: PerformanceDataset, revenueSummary: TrendSummary, customerSummary: TrendSummary }>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance = null
let apexPromise: Promise<unknown> | null = null

const renderChart = async () => {
  if (typeof window === 'undefined' || !chartRef.value) {
    return
  }

  const ApexCharts = await loadApexCharts()
  if (!ApexCharts || !chartRef.value) {
    return
  }

  const options = {
    chart: {
      type: 'area',
      height: 320,
      toolbar: { show: false },
      animations: { speed: 700 },
    },
    colors: ['#3b82f6', '#22c55e'],
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.6,
        opacityFrom: 0.5,
        opacityTo: 0.1,
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      padding: { left: 12, right: 12 },
    },
    xaxis: {
      categories: props.dataset.categories,
      labels: {
        style: {
          colors: '#94a3b8',
        },
      },
      axisBorder: { color: '#e2e8f0' },
      axisTicks: { color: '#e2e8f0' },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'light',
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: {
        colors: '#475569',
      },
    },
    series: [
      {
        name: 'Revenue',
        data: props.dataset.revenueSeries,
      },
      {
        name: 'New Customers',
        data: props.dataset.customerSeries,
      },
    ],
  }

  if (chartInstance) {
    chartInstance.updateOptions(options)
  }
  else {
    chartInstance = new ApexCharts(chartRef.value, options)
    chartInstance.render()
  }
}

const loadApexCharts = async () => {
  if (typeof window === 'undefined') {
    return null
  }

  if ((window as unknown as Record<string, any>).ApexCharts) {
    return (window as unknown as Record<string, any>).ApexCharts
  }

  if (apexPromise) {
    return apexPromise
  }

  apexPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/apexcharts'
    script.async = true
    script.onload = () => resolve((window as unknown as Record<string, any>).ApexCharts)
    script.onerror = () => reject(new Error('Unable to load ApexCharts script'))
    document.head.appendChild(script)
  })

  try {
    return await apexPromise
  }
  catch (error: any) {
    console.error('Failed to load ApexCharts', error)
    apexPromise = null
    return null
  }
}

const summaryDirectionColor = (direction: TrendSummary['direction']) => {
  if (direction === 'up') return 'text-green-500'
  if (direction === 'down') return 'text-red-500'
  return 'text-gray-400'
}

const directionEmoji = (direction: TrendSummary['direction']) => {
  if (direction === 'up') return '📈'
  if (direction === 'down') return '📉'
  return '➖'
}

onMounted(() => {
  renderChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

watch(
  () => props.dataset,
  () => {
    renderChart()
  },
  { deep: true },
)
</script>
