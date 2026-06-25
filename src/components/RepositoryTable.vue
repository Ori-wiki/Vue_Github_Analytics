<script setup lang="ts">
import { GitFork, Star } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import type { AppStatus, GithubRepository, SortMode } from '../types/github'
import { formatDateDistance, formatNumber } from '../utils/format'

defineProps<{
  repositories: GithubRepository[]
  languages: string[]
  totalRepositories: number
  repositoriesStatus: AppStatus
}>()

const search = defineModel<string>('search', { required: true })
const language = defineModel<string>('language', { required: true })
const sort = defineModel<SortMode>('sort', { required: true })

function getRepositoryRoute(repository: GithubRepository) {
  const [owner, repo] = repository.full_name.split('/')

  return {
    name: 'repository-detail',
    params: {
      owner,
      repo,
    },
  }
}
</script>

<template>
  <section class="surface overflow-hidden">
    <div class="grid gap-3 border-b border-slate-200 bg-white p-5 lg:grid-cols-[1fr_180px_160px]">
      <input
        v-model="search"
        class="control px-3 text-sm"
        placeholder="Search repositories"
        type="search"
      />

      <select v-model="language" class="control px-3 text-sm">
        <option value="all">All languages</option>
        <option v-for="item in languages" :key="item" :value="item">{{ item }}</option>
      </select>

      <select v-model="sort" class="control px-3 text-sm">
        <option value="stars">Stars first</option>
        <option value="updated">Recently pushed</option>
        <option value="name">Name</option>
      </select>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-5 py-3 font-semibold">Repository</th>
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
              {{ formatDateDistance(repository.pushed_at) }}
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
