<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Building2, Star } from '@lucide/vue'
import LanguageChart from '../components/charts/LanguageChart.vue'
import RepositoryTable from '../components/RepositoryTable.vue'
import StateNotice from '../components/StateNotice.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { fetchGithubOrganization, fetchGithubOrganizationRepositories } from '../queries/githubQueries'
import type { AppStatus, GithubOrganization, GithubRepository, RepoFilters } from '../types/github'
import { filterRepositoriesAdvanced, getLanguageStats, getTotalStars } from '../utils/analytics'
import { formatNumber } from '../utils/format'
import { getGithubErrorStatus, getStatusMessage } from '../utils/githubErrors'

const route = useRoute()
const organization = ref<GithubOrganization | null>(null)
const repositories = ref<GithubRepository[]>([])
const status = ref<AppStatus>('idle')
const filters = ref<RepoFilters>({
  search: '',
  languages: [],
  minStars: 0,
  license: 'all',
  updatedWithinDays: 'all',
  archived: 'all',
  sort: 'stars',
})

const orgLogin = computed(() => {
  const value = route.params.org
  return Array.isArray(value) ? value[0] : value
})
const error = computed(() => getStatusMessage(status.value))
const languages = computed(() => getLanguageStats(repositories.value))
const languageOptions = computed(() => languages.value.map((item) => item.name))
const visibleRepositories = computed(() => filterRepositoriesAdvanced(repositories.value, filters.value))
const totalStars = computed(() => getTotalStars(repositories.value))

watch(
  () => route.fullPath,
  async () => {
    await loadOrganization()
  },
  { immediate: true },
)

async function loadOrganization() {
  status.value = 'loading'

  try {
    const [profile, repos] = await Promise.all([
      fetchGithubOrganization(orgLogin.value),
      fetchGithubOrganizationRepositories(orgLogin.value),
    ])

    organization.value = profile
    repositories.value = repos
    status.value = 'ready'
  } catch (unknownError) {
    status.value = getGithubErrorStatus(unknownError)
    organization.value = null
    repositories.value = []
  }
}
</script>

<template>
  <main class="app-shell">
    <div class="page-wrap flex flex-col gap-6">
      <header class="surface flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div v-if="organization" class="flex gap-4">
          <img class="size-20 rounded-lg border border-slate-200" :src="organization.avatar_url" :alt="organization.login" />
          <div>
            <p class="eyebrow">Organization</p>
            <h1 class="mt-2 text-4xl font-black text-slate-950">{{ organization.name ?? organization.login }}</h1>
            <p class="muted mt-2 max-w-2xl text-sm">{{ organization.description ?? 'No description.' }}</p>
            <div class="mt-4 flex flex-wrap gap-2 text-sm font-bold text-slate-600">
              <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                <Building2 class="size-4" />
                {{ formatNumber(organization.public_repos) }} repos
              </span>
              <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                <Star class="size-4 text-amber-500" />
                {{ formatNumber(totalStars) }} stars
              </span>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <StateNotice
        v-if="status !== 'ready' && status !== 'loading'"
        title="Organization loading error"
        :description="error"
        :icon="Building2"
        tone="error"
        @retry="loadOrganization"
      />

      <div v-if="status === 'loading'" class="surface p-5">
        <div class="skeleton h-10 w-64" />
        <div class="skeleton mt-4 h-4 w-full" />
        <div class="skeleton mt-2 h-4 w-2/3" />
      </div>

      <template v-if="organization">
        <LanguageChart :languages="languages" />
        <RepositoryTable
          v-model:filters="filters"
          :languages="languageOptions"
          :repositories="visibleRepositories"
          repositories-status="ready"
          :total-repositories="repositories.length"
        />
      </template>
    </div>
  </main>
</template>
