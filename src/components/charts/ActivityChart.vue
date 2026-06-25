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
import type { AppStatus, ContributionDay } from '../../types/github'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps<{
  contributions: ContributionDay[]
  hasEvents: boolean
  eventsStatus: AppStatus
}>()

const chartData = computed(() => ({
  labels: props.contributions.map((item) => item.date.slice(5)),
  datasets: [
    {
      label: 'Activity',
      data: props.contributions.map((item) => item.count),
      backgroundColor: '#059669',
      borderRadius: 5,
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
  <section class="surface p-5">
    <div class="mb-4">
      <h2 class="title-lg">Contribution chart</h2>
      <p class="muted mt-1 text-sm">Estimated from recent public events</p>
    </div>

    <div class="h-72">
      <Bar v-if="hasEvents" :data="chartData" :options="chartOptions" />
      <div v-else-if="eventsStatus === 'rate-limit'" class="grid h-full place-items-center text-center text-sm text-slate-500">
        Public events временно недоступны из-за лимита GitHub API.
      </div>
      <div v-else-if="eventsStatus === 'network-error'" class="grid h-full place-items-center text-center text-sm text-slate-500">
        Не удалось загрузить public events из-за ошибки сети.
      </div>
      <div v-else class="grid h-full place-items-center text-center text-sm text-slate-500">
        Нет public events. GitHub не вернул публичную активность для этого пользователя.
      </div>
    </div>
  </section>
</template>
