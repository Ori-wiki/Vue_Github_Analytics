<script setup lang="ts">
import { computed } from 'vue'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import type { ContributionDay } from '../../types/github'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps<{
  contributions: ContributionDay[]
}>()

const chartData = computed(() => ({
  labels: props.contributions.map((item) => item.date.slice(5)),
  datasets: [
    {
      label: 'Activity',
      data: props.contributions.map((item) => item.count),
      backgroundColor: '#10b981',
      borderRadius: 4,
      maxBarThickness: 18,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 7,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#e2e8f0',
      },
      ticks: {
        color: '#64748b',
        precision: 0,
      },
    },
  },
  plugins: {
    tooltip: {
      displayColors: false,
    },
  },
}
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div class="mb-4">
      <h2 class="text-lg font-bold text-slate-950">Contribution chart</h2>
      <p class="text-sm text-slate-500">Estimated from recent public events</p>
    </div>

    <div class="h-72">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>
