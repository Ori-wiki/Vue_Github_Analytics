<script setup lang="ts">
import { computed } from 'vue'
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js'
import { Bar, Line } from 'vue-chartjs'
import type { GithubCommit, GithubContributor, GithubRelease } from '../types/github'

ChartJS.register(BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip)

const props = defineProps<{
  commits: GithubCommit[]
  issuesByLabel: Array<{ label: string; count: number }>
  releases: GithubRelease[]
  contributors: GithubContributor[]
}>()

const commitFrequency = computed(() => {
  const map = new Map<string, number>()

  for (const commit of props.commits) {
    const day = commit.commit.author.date.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + 1)
  }

  return Array.from(map, ([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))
})

const commitData = computed(() => ({
  labels: commitFrequency.value.map((item) => item.date.slice(5)),
  datasets: [
    {
      label: 'Commits',
      data: commitFrequency.value.map((item) => item.count),
      borderColor: '#2563eb',
      backgroundColor: '#2563eb',
      tension: 0.3,
    },
  ],
}))

const issueData = computed(() => ({
  labels: props.issuesByLabel.map((item) => item.label),
  datasets: [
    {
      label: 'Issues',
      data: props.issuesByLabel.map((item) => item.count),
      backgroundColor: '#f59e0b',
      borderRadius: 5,
    },
  ],
}))

const contributorData = computed(() => ({
  labels: props.contributors.map((item) => item.login),
  datasets: [
    {
      label: 'Contributions',
      data: props.contributors.map((item) => item.contributions),
      backgroundColor: '#10b981',
      borderRadius: 5,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: { displayColors: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#64748b', maxRotation: 0 },
    },
    y: {
      beginAtZero: true,
      grid: { color: '#e2e8f0' },
      ticks: { color: '#64748b', precision: 0 },
    },
  },
}
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-2">
    <div class="surface p-5">
      <h2 class="title-lg">Commit frequency</h2>
      <p class="muted mt-1 text-sm">Recent commits grouped by day</p>
      <div class="mt-4 h-64">
        <Line v-if="commitFrequency.length" :data="commitData" :options="chartOptions" />
        <div v-else class="grid h-full place-items-center text-sm text-slate-500">No commit frequency data.</div>
      </div>
    </div>

    <div class="surface p-5">
      <h2 class="title-lg">Issue labels</h2>
      <p class="muted mt-1 text-sm">Open issues grouped by label</p>
      <div class="mt-4 h-64">
        <Bar v-if="issuesByLabel.length" :data="issueData" :options="chartOptions" />
        <div v-else class="grid h-full place-items-center text-sm text-slate-500">No issue label data.</div>
      </div>
    </div>

    <div class="surface p-5">
      <h2 class="title-lg">Release timeline</h2>
      <p class="muted mt-1 text-sm">Latest public releases</p>
      <div v-if="releases.length" class="mt-4 space-y-3">
        <a
          v-for="release in releases"
          :key="release.id"
          class="block rounded-md border border-slate-200 p-3 transition hover:border-emerald-300"
          :href="release.html_url"
          target="_blank"
          rel="noreferrer"
        >
          <p class="font-bold text-slate-950">{{ release.name ?? release.tag_name }}</p>
          <p class="muted mt-1 text-xs">{{ release.published_at ?? 'Draft or unpublished' }}</p>
        </a>
      </div>
      <p v-else class="mt-4 text-sm text-slate-500">No public releases.</p>
    </div>

    <div class="surface p-5">
      <h2 class="title-lg">Contributors chart</h2>
      <p class="muted mt-1 text-sm">Top contributors by commit count</p>
      <div class="mt-4 h-64">
        <Bar v-if="contributors.length" :data="contributorData" :options="chartOptions" />
        <div v-else class="grid h-full place-items-center text-sm text-slate-500">No contributor data.</div>
      </div>
    </div>
  </section>
</template>
