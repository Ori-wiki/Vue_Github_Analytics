<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import type { LanguageStat } from '../../types/github'

ChartJS.register(ArcElement, Legend, Tooltip)

const props = defineProps<{
  languages: LanguageStat[]
}>()

const chartData = computed(() => ({
  labels: props.languages.slice(0, 6).map((item) => item.name),
  datasets: [
    {
      data: props.languages.slice(0, 6).map((item) => item.repositories),
      backgroundColor: ['#10b981', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'],
      borderWidth: 0,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 10,
        color: '#475569',
      },
    },
  },
}
</script>

<template>
  <section class="surface p-5">
    <div class="mb-4">
      <h2 class="title-lg">Languages</h2>
      <p class="muted mt-1 text-sm">Top languages by repository count</p>
    </div>

    <div class="h-72">
      <Doughnut v-if="languages.length" :data="chartData" :options="chartOptions" />
      <div v-else class="grid h-full place-items-center text-sm text-slate-500">No language data</div>
    </div>
  </section>
</template>
