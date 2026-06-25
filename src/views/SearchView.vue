<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Building2, Search, Star, UserRound } from '@lucide/vue'
import StateNotice from '../components/StateNotice.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { fetchGithubSearchRepositories, fetchGithubSearchUsers } from '../queries/githubQueries'
import { routeNames } from '../router/routes'
import type { AppStatus, GithubSearchRepositoryItem, GithubSearchUserItem } from '../types/github'
import { formatDateDistance, formatNumber } from '../utils/format'
import { getGithubErrorStatus, getStatusMessage } from '../utils/githubErrors'

const route = useRoute()
const router = useRouter()
const query = ref(getQuery())
const status = ref<AppStatus>('idle')
const users = ref<GithubSearchUserItem[]>([])
const repositories = ref<GithubSearchRepositoryItem[]>([])
const userTotal = ref(0)
const repoTotal = ref(0)
let requestId = 0

const error = computed(() => getStatusMessage(status.value))
const hasResults = computed(() => users.value.length > 0 || repositories.value.length > 0)

watch(
  () => route.query.q,
  async () => {
    query.value = getQuery()
    await searchGithub()
  },
  { immediate: true },
)

function getQuery() {
  const value = route.query.q
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function submitSearch() {
  const normalized = query.value.trim()

  if (normalized) {
    void router.push({ name: routeNames.search, query: { q: normalized } })
  }
}

async function searchGithub() {
  const normalized = query.value.trim()
  const currentRequestId = ++requestId

  if (!normalized) {
    status.value = 'idle'
    users.value = []
    repositories.value = []
    userTotal.value = 0
    repoTotal.value = 0
    return
  }

  status.value = 'loading'

  try {
    const [userResults, repoResults] = await Promise.all([
      fetchGithubSearchUsers(`${normalized} in:login`),
      fetchGithubSearchRepositories(`${normalized} in:name`),
    ])

    if (currentRequestId !== requestId) {
      return
    }

    users.value = userResults.items
    repositories.value = repoResults.items
    userTotal.value = userResults.total_count
    repoTotal.value = repoResults.total_count
    status.value = hasResults.value ? 'ready' : 'error'
  } catch (unknownError) {
    if (currentRequestId !== requestId) {
      return
    }

    status.value = getGithubErrorStatus(unknownError)
    users.value = []
    repositories.value = []
  }
}
</script>

<template>
  <main class="app-shell">
    <div class="page-wrap flex flex-col gap-6">
      <header class="surface p-5 sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="eyebrow">GitHub search</p>
            <h1 class="title-xl mt-3">Find users, organizations and repositories</h1>
            <p class="muted mt-3 max-w-2xl text-sm leading-6">
              Search GitHub without knowing the exact username. Results are cached by TanStack Query.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <form class="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]" @submit.prevent="submitSearch">
          <input v-model="query" class="control px-3 text-sm" placeholder="vue, react, torvalds..." type="search" />
          <button class="btn-primary" type="submit">
            <Search class="size-4" />
            Search
          </button>
        </form>
      </header>

      <div v-if="status === 'loading'" class="grid gap-6 lg:grid-cols-2">
        <div v-for="item in 2" :key="item" class="surface p-5">
          <div class="skeleton h-7 w-44" />
          <div class="skeleton mt-4 h-16 w-full" />
          <div class="skeleton mt-3 h-16 w-full" />
        </div>
      </div>

      <StateNotice
        v-else-if="status !== 'ready' && status !== 'idle'"
        :title="hasResults ? 'Search warning' : 'No search results'"
        :description="hasResults ? error : 'Try another username, organization or repository name.'"
        :icon="Search"
        tone="warning"
        @retry="searchGithub"
      />

      <section v-if="status === 'ready'" class="grid gap-6 lg:grid-cols-2">
        <div class="surface overflow-hidden">
          <div class="border-b border-slate-200 p-5">
            <h2 class="title-lg">Users and organizations</h2>
            <p class="muted mt-1 text-sm">{{ formatNumber(userTotal) }} matches</p>
          </div>
          <div class="divide-y divide-slate-100">
            <RouterLink
              v-for="item in users"
              :key="item.id"
              class="flex items-center gap-3 p-4 transition hover:bg-slate-50"
              :to="{
                name: item.type === 'Organization' ? routeNames.organization : routeNames.user,
                params: item.type === 'Organization' ? { org: item.login } : { username: item.login },
              }"
            >
              <img class="size-10 rounded-md border border-slate-200" :src="item.avatar_url" :alt="item.login" />
              <div class="min-w-0 flex-1">
                <p class="truncate font-black text-slate-950">@{{ item.login }}</p>
                <p class="muted text-xs">{{ item.type }}</p>
              </div>
              <component :is="item.type === 'Organization' ? Building2 : UserRound" class="size-4 text-slate-400" />
            </RouterLink>
          </div>
        </div>

        <div class="surface overflow-hidden">
          <div class="border-b border-slate-200 p-5">
            <h2 class="title-lg">Repositories</h2>
            <p class="muted mt-1 text-sm">{{ formatNumber(repoTotal) }} matches</p>
          </div>
          <div class="divide-y divide-slate-100">
            <RouterLink
              v-for="repository in repositories"
              :key="repository.id"
              class="block p-4 transition hover:bg-slate-50"
              :to="{
                name: routeNames.repositoryDetail,
                params: { owner: repository.owner.login, repo: repository.name },
              }"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate font-black text-slate-950">{{ repository.full_name }}</p>
                  <p class="muted mt-1 line-clamp-2 text-sm">{{ repository.description ?? 'No description.' }}</p>
                </div>
                <span class="inline-flex items-center gap-1 text-sm font-bold text-slate-600">
                  <Star class="size-4 text-amber-500" />
                  {{ formatNumber(repository.stargazers_count) }}
                </span>
              </div>
              <p class="muted mt-3 text-xs">
                {{ repository.language ?? 'Other' }} - updated {{ formatDateDistance(repository.updated_at) }}
              </p>
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
