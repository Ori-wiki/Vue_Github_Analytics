<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Download, FileText, Printer } from '@lucide/vue'
import StateNotice from '../components/StateNotice.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { fetchGithubEvents, fetchGithubRepositories, fetchGithubUser } from '../queries/githubQueries'
import { routeNames } from '../router/routes'
import type { AppStatus, ComparisonProfile } from '../types/github'
import { getComparisonProfile } from '../utils/analytics'
import { exportHtmlFile, exportJsonFile } from '../utils/exportRepositories'
import { getGithubErrorStatus, getStatusMessage } from '../utils/githubErrors'

const route = useRoute()
const status = ref<AppStatus>('idle')
const leftProfile = ref<ComparisonProfile | null>(null)
const rightProfile = ref<ComparisonProfile | null>(null)

const username = computed(() => getParam('username'))
const compareUsername = computed(() => getParam('compareUsername'))
const error = computed(() => getStatusMessage(status.value))
const winner = computed(() => {
  if (!leftProfile.value || !rightProfile.value) return ''
  if (leftProfile.value.totalScore === rightProfile.value.totalScore) return 'The comparison is evenly matched.'
  return leftProfile.value.totalScore > rightProfile.value.totalScore
    ? `@${leftProfile.value.username} wins this report.`
    : `@${rightProfile.value.username} wins this report.`
})

watch(() => route.fullPath, loadReport, { immediate: true })

async function loadReport() {
  status.value = 'loading'

  try {
    const [leftUser, leftRepos, leftEvents, rightUser, rightRepos, rightEvents] = await Promise.all([
      fetchGithubUser(username.value),
      fetchGithubRepositories(username.value),
      fetchGithubEvents(username.value),
      fetchGithubUser(compareUsername.value),
      fetchGithubRepositories(compareUsername.value),
      fetchGithubEvents(compareUsername.value),
    ])

    leftProfile.value = getComparisonProfile(leftUser, leftRepos, leftEvents)
    rightProfile.value = getComparisonProfile(rightUser, rightRepos, rightEvents)
    status.value = 'ready'
  } catch (unknownError) {
    status.value = getGithubErrorStatus(unknownError)
  }
}

function getParam(key: string) {
  const value = route.params[key]
  return Array.isArray(value) ? value[0] : value
}

function exportReport() {
  if (!leftProfile.value || !rightProfile.value) {
    return
  }

  const report = {
    left: leftProfile.value,
    right: rightProfile.value,
    winner: winner.value,
  }

  exportJsonFile(`${leftProfile.value.username}-vs-${rightProfile.value.username}-report.json`, report)
  exportHtmlFile(`${leftProfile.value.username}-vs-${rightProfile.value.username}-report.html`, document.documentElement.outerHTML)
}

function printReport() {
  window.print()
}
</script>

<template>
  <main class="app-shell">
    <div class="page-wrap flex flex-col gap-6">
      <header class="surface flex items-start justify-between gap-4 p-5">
        <div>
          <p class="eyebrow">Compare report</p>
          <h1 class="mt-2 text-4xl font-black text-slate-950">@{{ username }} vs @{{ compareUsername }}</h1>
          <p class="muted mt-2 text-sm">Narrative summary, score breakdown and key comparison signals.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="btn-secondary" type="button" @click="exportReport">
            <Download class="size-4" />
            Export
          </button>
          <button class="btn-secondary" type="button" @click="printReport">
            <Printer class="size-4" />
            Print
          </button>
          <ThemeToggle />
        </div>
      </header>

      <StateNotice
        v-if="status !== 'ready' && status !== 'loading'"
        title="Report loading error"
        :description="error"
        :icon="FileText"
        tone="error"
        @retry="loadReport"
      />

      <div v-if="status === 'loading'" class="surface p-5">
        <div class="skeleton h-10 w-80" />
        <div class="skeleton mt-4 h-40 w-full" />
      </div>

      <template v-if="leftProfile && rightProfile">
        <section class="surface p-5">
          <h2 class="title-lg">{{ winner }}</h2>
          <p class="muted mt-3 text-sm leading-6">
            @{{ leftProfile.username }} has {{ leftProfile.totalStars }} stars and a total score of {{ leftProfile.totalScore }}.
            @{{ rightProfile.username }} has {{ rightProfile.totalStars }} stars and a total score of {{ rightProfile.totalScore }}.
            The strongest language signals are {{ leftProfile.topLanguage }} and {{ rightProfile.topLanguage }}.
          </p>
          <RouterLink class="btn-secondary mt-4" :to="{ name: routeNames.compare, params: { username, compareUsername } }">
            Back to interactive comparison
          </RouterLink>
        </section>

        <section class="surface overflow-hidden">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-5 py-3">Metric</th>
                <th class="px-5 py-3">@{{ leftProfile.username }}</th>
                <th class="px-5 py-3">@{{ rightProfile.username }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="metric in ['popularityScore', 'activityScore', 'maintenanceScore', 'totalScore']" :key="metric">
                <td class="px-5 py-4 font-bold">{{ metric }}</td>
                <td class="px-5 py-4">{{ leftProfile[metric as keyof ComparisonProfile] }}</td>
                <td class="px-5 py-4">{{ rightProfile[metric as keyof ComparisonProfile] }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </template>
    </div>
  </main>
</template>
