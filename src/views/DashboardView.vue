<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { AlertTriangle, Download, SearchX, Signal, WifiOff } from '@lucide/vue'
import ActivityChart from '../components/charts/ActivityChart.vue'
import CommitChart from '../components/charts/CommitChart.vue'
import LanguageChart from '../components/charts/LanguageChart.vue'
import ProfileHeader from '../components/ProfileHeader.vue'
import RepositoryTable from '../components/RepositoryTable.vue'
import SearchBar from '../components/SearchBar.vue'
import StateNotice from '../components/StateNotice.vue'
import UserComparison from '../components/UserComparison.vue'
import { useGithubAnalyticsStore } from '../stores/githubAnalytics'
import { exportRepositoriesAsCsv, exportRepositoriesAsJson } from '../utils/exportRepositories'

const route = useRoute()
const router = useRouter()
const store = useGithubAnalyticsStore()
const {
  username,
  compareUsername,
  search,
  language,
  sort,
  user,
  repositories,
  status,
  repositoriesStatus,
  eventsStatus,
  isLoading,
  error,
  dataWarning,
  compareError,
  hasPublicEvents,
  totalStars,
  languages,
  languageOptions,
  contributions,
  commits,
  visibleRepositories,
  comparisonProfile,
  compareProfile,
} = storeToRefs(store)

watch(
  () => route.fullPath,
  async () => {
    const routeUsername = getRouteParam('username') ?? 'vuejs'
    const routeCompareUsername = getRouteParam('compareUsername')

    username.value = routeUsername
    await store.loadProfile(routeUsername)

    if (routeCompareUsername) {
      compareUsername.value = routeCompareUsername
      await store.loadComparison()
    } else {
      store.clearComparison()
    }
  },
  { immediate: true },
)

function getRouteParam(key: string) {
  const value = route.params[key]
  return Array.isArray(value) ? value[0] : value
}

function navigateToUser() {
  const targetUsername = username.value.trim()

  if (targetUsername) {
    void router.push({ name: 'user', params: { username: targetUsername } })
  }
}

function navigateToCompare() {
  const targetUsername = username.value.trim()
  const targetCompareUsername = compareUsername.value.trim()

  if (targetUsername && targetCompareUsername) {
    void router.push({
      name: 'compare',
      params: { username: targetUsername, compareUsername: targetCompareUsername },
    })
  }
}
</script>

<template>
  <main class="app-shell">
    <div class="page-wrap flex flex-col gap-6">
      <header class="surface p-5 sm:p-6">
        <div class="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <div class="grid size-10 place-items-center rounded-md bg-slate-950 text-sm font-black text-white">GH</div>
            <div>
              <p class="text-sm font-extrabold text-slate-950">GitHub Analytics</p>
              <p class="text-xs font-semibold text-slate-500">SaaS-style developer intelligence</p>
            </div>
          </div>
          <p class="w-fit rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Live GitHub API
          </p>
        </div>

        <div class="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <p class="eyebrow">Developer intelligence</p>
            <h1 class="title-xl mt-3">Analyze GitHub profiles without the noise</h1>
            <p class="muted mt-4 max-w-2xl text-sm leading-6">
              Repositories, stars, followers, languages, contribution estimates, commits, filters, search and comparison.
            </p>
          </div>

          <SearchBar v-model="username" :is-loading="isLoading" @submit="navigateToUser" />
        </div>
      </header>

      <StateNotice
        v-if="status === 'user-not-found'"
        title="Пользователь не найден"
        :description="error"
        :icon="SearchX"
        tone="warning"
      />

      <StateNotice
        v-else-if="status === 'rate-limit'"
        title="Превышен лимит GitHub API"
        :description="error"
        :icon="Signal"
        tone="warning"
      />

      <StateNotice
        v-else-if="status === 'network-error'"
        title="Ошибка сети"
        :description="error"
        :icon="WifiOff"
        tone="error"
      />

      <StateNotice
        v-else-if="status === 'error'"
        title="Ошибка загрузки"
        :description="error"
        :icon="AlertTriangle"
        tone="error"
      />

      <StateNotice
        v-if="status === 'ready' && dataWarning"
        title="Данные загружены частично"
        :description="dataWarning"
        :icon="Signal"
        tone="warning"
      />

      <div v-if="isLoading && !user" class="surface grid min-h-96 place-items-center">
        <p class="text-sm font-medium text-slate-500">Loading GitHub profile...</p>
      </div>

      <template v-if="user">
        <ProfileHeader :repositories="repositories.length" :stars="totalStars" :user="user" />

        <section class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <ActivityChart :contributions="contributions" :events-status="eventsStatus" :has-events="hasPublicEvents" />
          <LanguageChart :languages="languages" />
        </section>

        <section class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <CommitChart :commits="commits" :events-status="eventsStatus" :has-events="hasPublicEvents" />
          <div class="flex flex-col gap-3">
            <UserComparison
              v-model="compareUsername"
              :base-profile="comparisonProfile"
              :compare-profile="compareProfile"
              @compare="navigateToCompare"
            />
            <p v-if="compareError" class="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {{ compareError }}
            </p>
          </div>
        </section>

        <section class="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="title-lg">Export repositories</h2>
            <p class="muted mt-1 text-sm">Download the currently visible repository list.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="btn-secondary" @click="exportRepositoriesAsJson(visibleRepositories, username)">
              <Download class="size-4" />
              Export as JSON
            </button>
            <button class="btn-secondary" @click="exportRepositoriesAsCsv(visibleRepositories, username)">
              <Download class="size-4" />
              Export as CSV
            </button>
          </div>
        </section>

        <RepositoryTable
          v-model:language="language"
          v-model:search="search"
          v-model:sort="sort"
          :languages="languageOptions"
          :repositories="visibleRepositories"
          :repositories-status="repositoriesStatus"
          :total-repositories="repositories.length"
        />
      </template>
    </div>
  </main>
</template>
