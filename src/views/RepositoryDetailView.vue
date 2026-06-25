<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  AlertTriangle,
  ArrowLeft,
  Code2,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitFork,
  Radio,
  Star,
  Tag,
  Users,
} from '@lucide/vue'
import StateNotice from '../components/StateNotice.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useRepositoryDetail } from '../composables/useRepositoryDetail'
import { routeNames } from '../router/routes'
import { formatDateDistance, formatNumber } from '../utils/format'

const route = useRoute()
const {
  repository,
  readme,
  readmePreview,
  releases,
  contributors,
  issuesByLabel,
  latestCommit,
  status,
  error,
  dataWarning,
  loadRepository,
} = useRepositoryDetail()

const owner = computed(() => getRouteParam('owner') ?? '')
const repo = computed(() => getRouteParam('repo') ?? '')

watch(
  () => route.fullPath,
  async () => {
    await loadRepository(owner.value, repo.value)
  },
  { immediate: true },
)

function getRouteParam(key: string) {
  const value = route.params[key]
  return Array.isArray(value) ? value[0] : value
}
</script>

<template>
  <main class="app-shell">
    <div class="page-wrap flex max-w-5xl flex-col gap-6">
      <div class="flex items-center justify-between gap-3">
        <RouterLink class="btn-secondary w-fit" :to="{ name: routeNames.user, params: { username: owner } }">
          <ArrowLeft class="size-4" />
          Back to @{{ owner }}
        </RouterLink>
        <ThemeToggle />
      </div>

      <div v-if="status === 'loading'" class="surface p-5">
        <div class="skeleton h-8 w-64" />
        <div class="skeleton mt-4 h-4 w-full" />
        <div class="skeleton mt-2 h-4 w-4/5" />
        <div class="mt-6 grid gap-3 sm:grid-cols-4">
          <div v-for="item in 4" :key="item" class="skeleton h-28" />
        </div>
      </div>

      <StateNotice
        v-else-if="status !== 'ready'"
        title="Repository loading error"
        :description="error || 'Repository was not found or GitHub API is unavailable.'"
        :icon="AlertTriangle"
        tone="error"
      />

      <StateNotice
        v-if="status === 'ready' && dataWarning"
        title="Repository data loaded partially"
        :description="dataWarning"
        :icon="AlertTriangle"
        tone="warning"
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

            <a class="btn-primary" :href="repository.html_url" rel="noreferrer" target="_blank">
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
              <dt class="font-medium text-slate-500">Default branch</dt>
              <dd class="inline-flex items-center gap-1 font-semibold text-slate-950">
                <GitBranch class="size-4" />
                {{ repository.default_branch ?? 'unknown' }}
              </dd>
            </div>
            <div class="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <dt class="font-medium text-slate-500">License</dt>
              <dd class="font-semibold text-slate-950">{{ repository.license?.spdx_id ?? 'No license' }}</dd>
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

        <section class="grid gap-6 lg:grid-cols-2">
          <section class="surface p-5">
            <div class="mb-4 flex items-center gap-2">
              <Code2 class="size-5 text-emerald-600" />
              <h2 class="title-lg">README preview</h2>
            </div>
            <pre v-if="readmePreview" class="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">{{ readmePreview }}</pre>
            <p v-else class="text-sm text-slate-500">README is unavailable.</p>
            <a v-if="readme?.html_url" class="btn-secondary mt-4" :href="readme.html_url" target="_blank" rel="noreferrer">
              Open README
            </a>
          </section>

          <section class="surface p-5">
            <h2 class="title-lg">Latest release</h2>
            <div v-if="releases.length" class="mt-4 space-y-3">
              <a
                v-for="release in releases"
                :key="release.id"
                class="block rounded-md border border-slate-200 p-3 transition hover:border-emerald-300"
                :href="release.html_url"
                rel="noreferrer"
                target="_blank"
              >
                <p class="font-bold text-slate-950">{{ release.name ?? release.tag_name }}</p>
                <p class="muted mt-1 text-xs">{{ release.published_at ? formatDateDistance(release.published_at) : 'Draft or unpublished' }}</p>
              </a>
            </div>
            <p v-else class="mt-4 text-sm text-slate-500">No public releases.</p>
          </section>
        </section>

        <section class="grid gap-6 lg:grid-cols-3">
          <section class="surface p-5">
            <div class="mb-4 flex items-center gap-2">
              <Users class="size-5 text-emerald-600" />
              <h2 class="title-lg">Contributors</h2>
            </div>
            <div v-if="contributors.length" class="space-y-3">
              <a
                v-for="contributor in contributors"
                :key="contributor.id"
                class="flex items-center gap-3 rounded-md border border-slate-200 p-2 transition hover:border-emerald-300"
                :href="contributor.html_url"
                rel="noreferrer"
                target="_blank"
              >
                <img class="size-8 rounded-md" :src="contributor.avatar_url" :alt="contributor.login" />
                <div>
                  <p class="text-sm font-bold text-slate-950">@{{ contributor.login }}</p>
                  <p class="text-xs text-slate-500">{{ contributor.contributions }} commits</p>
                </div>
              </a>
            </div>
            <p v-else class="text-sm text-slate-500">No contributor data.</p>
          </section>

          <section class="surface p-5">
            <h2 class="title-lg">Open issues by labels</h2>
            <div v-if="issuesByLabel.length" class="mt-4 space-y-2">
              <div v-for="item in issuesByLabel" :key="item.label" class="flex justify-between gap-3 text-sm">
                <span class="font-semibold text-slate-700">{{ item.label }}</span>
                <span class="font-mono font-black text-slate-950">{{ item.count }}</span>
              </div>
            </div>
            <p v-else class="mt-4 text-sm text-slate-500">No open issue label data.</p>
          </section>

          <section class="surface p-5">
            <div class="mb-4 flex items-center gap-2">
              <GitCommit class="size-5 text-emerald-600" />
              <h2 class="title-lg">Last commit</h2>
            </div>
            <a
              v-if="latestCommit"
              class="block rounded-md border border-slate-200 p-3 transition hover:border-emerald-300"
              :href="latestCommit.html_url"
              rel="noreferrer"
              target="_blank"
            >
              <p class="line-clamp-3 text-sm font-bold text-slate-950">{{ latestCommit.commit.message }}</p>
              <p class="muted mt-2 text-xs">
                {{ latestCommit.commit.author.name }} · {{ formatDateDistance(latestCommit.commit.author.date) }}
              </p>
            </a>
            <p v-else class="text-sm text-slate-500">No commit data.</p>
          </section>
        </section>
      </template>
    </div>
  </main>
</template>
