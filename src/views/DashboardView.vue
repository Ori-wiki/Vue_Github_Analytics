<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
import ProfileSummary from '../components/ProfileSummary.vue'
import RateLimitIndicator from '../components/RateLimitIndicator.vue'
import RepositoryHealthDashboard from '../components/RepositoryHealthDashboard.vue'
import RepositoryTable from '../components/RepositoryTable.vue'
import SavedProfiles from '../components/SavedProfiles.vue'
import SearchBar from '../components/SearchBar.vue'
import SecurityLicenseInsights from '../components/SecurityLicenseInsights.vue'
import ShareCard from '../components/ShareCard.vue'
import StateNotice from '../components/StateNotice.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import UserComparison from '../components/UserComparison.vue'
import { useExportRepositories } from '../composables/useExportRepositories'
import { exportHtmlFile, exportJsonFile } from '../utils/exportRepositories'
import { routeNames } from '../router/routes'
import { useFavoritesStore } from '../stores/favorites'
import { useGithubAnalyticsStore } from '../stores/githubAnalytics'
import { useToastsStore } from '../stores/toasts'

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
const toastsStore = useToastsStore()
const { exportCsv, exportJson } = useExportRepositories()
const activePreset = ref<Preset>('overview')
const isApplyingRouteState = ref(false)
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

const routeTab = computed(() => {
  const value = route.query.tab
  return Array.isArray(value) ? value[0] : value
})

watch(
  () => [getRouteParam('username'), getRouteParam('compareUsername')],
  async () => {
    const routeUsername = getRouteParam('username') ?? 'vuejs'
    const routeCompareUsername = getRouteParam('compareUsername')

    username.value = routeUsername
    activePreset.value = toPreset(routeTab.value) ?? (routeCompareUsername ? 'compare' : activePreset.value)
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

watch(
  () => route.query,
  () => {
    isApplyingRouteState.value = true
    activePreset.value = toPreset(routeTab.value) ?? activePreset.value
    applyFiltersFromQuery()
    queueMicrotask(() => {
      isApplyingRouteState.value = false
    })
  },
  { immediate: true },
)

watch(activePreset, (tab) => {
  if (isApplyingRouteState.value) {
    return
  }

  if (routeTab.value === tab) {
    return
  }

  void router.replace({ query: { ...route.query, tab } })
})

watch(
  repoFilters,
  (filters) => {
    if (isApplyingRouteState.value) {
      return
    }

    const nextQuery = {
      ...route.query,
      search: filters.search || undefined,
      lang: filters.languages.length ? filters.languages.join(',') : undefined,
      minStars: filters.minStars ? String(filters.minStars) : undefined,
      license: filters.license !== 'all' ? filters.license : undefined,
      updated: filters.updatedWithinDays !== 'all' ? String(filters.updatedWithinDays) : undefined,
      archived: filters.archived !== 'all' ? filters.archived : undefined,
      sort: filters.sort !== 'stars' ? filters.sort : undefined,
    }

    void router.replace({ query: nextQuery })
  },
  { deep: true },
)

function getRouteParam(key: string) {
  const value = route.params[key]
  return Array.isArray(value) ? value[0] : value
}

function toPreset(value: string | null | undefined): Preset | null {
  return presets.some((preset) => preset.id === value) ? (value as Preset) : null
}

function getStringQuery(key: string) {
  const value = route.query[key]
  return Array.isArray(value) ? value[0] : value
}

function applyFiltersFromQuery() {
  const minStars = Number(getStringQuery('minStars') ?? 0)
  const updated = getStringQuery('updated')
  const license = getStringQuery('license')
  const archived = getStringQuery('archived')
  const sort = getStringQuery('sort')

  repoFilters.value = {
    search: getStringQuery('search') ?? '',
    languages: (getStringQuery('lang') ?? '').split(',').filter(Boolean),
    minStars: Number.isFinite(minStars) ? minStars : 0,
    license: license === 'with' || license === 'without' ? license : 'all',
    updatedWithinDays: updated && Number.isFinite(Number(updated)) ? Number(updated) : 'all',
    archived: archived === 'active' || archived === 'archived' ? archived : 'all',
    sort: sort === 'updated' || sort === 'name' ? sort : 'stars',
  }
}

function navigateToUser() {
  const targetUsername = username.value.trim()

  if (targetUsername) {
    void router.push({ name: routeNames.user, params: { username: targetUsername }, query: route.query })
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
      query: { ...route.query, tab: 'compare' },
    })
  }
}

function exportReport() {
  const report = {
    profile: user.value,
    repositories: visibleRepositories.value,
    scores: comparisonProfile.value,
    charts: {
      contributions: contributions.value,
      commits: commits.value,
      languages: languages.value,
    },
    comparison: compareProfile.value,
  }

  exportJsonFile(`${username.value}-github-report.json`, report)
  exportHtmlFile(`${username.value}-github-report.html`, createReportHtml())
  toastsStore.push('Report export ready', `JSON and print-friendly HTML for @${username.value} exported.`, 'success')
}

function createReportHtml() {
  const topLanguages = languages.value.map((item) => `${item.name}: ${item.repositories}`).join(', ') || 'No data'
  const rows = visibleRepositories.value
    .map(
      (repository) => `
        <tr>
          <td>${escapeHtml(repository.full_name)}</td>
          <td>${escapeHtml(repository.language ?? 'Other')}</td>
          <td>${repository.stargazers_count}</td>
          <td>${repository.forks_count}</td>
          <td>${repository.open_issues_count}</td>
        </tr>
      `,
    )
    .join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>@${escapeHtml(username.value)} GitHub report</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #0f172a; margin: 40px; }
    h1 { font-size: 32px; margin: 0 0 8px; }
    p { color: #475569; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
    .metric { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .metric strong { display: block; font-size: 24px; color: #020617; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: left; }
    th { background: #f8fafc; color: #475569; text-transform: uppercase; font-size: 11px; }
    @media print { body { margin: 20px; } button { display: none; } }
  </style>
</head>
<body>
  <button onclick="window.print()">Print / save as PDF</button>
  <h1>@${escapeHtml(username.value)} GitHub Analytics Report</h1>
  <p>${escapeHtml(user.value?.bio ?? 'No bio.')}</p>
  <div class="metrics">
    <div class="metric"><span>Followers</span><strong>${user.value?.followers ?? 0}</strong></div>
    <div class="metric"><span>Repos</span><strong>${repositories.value.length}</strong></div>
    <div class="metric"><span>Stars</span><strong>${totalStars.value}</strong></div>
    <div class="metric"><span>Top language</span><strong>${escapeHtml(languages.value[0]?.name ?? 'No data')}</strong></div>
  </div>
  <p><strong>Languages:</strong> ${escapeHtml(topLanguages)}</p>
  <table>
    <thead><tr><th>Repository</th><th>Language</th><th>Stars</th><th>Forks</th><th>Issues</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
</script>

<template>
  <main class="app-shell pb-20 sm:pb-0">
    <div class="page-wrap flex flex-col gap-6">
      <header class="surface p-5 sm:p-6">
        <div
          class="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <div class="grid size-10 place-items-center rounded-md bg-slate-950 text-sm font-black text-white">GH</div>
            <div>
              <p class="text-sm font-extrabold text-slate-950">GitHub Analytics</p>
              <p class="text-xs font-semibold text-slate-500">SaaS-style developer intelligence</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <p
              class="w-fit rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"
            >
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

      <div class="surface hidden flex-wrap gap-2 p-2 sm:flex">
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

        <div v-if="activePreset === 'overview'" class="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-start">
          <ProfileSummary :languages="languages" :repositories="repositories" :stars="totalStars" :user="user" />
          <ShareCard :languages="languages" :repositories="repositories.length" :stars="totalStars" :user="user" />
        </div>

        <SavedProfiles v-if="activePreset === 'overview' || activePreset === 'saved'" :active-username="username" />

        <section v-if="activePreset === 'overview' || activePreset === 'repositories'" class="grid gap-6 xl:grid-cols-2">
          <RepositoryHealthDashboard :repositories="repositories" />
          <SecurityLicenseInsights :repositories="repositories" />
        </section>

        <section v-if="activePreset === 'overview' || activePreset === 'activity'" class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <ActivityChart
            :contributions="contributions"
            :events-status="eventsStatus"
            :has-events="hasPublicEvents"
            :source="contributionSource"
          />
          <LanguageChart :languages="languages" />
        </section>

        <section
          v-if="activePreset === 'overview' || activePreset === 'compare' || activePreset === 'activity'"
          class="grid gap-6 xl:grid-cols-[1fr_1fr]"
        >
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

        <section
          v-if="activePreset === 'overview' || activePreset === 'repositories'"
          class="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
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

    <nav
      class="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-xl shadow-slate-950/10 sm:hidden"
      aria-label="Dashboard sections"
    >
      <button
        v-for="preset in presets"
        :key="preset.id"
        class="rounded-md px-1 py-2 text-[11px] font-black transition"
        :class="activePreset === preset.id ? 'bg-slate-950 text-white' : 'text-slate-600'"
        type="button"
        @click="activePreset = preset.id"
      >
        {{ preset.label }}
      </button>
    </nav>
  </main>
</template>
