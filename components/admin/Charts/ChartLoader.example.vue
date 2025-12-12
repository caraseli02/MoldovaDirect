<script setup lang="ts">
import { ref } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'

/**
 * Example usage of ChartLoader component
 *
 * This demonstrates how to use the async Chart.js wrapper
 * with different chart types and reactive data updates.
 */

// Line Chart Example
const lineChartData = ref<ChartData<'line'>>({
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      label: 'Sales 2024',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1,
    },
    {
      label: 'Sales 2023',
      data: [45, 49, 60, 71, 46, 45],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.1,
    },
  ],
})

const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Monthly Sales Comparison',
    },
  },
}

// Bar Chart Example
const barChartData = ref<ChartData<'bar'>>({
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Revenue',
      data: [12000, 19000, 15000, 22000],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1,
    },
  ],
})

const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Quarterly Revenue',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return '$' + value.toLocaleString()
        },
      },
    },
  },
}

// Doughnut Chart Example
const doughnutChartData = ref<ChartData<'doughnut'>>({
  labels: ['Desktop', 'Mobile', 'Tablet'],
  datasets: [
    {
      label: 'Traffic Sources',
      data: [55, 35, 10],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    },
  ],
})

const doughnutChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Traffic by Device Type',
    },
  },
}

// Pie Chart Example
const pieChartData = ref<ChartData<'pie'>>({
  labels: ['Orders', 'Processing', 'Shipped', 'Delivered'],
  datasets: [
    {
      label: 'Order Status',
      data: [15, 8, 22, 155],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(75, 192, 192, 0.7)',
      ],
      borderWidth: 1,
    },
  ],
})

const pieChartOptions: ChartOptions<'pie'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: true,
      text: 'Order Status Distribution',
    },
  },
}

// Event handlers
const handleChartCreated = (_chart: any) => {
  // Chart created
}

const handleChartDestroyed = () => {
  // Chart destroyed
}

const handleError = (error: Error) => {
  console.error('Chart error:', error)
}

// Example: Update data reactively
const updateLineChartData = () => {
  const dataset1 = lineChartData.value.datasets[0]
  const dataset2 = lineChartData.value.datasets[1]

  if (!dataset1 || !dataset2) return

  const newData = {
    ...lineChartData.value,
    datasets: [
      {
        ...dataset1,
        data: (dataset1.data as number[]).map(() => Math.floor(Math.random() * 100)),
      },
      {
        ...dataset2,
        data: (dataset2.data as number[]).map(() => Math.floor(Math.random() * 100)),
      },
    ],
  }
  lineChartData.value = newData as any
}
</script>

<template>
  <div class="chart-examples">
    <h1>Chart.js Async Loading Examples</h1>

    <div class="example-section">
      <h2>Line Chart</h2>
      <ChartLoader
        type="line"
        :data="lineChartData"
        :options="lineChartOptions"
        :height="300"
        @chart-created="handleChartCreated"
        @chart-destroyed="handleChartDestroyed"
        @error="handleError"
      />
      <button @click="updateLineChartData">
        Update Data
      </button>
    </div>

    <div class="example-section">
      <h2>Bar Chart</h2>
      <ChartLoader
        type="bar"
        :data="barChartData"
        :options="barChartOptions"
        :height="300"
        @chart-created="handleChartCreated"
        @error="handleError"
      />
    </div>

    <div class="example-section">
      <h2>Doughnut Chart</h2>
      <ChartLoader
        type="doughnut"
        :data="doughnutChartData"
        :options="doughnutChartOptions"
        :height="300"
        @chart-created="handleChartCreated"
        @error="handleError"
      />
    </div>

    <div class="example-section">
      <h2>Pie Chart</h2>
      <ChartLoader
        type="pie"
        :data="pieChartData"
        :options="pieChartOptions"
        :height="300"
        @chart-created="handleChartCreated"
        @error="handleError"
      />
    </div>
  </div>
</template>

<style scoped>
.chart-examples {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

h2 {
  color: #34495e;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #2980b9;
}
</style>
