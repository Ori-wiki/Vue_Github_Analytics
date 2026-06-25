<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  GitFork,
  Radio,
  Star,
  Tag,
} from '@lucide/vue'
import { getGithubRepository } from '../api/github'
import StateNotice from '../components/StateNotice.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import type { AppStatus, GithubRepository } from '../types/github'
import { formatDateDistance, formatNumber } from '../utils/format'
import { getGithubErrorStatus, getStatusMessage } from '../utils/githubErrors'

const route = useRoute()
const repository = ref<GithubRepository | null>(null)
const status = ref<AppStatus>('idle')

const owner = computed(() => getRouteParam('owner') ?? '')
const repo = computed(() => getRouteParam('repo') ?? '')
const error = computed(() => getStatusMessage(status.value))

watch(
  () => route.fullPath,
  async () => {
    await loadRepository()
  },
  { immediate: true },
)

async function loadRepository() {
  if (!owner.value || !repo.value) {
    status.value = 'error'
    return
  }

  status.value = 'loading'

  try {
    repository.value = await getGithubRepository(owner.value, repo.value)
    status.value = 'ready'
  } catch (unknownError) {
    repository.value = null
    status.value = getGithubErrorStatus(unknownError)
  }
}

function getRouteParam(key: string) {
  const value = route.params[key]
  return Array.isArray(value) ? value[0] : value
}
</script>

<template>
  <main class="app-shell">
    <div class="page-wrap flex max-w-5xl flex-col gap-6">
      <div class="flex items-center justify-between gap-3">
        <RouterLink
          class="btn-secondary w-fit"
          :to="{ name: 'user', params: { username: owner } }"
        >
          <ArrowLeft class="size-4" />
          Back to @{{ owner }}
        </RouterLink>
        <ThemeToggle />
      </div>

      <div v-if="status === 'loading'" class="surface grid min-h-96 place-items-center">
        <p class="text-sm font-medium text-slate-500">Loading repository...</p>
      </div>

      <StateNotice
        v-else-if="status !== 'ready'"
        title="Repository loading error"
        :description="error || 'Repository was not found or GitHub API is unavailable.'"
        :icon="AlertTriangle"
        tone="error"
      />

      <template v-if="repository">
        <section class="surface p-5 sm:p-6">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="eyebrow">{{ owner }}</p>
              <h1 class="mt-3 text-4xl font-black leading-none text-slate-950">{{ repository.name }}</h1>
              <p class="muted mt-4 max-w-3xl text-sm leading-6">
                {{ repository.description ?? 'No description.' }}
              </p>
            </div>

            <a
              class="btn-primary"
              :href="repository.html_url"
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink class="size-4" />
              GitHub
            </a>
          </div>
        </section>

        <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div class="surface p-5">
            <Star class="size-5 text-amber-500" />
            <p class="metric-label mt-3">Stars</p>
            <p class="metric-value">{{ formatNumber(repository.stargazers_count) }}</p>
          </div>
          <div class="surface p-5">
            <GitFork class="size-5 text-slate-500" />
            <p class="metric-label mt-3">Forks</p>
            <p class="metric-value">{{ formatNumber(repository.forks_count) }}</p>
          </div>
          <div class="surface p-5">
            <AlertTriangle class="size-5 text-red-500" />
            <p class="metric-label mt-3">Issues</p>
            <p class="metric-value">{{ formatNumber(repository.open_issues_count) }}</p>
          </div>
          <div class="surface p-5">
            <Radio class="size-5 text-blue-600" />
            <p class="metric-label mt-3">Watchers</p>
            <p class="metric-value">{{ formatNumber(repository.watchers_count ?? 0) }}</p>
          </div>
        </section>

        <section class="surface grid gap-6 p-5 lg:grid-cols-2">
          <dl class="space-y-4 text-sm">
            <div class="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <dt class="font-medium text-slate-500">Language</dt>
              <dd class="font-semibold text-slate-950">{{ repository.language ?? 'Other' }}</dd>
            </div>
            <div class="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <dt class="font-medium text-slate-500">Created date</dt>
              <dd class="font-semibold text-slate-950">{{ formatDateDistance(repository.created_at) }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="font-medium text-slate-500">Updated date</dt>
              <dd class="font-semibold text-slate-950">{{ formatDateDistance(repository.updated_at) }}</dd>
            </div>
          </dl>

          <div>
            <div class="mb-3 flex items-center gap-2">
              <Tag class="size-4 text-emerald-600" />
              <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500">Topics</h2>
            </div>
            <div v-if="repository.topics?.length" class="flex flex-wrap gap-2">
              <span
                v-for="topic in repository.topics"
                :key="topic"
                class="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
              >
                {{ topic }}
              </span>
            </div>
            <p v-else class="text-sm text-slate-500">No topics.</p>
          </div>
        </section>
      </template>
    </div>
  </main>
</template>
