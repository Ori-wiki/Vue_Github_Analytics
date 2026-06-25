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
import type { CommitStat } from '../../types/github'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps<{
  commits: CommitStat[]
}>()

const chartData = computed(() => ({
  labels: props.commits.map((item) => item.repo.replace(/^[^/]+\//, '')),
  datasets: [
    {
      label: 'Commits',
      data: props.commits.map((item) => item.commits),
      backgroundColor: '#2563eb',
      borderRadius: 4,
      maxBarThickness: 22,
    },
  ],
}))

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        color: '#64748b',
      },
      grid: {
        color: '#e2e8f0',
      },
    },
    y: {
      ticks: {
        color: '#64748b',
      },
      grid: {
        display: false,
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
      <h2 class="text-lg font-bold text-slate-950">Commits</h2>
      <p class="text-sm text-slate-500">Push activity by repository</p>
    </div>

    <div class="h-72">
      <Bar v-if="commits.length" :data="chartData" :options="chartOptions" />
      <div v-else class="grid h-full place-items-center text-sm text-slate-500">No public push events</div>
    </div>
  </section>
</template>
