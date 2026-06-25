<script setup lang="ts">
import { Activity, GitFork, HeartPulse, Star } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { routeNames } from '../router/routes'
import type { AppStatus, GithubRepository, RepoFilters } from '../types/github'
import { formatDateDistance, formatNumber } from '../utils/format'
import { getRepositoryHealth } from '../utils/analytics'

defineProps<{
  repositories: GithubRepository[]
  languages: string[]
  totalRepositories: number
  repositoriesStatus: AppStatus
}>()

const filters = defineModel<RepoFilters>('filters', { required: true })

const updatedOptions = [
  { label: 'Any time', value: 'all' },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '1 year', value: 365 },
] as const

const selectedLanguages = computed({
  get: () => filters.value.languages,
  set: (value: string[]) => {
    filters.value.languages = value
  },
})

function getRepositoryRoute(repository: GithubRepository) {
  const [owner, repo] = repository.full_name.split('/')

  return {
    name: routeNames.repositoryDetail,
    params: {
      owner,
      repo,
    },
  }
}

function toggleLanguage(language: string) {
  selectedLanguages.value = selectedLanguages.value.includes(language)
    ? selectedLanguages.value.filter((item) => item !== language)
    : [...selectedLanguages.value, language]
}
</script>

<template>
  <section class="surface overflow-hidden">
    <div class="space-y-4 border-b border-slate-200 bg-white p-5">
      <div class="grid gap-3 lg:grid-cols-[1fr_140px_160px_160px_160px]">
        <input
          v-model="filters.search"
          class="control px-3 text-sm"
          placeholder="Search repositories"
          type="search"
        />

        <input
          v-model.number="filters.minStars"
          class="control px-3 text-sm"
          min="0"
          placeholder="Min stars"
          type="number"
        />

        <select v-model="filters.license" class="control px-3 text-sm">
          <option value="all">Any license</option>
          <option value="with">Has license</option>
          <option value="without">No license</option>
        </select>

        <select v-model="filters.updatedWithinDays" class="control px-3 text-sm">
          <option v-for="option in updatedOptions" :key="option.label" :value="option.value">
            Updated: {{ option.label }}
          </option>
        </select>

        <select v-model="filters.archived" class="control px-3 text-sm">
          <option value="all">All states</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in languages"
            :key="item"
            class="rounded-md border px-2 py-1 text-xs font-bold transition"
            :class="selectedLanguages.includes(item) ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600'"
            type="button"
            @click="toggleLanguage(item)"
          >
            {{ item }}
          </button>
        </div>

        <select v-model="filters.sort" class="control px-3 text-sm lg:w-44">
          <option value="stars">Stars first</option>
          <option value="updated">Recently pushed</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-5 py-3 font-semibold">Repository</th>
            <th class="px-5 py-3 font-semibold">Health</th>
            <th class="px-5 py-3 font-semibold">Language</th>
            <th class="px-5 py-3 font-semibold">Stars</th>
            <th class="px-5 py-3 font-semibold">Forks</th>
            <th class="px-5 py-3 font-semibold">Pushed</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="repository in repositories" :key="repository.id" class="align-top transition hover:bg-slate-50">
            <td class="max-w-md px-5 py-4">
              <RouterLink
                class="font-extrabold text-slate-950 transition hover:text-emerald-700"
                :to="getRepositoryRoute(repository)"
              >
                {{ repository.name }}
              </RouterLink>
              <p class="mt-1 line-clamp-2 text-slate-500">
                {{ repository.description ?? 'No description.' }}
              </p>
            </td>
            <td class="px-5 py-4">
              <span
                class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-black"
                :class="{
                  'bg-emerald-50 text-emerald-700': getRepositoryHealth(repository).status === 'Healthy',
                  'bg-amber-50 text-amber-800': getRepositoryHealth(repository).status === 'Stale',
                  'bg-red-50 text-red-700': getRepositoryHealth(repository).status === 'Needs attention',
                }"
                :title="getRepositoryHealth(repository).reasons.join(', ')"
              >
                <HeartPulse class="size-3" />
                {{ getRepositoryHealth(repository).status }}
                {{ getRepositoryHealth(repository).score }}
              </span>
            </td>
            <td class="px-5 py-4 text-slate-600">{{ repository.language ?? 'Other' }}</td>
            <td class="px-5 py-4 text-slate-600">
              <span class="inline-flex items-center gap-1">
                <Star class="size-4 text-amber-500" />
                {{ formatNumber(repository.stargazers_count) }}
              </span>
            </td>
            <td class="px-5 py-4 text-slate-600">
              <span class="inline-flex items-center gap-1">
                <GitFork class="size-4 text-slate-400" />
                {{ formatNumber(repository.forks_count) }}
              </span>
            </td>
            <td class="whitespace-nowrap px-5 py-4 text-slate-600">
              <span class="inline-flex items-center gap-1">
                <Activity class="size-4 text-slate-400" />
                {{ formatDateDistance(repository.pushed_at) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="repositories.length === 0" class="p-8 text-center text-sm text-slate-500">
        <template v-if="repositoriesStatus === 'rate-limit'">
          Репозитории временно недоступны из-за лимита GitHub API.
        </template>
        <template v-else-if="repositoriesStatus === 'network-error'">
          Не удалось загрузить репозитории из-за ошибки сети.
        </template>
        <template v-else-if="repositoriesStatus === 'error'">
          Не удалось загрузить репозитории.
        </template>
        <template v-else-if="totalRepositories === 0">
          У пользователя нет репозиториев.
        </template>
        <template v-else>
          Nothing matches the current filters.
        </template>
      </div>
    </div>
  </section>
</template>
