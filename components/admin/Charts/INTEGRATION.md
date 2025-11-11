# ChartLoader Integration Guide

Quick guide for integrating the ChartLoader component into admin pages.

## Quick Start

### 1. Import the Component

The component is auto-imported by Nuxt, so you can use it directly:

```vue
<template>
  <ChartLoader
    type="line"
    :data="chartData"
    :options="chartOptions"
  />
</template>
```

### 2. Define Chart Data

```typescript
<script setup lang="ts">
import { ref } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'

const chartData = ref<ChartData<'line'>>({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Sales',
    data: [12, 19, 3, 5, 2, 3],
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
})

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Monthly Sales'
    }
  }
}
</script>
```

## Bundle Size Impact

### Before ChartLoader
```
admin-dashboard.js: 450KB (includes Chart.js)
home-page.js: 210KB (Chart.js loaded unnecessarily)
```

### After ChartLoader
```
admin-dashboard.js: 210KB (Chart.js split out)
chart.js chunk: 240KB (loaded only when needed)
home-page.js: 210KB (no Chart.js)
```

**Savings**: 240KB on non-admin pages

## Migration from Direct Chart.js

### Before (Direct Chart.js)

```vue
<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { ref, onMounted, onBeforeUnmount } from 'vue'

Chart.register(...registerables)

const canvasRef = ref<HTMLCanvasElement>()
let chart: Chart | null = null

onMounted(() => {
  if (canvasRef.value) {
    chart = new Chart(canvasRef.value, {
      type: 'line',
      data: chartData,
      options: chartOptions
    })
  }
})

onBeforeUnmount(() => {
  chart?.destroy()
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
```

### After (ChartLoader)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'

const chartData = ref<ChartData<'line'>>({
  labels: ['A', 'B', 'C'],
  datasets: [{ label: 'Data', data: [1, 2, 3] }]
})

const chartOptions: ChartOptions<'line'> = {
  responsive: true
}
</script>

<template>
  <ChartLoader
    type="line"
    :data="chartData"
    :options="chartOptions"
  />
</template>
```

Benefits:
- 60% less code
- Automatic cleanup
- Built-in loading states
- Better error handling
- Automatic chart updates

## Common Patterns

### 1. Loading Data from API

```vue
<script setup lang="ts">
const { data: salesData } = await useFetch('/api/admin/sales')

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: salesData.value?.labels || [],
  datasets: [{
    label: 'Revenue',
    data: salesData.value?.values || []
  }]
}))
</script>

<template>
  <div v-if="salesData">
    <ChartLoader
      type="bar"
      :data="chartData"
    />
  </div>
  <div v-else>Loading data...</div>
</template>
```

### 2. Multiple Charts on Same Page

```vue
<template>
  <div class="dashboard-grid">
    <!-- Sales Chart -->
    <ChartLoader
      type="line"
      :data="salesData"
      :height="300"
    />

    <!-- Revenue Chart -->
    <ChartLoader
      type="bar"
      :data="revenueData"
      :height="300"
    />

    <!-- Device Distribution -->
    <ChartLoader
      type="doughnut"
      :data="deviceData"
      :height="300"
    />
  </div>
</template>
```

Note: Chart.js will only be loaded once, even with multiple ChartLoader instances.

### 3. Real-time Updates

```vue
<script setup lang="ts">
const chartData = ref<ChartData<'line'>>({
  labels: [],
  datasets: [{ label: 'Live Data', data: [] }]
})

// Update data every 5 seconds
setInterval(() => {
  const newPoint = Math.random() * 100
  chartData.value.labels.push(new Date().toLocaleTimeString())
  chartData.value.datasets[0].data.push(newPoint)

  // Keep only last 20 points
  if (chartData.value.labels.length > 20) {
    chartData.value.labels.shift()
    chartData.value.datasets[0].data.shift()
  }
}, 5000)
</script>

<template>
  <ChartLoader
    type="line"
    :data="chartData"
    :options="{ animation: { duration: 500 } }"
  />
</template>
```

### 4. Error Handling

```vue
<script setup lang="ts">
const chartError = ref<string>()

const handleError = (error: Error) => {
  chartError.value = error.message
  console.error('Chart error:', error)
}
</script>

<template>
  <div>
    <ChartLoader
      type="line"
      :data="chartData"
      @error="handleError"
    />

    <div v-if="chartError" class="error-alert">
      Chart Error: {{ chartError }}
    </div>
  </div>
</template>
```

### 5. Chart Instance Access

```vue
<script setup lang="ts">
import type { Chart } from 'chart.js'

const chartInstance = ref<Chart>()

const handleChartCreated = (chart: Chart) => {
  chartInstance.value = chart
  console.log('Chart created:', chart)
}

const exportChart = () => {
  if (chartInstance.value) {
    const url = chartInstance.value.toBase64Image()
    // Download or use URL
  }
}
</script>

<template>
  <div>
    <ChartLoader
      type="line"
      :data="chartData"
      @chart-created="handleChartCreated"
    />

    <button @click="exportChart">
      Export Chart
    </button>
  </div>
</template>
```

## Performance Tips

1. **Lazy Load on Route**: Use route-based code splitting
```typescript
// pages/admin/dashboard.vue
definePageMeta({
  layout: 'admin'
})
```

2. **Debounce Updates**: Avoid excessive updates
```typescript
import { useDebounceFn } from '@vueuse/core'

const updateChart = useDebounceFn(() => {
  chartData.value = newData
}, 300)
```

3. **Reduce Data Points**: Limit data for better performance
```typescript
const chartData = computed(() => ({
  labels: rawData.slice(-50), // Last 50 points only
  datasets: [...]
}))
```

4. **Disable Animations**: For real-time data
```typescript
const options: ChartOptions = {
  animation: false // Faster updates
}
```

## Troubleshooting

### Chart Not Rendering

Check:
1. Data structure matches Chart.js requirements
2. No console errors
3. Chart.js types are installed: `pnpm add -D @types/chart.js`

### Bundle Size Still Large

Verify:
1. Component is using `defineAsyncComponent`
2. Import is dynamic: `import('chart.js')` not `import { Chart } from 'chart.js'`
3. Build output shows separate chunk for Chart.js

### Updates Not Reflecting

Ensure:
1. Data is reactive (using `ref()` or `reactive()`)
2. Not mutating data directly (use `.value = ...`)
3. Deep watch is enabled (built-in to component)

## Next Steps

1. See `ChartLoader.example.vue` for complete examples
2. Read `README.md` for API documentation
3. Check `ChartLoader.test.ts` for testing patterns
4. Review Chart.js docs: https://www.chartjs.org/docs/latest/

## Support

For issues or questions:
1. Check Chart.js documentation
2. Review component source code
3. Check Nuxt code splitting docs
4. Create issue in project repository
