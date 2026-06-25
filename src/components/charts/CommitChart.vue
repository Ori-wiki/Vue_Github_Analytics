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
import type { AnalyticsSource } from '../../stores/githubAnalytics'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps<{
  commits: CommitStat[]
  hasEvents: boolean
  eventsStatus: AppStatus
  source: AnalyticsSource
}>()

const subtitle = computed(() =>
  props.source === 'graphql'
    ? 'Official commit contributions by repository'
    : 'Only recent public PushEvent payloads; private, old and some merged commits are not included',
)

const chartData = computed(() => ({
  labels: props.commits.map((item) => item.repo.replace(/^[^/]+\//, '')),
  datasets: [
    {
      label: props.source === 'graphql' ? 'Commit contributions' : 'Recent public commits',
      data: props.commits.map((item) => item.commits),
      backgroundColor: props.source === 'graphql' ? '#60a5fa' : '#2563eb',
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
        color: '#334155',
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
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 class="title-lg">Commits</h2>
        <p class="muted mt-1 text-sm">{{ subtitle }}</p>
      </div>
      <span
        class="rounded-md border px-2 py-1 text-xs font-black"
        :class="source === 'graphql' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'"
      >
        {{ source === 'graphql' ? 'Official' : 'Estimate' }}
      </span>
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
        Нет recent public PushEvent. Для точных commit contributions добавь GitHub token.
      </div>
      <div v-else class="grid h-full place-items-center text-center text-sm text-slate-500">
        Public events есть, но push events с коммитами не найдены.
      </div>
    </div>
  </section>
</template>
