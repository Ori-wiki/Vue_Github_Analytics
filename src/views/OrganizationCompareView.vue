<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Building2 } from '@lucide/vue'
import StateNotice from '../components/StateNotice.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { fetchGithubOrganization, fetchGithubOrganizationRepositories } from '../queries/githubQueries'
import type { AppStatus, GithubOrganization, GithubRepository } from '../types/github'
import { getLanguageStats, getRepositoryHealth, getTotalStars } from '../utils/analytics'
import { formatNumber } from '../utils/format'
import { getGithubErrorStatus, getStatusMessage } from '../utils/githubErrors'

const route = useRoute()
const status = ref<AppStatus>('idle')
const leftOrg = ref<GithubOrganization | null>(null)
const rightOrg = ref<GithubOrganization | null>(null)
const leftRepos = ref<GithubRepository[]>([])
const rightRepos = ref<GithubRepository[]>([])

const left = computed(() => getParam('left'))
const right = computed(() => getParam('right'))
const error = computed(() => getStatusMessage(status.value))
const leftStats = computed(() => getOrgStats(leftRepos.value))
const rightStats = computed(() => getOrgStats(rightRepos.value))

watch(() => route.fullPath, loadOrgs, { immediate: true })

async function loadOrgs() {
  status.value = 'loading'

  try {
    const [leftProfile, leftRepositories, rightProfile, rightRepositories] = await Promise.all([
      fetchGithubOrganization(left.value),
      fetchGithubOrganizationRepositories(left.value),
      fetchGithubOrganization(right.value),
      fetchGithubOrganizationRepositories(right.value),
    ])

    leftOrg.value = leftProfile
    leftRepos.value = leftRepositories
    rightOrg.value = rightProfile
    rightRepos.value = rightRepositories
    status.value = 'ready'
  } catch (unknownError) {
    status.value = getGithubErrorStatus(unknownError)
  }
}

function getParam(key: string) {
  const value = route.params[key]
  return Array.isArray(value) ? value[0] : value
}

function getOrgStats(repositories: GithubRepository[]) {
  const healthScores = repositories.map((repository) => getRepositoryHealth(repository).score)

  return {
    totalStars: getTotalStars(repositories),
    repos: repositories.length,
    topLanguage: getLanguageStats(repositories)[0]?.name ?? 'No data',
    activeRepos: repositories.filter((repository) => !repository.archived).length,
    averageHealth: healthScores.length
      ? Math.round(healthScores.reduce((total, score) => total + score, 0) / healthScores.length)
      : 0,
  }
}
</script>

<template>
  <main class="app-shell">
    <div class="page-wrap flex flex-col gap-6">
      <header class="surface flex items-start justify-between gap-4 p-5">
        <div>
          <p class="eyebrow">Org vs Org</p>
          <h1 class="mt-2 text-4xl font-black text-slate-950">@{{ left }} vs @{{ right }}</h1>
        </div>
        <ThemeToggle />
      </header>

      <StateNotice
        v-if="status !== 'ready' && status !== 'loading'"
        title="Organization comparison error"
        :description="error"
        :icon="Building2"
        tone="error"
        @retry="loadOrgs"
      />

      <div v-if="status === 'loading'" class="surface p-5">
        <div class="skeleton h-10 w-80" />
        <div class="skeleton mt-4 h-40 w-full" />
      </div>

      <section v-if="leftOrg && rightOrg" class="surface overflow-hidden">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-5 py-3">Metric</th>
              <th class="px-5 py-3">@{{ leftOrg.login }}</th>
              <th class="px-5 py-3">@{{ rightOrg.login }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="px-5 py-4 font-bold">Total stars</td>
              <td class="px-5 py-4">{{ formatNumber(leftStats.totalStars) }}</td>
              <td class="px-5 py-4">{{ formatNumber(rightStats.totalStars) }}</td>
            </tr>
            <tr>
              <td class="px-5 py-4 font-bold">Repos</td>
              <td class="px-5 py-4">{{ leftStats.repos }}</td>
              <td class="px-5 py-4">{{ rightStats.repos }}</td>
            </tr>
            <tr>
              <td class="px-5 py-4 font-bold">Top language</td>
              <td class="px-5 py-4">{{ leftStats.topLanguage }}</td>
              <td class="px-5 py-4">{{ rightStats.topLanguage }}</td>
            </tr>
            <tr>
              <td class="px-5 py-4 font-bold">Active repos</td>
              <td class="px-5 py-4">{{ leftStats.activeRepos }}</td>
              <td class="px-5 py-4">{{ rightStats.activeRepos }}</td>
            </tr>
            <tr>
              <td class="px-5 py-4 font-bold">Average health</td>
              <td class="px-5 py-4">{{ leftStats.averageHealth }}</td>
              <td class="px-5 py-4">{{ rightStats.averageHealth }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </main>
</template>
