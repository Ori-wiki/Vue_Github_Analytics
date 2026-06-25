<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { AlertTriangle, Download, SearchX, Signal, WifiOff } from '@lucide/vue'
import ActivityChart from '../components/charts/ActivityChart.vue'
import CommandPalette from '../components/CommandPalette.vue'
import CommitChart from '../components/charts/CommitChart.vue'
import DashboardSkeleton from '../components/DashboardSkeleton.vue'
import GithubTokenSetup from '../components/GithubTokenSetup.vue'
import LanguageChart from '../components/charts/LanguageChart.vue'
import ProfileHeader from '../components/ProfileHeader.vue'
import RateLimitIndicator from '../components/RateLimitIndicator.vue'
import RepositoryTable from '../components/RepositoryTable.vue'
import SavedProfiles from '../components/SavedProfiles.vue'
import SearchBar from '../components/SearchBar.vue'
import StateNotice from '../components/StateNotice.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import UserComparison from '../components/UserComparison.vue'
import { useExportRepositories } from '../composables/useExportRepositories'
import { exportJsonFile } from '../utils/exportRepositories'
import { routeNames } from '../router/routes'
import { useFavoritesStore } from '../stores/favorites'
import { useGithubAnalyticsStore } from '../stores/githubAnalytics'

type Preset = 'overview' | 'activity' | 'repositories' | 'compare' | 'saved'

const presets: Array<{ id: Preset; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'repositories', label: 'Repositories' },
  { id: 'compare', label: 'Compare' },
  { id: 'saved', label: 'Saved' },
]

const route = useRoute()
const router = useRouter()
const store = useGithubAnalyticsStore()
const favoritesStore = useFavoritesStore()
const { exportCsv, exportJson } = useExportRepositories()
const activePreset = ref<Preset>('overview')
const {
  username,
  compareUsername,
  repoFilters,
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
  contributionSource,
  commitSource,
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
      activePreset.value = 'compare'
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
    void router.push({ name: routeNames.user, params: { username: targetUsername } })
  }
}

function navigateToCompare() {
  const targetUsername = username.value.trim()
  const targetCompareUsername = compareUsername.value.trim()

  if (targetUsername && targetCompareUsername) {
    favoritesStore.addComparePair(targetUsername, targetCompareUsername)
    void router.push({
      name: routeNames.compare,
      params: { username: targetUsername, compareUsername: targetCompareUsername },
    })
  }
}

function exportReport() {
  exportJsonFile(`${username.value}-github-report.json`, {
    profile: user.value,
    repositories: visibleRepositories.value,
    scores: comparisonProfile.value,
    charts: {
      contributions: contributions.value,
      commits: commits.value,
      languages: languages.value,
    },
    comparison: compareProfile.value,
  })
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
          <div class="flex flex-wrap items-center gap-2">
            <p class="w-fit rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              Live GitHub API
            </p>
            <CommandPalette :current-username="username" :repositories="repositories" />
            <ThemeToggle />
          </div>
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

      <div class="surface flex flex-wrap gap-2 p-2">
        <button
          v-for="preset in presets"
          :key="preset.id"
          class="rounded-md px-3 py-2 text-sm font-black transition"
          :class="activePreset === preset.id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50'"
          type="button"
          @click="activePreset = preset.id"
        >
          {{ preset.label }}
        </button>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <GithubTokenSetup @saved="store.loadProfile(username)" />
        <RateLimitIndicator />
      </div>

      <StateNotice
        v-if="status === 'user-not-found'"
        title="Пользователь не найден"
        :description="error"
        :icon="SearchX"
        tone="warning"
        @retry="store.loadProfile(username)"
      />

      <StateNotice
        v-else-if="status === 'rate-limit'"
        title="Превышен лимит GitHub API"
        :description="error"
        :icon="Signal"
        tone="warning"
        @retry="store.loadProfile(username)"
      />

      <StateNotice
        v-else-if="status === 'network-error'"
        title="Ошибка сети"
        :description="error"
        :icon="WifiOff"
        tone="error"
        @retry="store.loadProfile(username)"
      />

      <StateNotice
        v-else-if="status === 'error'"
        title="Ошибка загрузки"
        :description="error"
        :icon="AlertTriangle"
        tone="error"
        @retry="store.loadProfile(username)"
      />

      <StateNotice
        v-if="status === 'ready' && dataWarning"
        title="Данные загружены частично"
        :description="dataWarning"
        :icon="Signal"
        tone="warning"
        @retry="store.loadProfile(username)"
      />

      <DashboardSkeleton v-if="isLoading && !user" />

      <template v-if="user">
        <ProfileHeader
          v-if="activePreset === 'overview' || activePreset === 'saved'"
          :repositories="repositories.length"
          :stars="totalStars"
          :user="user"
        />

        <SavedProfiles v-if="activePreset === 'overview' || activePreset === 'saved'" :active-username="username" />

        <section v-if="activePreset === 'overview' || activePreset === 'activity'" class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <ActivityChart
            :contributions="contributions"
            :events-status="eventsStatus"
            :has-events="hasPublicEvents"
            :source="contributionSource"
          />
          <LanguageChart :languages="languages" />
        </section>

        <section v-if="activePreset === 'overview' || activePreset === 'compare' || activePreset === 'activity'" class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <CommitChart
            :commits="commits"
            :events-status="eventsStatus"
            :has-events="hasPublicEvents"
            :source="commitSource"
          />
          <div v-if="activePreset !== 'activity'" class="flex flex-col gap-3">
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

        <section v-if="activePreset === 'overview' || activePreset === 'repositories'" class="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="title-lg">Export repositories</h2>
            <p class="muted mt-1 text-sm">Download the currently visible repository list.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="btn-secondary" @click="exportJson(visibleRepositories, username)">
              <Download class="size-4" />
              Export as JSON
            </button>
            <button class="btn-secondary" @click="exportCsv(visibleRepositories, username)">
              <Download class="size-4" />
              Export as CSV
            </button>
            <button class="btn-secondary" @click="exportReport">
              <Download class="size-4" />
              Export report
            </button>
          </div>
        </section>

        <RepositoryTable
          v-if="activePreset === 'overview' || activePreset === 'repositories'"
          v-model:filters="repoFilters"
          :languages="languageOptions"
          :repositories="visibleRepositories"
          :repositories-status="repositoriesStatus"
          :total-repositories="repositories.length"
        />
      </template>
    </div>
  </main>
</template>
