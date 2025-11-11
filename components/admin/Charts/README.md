# ChartLoader Component

An async wrapper component for Chart.js that lazy loads the 240KB Chart.js library only when needed, reducing initial bundle size on admin pages.

## Features

- **Lazy Loading**: Chart.js is dynamically imported only when the component is mounted
- **Code Splitting**: Reduces initial bundle size by splitting Chart.js into a separate chunk
- **TypeScript Support**: Full TypeScript definitions with proper type inference
- **Reactive Updates**: Automatically updates charts when data or options change
- **Loading States**: Shows skeleton UI while Chart.js is loading
- **Error Handling**: Gracefully handles loading and runtime errors
- **Cleanup**: Properly destroys chart instances on component unmount
- **Accessibility**: Includes ARIA labels for better screen reader support

## Installation

Chart.js is already installed as a project dependency:

```bash
pnpm add chart.js
```

## Usage

### Basic Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'

const chartData = ref<ChartData<'line'>>({
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [{
    label: 'Sales',
    data: [65, 59, 80, 81, 56],
    borderColor: 'rgb(75, 192, 192)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
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

<template>
  <ChartLoader
    type="line"
    :data="chartData"
    :options="chartOptions"
  />
</template>
```

### Supported Chart Types

- `line` - Line charts
- `bar` - Bar charts
- `doughnut` - Doughnut charts
- `pie` - Pie charts

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | `'line' \| 'bar' \| 'doughnut' \| 'pie'` | Yes | - | Type of chart to render |
| `data` | `ChartData` | Yes | - | Chart data configuration |
| `options` | `ChartOptions` | No | `{ responsive: true, maintainAspectRatio: true }` | Chart options configuration |
| `height` | `number` | No | `300` | Canvas height in pixels |
| `width` | `number` | No | `undefined` | Canvas width in pixels |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `chart-created` | `Chart` | Emitted when chart instance is created |
| `chart-destroyed` | - | Emitted when chart instance is destroyed |
| `error` | `Error` | Emitted when an error occurs during loading or rendering |

### Event Handling Example

```vue
<script setup lang="ts">
const handleChartCreated = (chart: any) => {
  console.log('Chart created:', chart)
  // Access chart instance for advanced operations
}

const handleError = (error: Error) => {
  console.error('Chart error:', error)
  // Show error notification to user
}
</script>

<template>
  <ChartLoader
    type="line"
    :data="chartData"
    :options="chartOptions"
    @chart-created="handleChartCreated"
    @error="handleError"
  />
</template>
```

### Reactive Data Updates

The component automatically watches for data and options changes and updates the chart:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const chartData = ref({
  labels: ['A', 'B', 'C'],
  datasets: [{
    label: 'Dataset',
    data: [10, 20, 30]
  }]
})

// Chart will automatically update when data changes
const updateData = () => {
  chartData.value.datasets[0].data = [15, 25, 35]
}
</script>
```

### Advanced Usage with Custom Options

```vue
<script setup lang="ts">
import type { ChartOptions } from 'chart.js'

const advancedOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Custom Chart Title'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.label}: $${context.parsed.y.toLocaleString()}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '$' + value.toLocaleString()
        }
      }
    }
  }
}
</script>

<template>
  <ChartLoader
    type="bar"
    :data="chartData"
    :options="advancedOptions"
    :height="400"
  />
</template>
```

## Bundle Size Impact

### Before (without lazy loading):
- Initial bundle includes Chart.js: ~240KB
- All pages load Chart.js even if not used

### After (with ChartLoader):
- Initial bundle: No Chart.js overhead
- Chart.js loaded on-demand: ~240KB (only on pages that use charts)
- **Savings**: ~240KB for pages without charts

## Performance Considerations

1. **First Load**: Shows loading skeleton for ~200ms while Chart.js loads
2. **Subsequent Loads**: Chart.js is cached by browser
3. **Code Splitting**: Chart.js is split into separate chunk by build tool
4. **Tree Shaking**: Only used Chart.js components are included

## Loading States

The component shows different UI states:

1. **Loading**: Animated skeleton with "Loading chart..." text
2. **Error**: Red error box with error message
3. **Loaded**: Rendered chart

### Customizing Loading Delay

The component waits 200ms before showing the loading skeleton to avoid flashing on fast connections:

```typescript
// In ChartLoader.vue
delay: 200 // milliseconds
```

## Error Handling

Errors are handled at two levels:

1. **Load Errors**: Chart.js fails to load (network, timeout)
2. **Runtime Errors**: Chart initialization or update fails

Both emit the `error` event and show error UI.

## Browser Support

Same as Chart.js requirements:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills)

## TypeScript

Full TypeScript support with proper type inference:

```typescript
import type { ChartData, ChartOptions, ChartType } from 'chart.js'

// Type-safe chart configuration
const data: ChartData<'line'> = { ... }
const options: ChartOptions<'line'> = { ... }
```

## Examples

See `ChartLoader.example.vue` for complete working examples of all chart types.

## Best Practices

1. **Use only on admin pages**: Don't use for public-facing pages if possible
2. **Provide fallback**: Always handle the `error` event
3. **Optimize data**: Don't pass excessive data points
4. **Clean up**: Component automatically cleans up, but avoid memory leaks in parent
5. **Accessibility**: Provide meaningful labels in chart configuration

## Troubleshooting

### Chart not rendering
- Check that `data` prop has correct structure
- Verify Chart.js types are installed: `@types/chart.js`
- Check browser console for errors

### Loading takes too long
- Check network tab for Chart.js chunk loading
- Increase timeout in component (default: 10s)
- Consider preloading Chart.js on route navigation

### Updates not reflecting
- Ensure data is reactive (use `ref()` or `reactive()`)
- Check that you're modifying the data correctly
- Verify `deep: true` watch is working

## Related Documentation

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Vue 3 Async Components](https://vuejs.org/guide/components/async.html)
- [Nuxt Code Splitting](https://nuxt.com/docs/guide/concepts/code-splitting)

## License

Same as parent project.
