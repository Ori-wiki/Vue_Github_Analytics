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
import type { AppStatus, CommitStat } from '../../types/github'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps<{
  commits: CommitStat[]
  hasEvents: boolean
  eventsStatus: AppStatus
}>()

const chartData = computed(() => ({
  labels: props.commits.map((item) => item.repo.replace(/^[^/]+\//, '')),
  datasets: [
    {
      label: 'Commits',
      data: props.commits.map((item) => item.commits),
      backgroundColor: '#2563eb',
      borderRadius: 5,
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
  <section class="surface p-5">
    <div class="mb-4">
      <h2 class="title-lg">Commits</h2>
      <p class="muted mt-1 text-sm">Push activity by repository</p>
    </div>

    <div class="h-72">
      <Bar v-if="commits.length" :data="chartData" :options="chartOptions" />
      <div v-else-if="eventsStatus === 'rate-limit'" class="grid h-full place-items-center text-center text-sm text-slate-500">
        Коммиты временно недоступны из-за лимита GitHub API.
      </div>
      <div v-else-if="eventsStatus === 'network-error'" class="grid h-full place-items-center text-center text-sm text-slate-500">
        Не удалось загрузить коммиты из-за ошибки сети.
      </div>
      <div v-else-if="!hasEvents" class="grid h-full place-items-center text-center text-sm text-slate-500">
        Нет public events. Коммиты нельзя оценить по публичной активности.
      </div>
      <div v-else class="grid h-full place-items-center text-center text-sm text-slate-500">
        Public events есть, но push events с коммитами не найдены.
      </div>
    </div>
  </section>
</template>
