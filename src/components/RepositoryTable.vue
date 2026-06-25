<script setup lang="ts">
import { GitFork, Star } from '@lucide/vue'
import type { GithubRepository, SortMode } from '../types/github'
import { formatDateDistance, formatNumber } from '../utils/format'

defineProps<{
  repositories: GithubRepository[]
  languages: string[]
}>()

const search = defineModel<string>('search', { required: true })
const language = defineModel<string>('language', { required: true })
const sort = defineModel<SortMode>('sort', { required: true })
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white shadow-sm">
    <div class="grid gap-3 border-b border-slate-200 p-5 lg:grid-cols-[1fr_180px_160px]">
      <input
        v-model="search"
        class="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        placeholder="Search repositories"
        type="search"
      />

      <select
        v-model="language"
        class="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
        <option value="all">All languages</option>
        <option v-for="item in languages" :key="item" :value="item">{{ item }}</option>
      </select>

      <select
        v-model="sort"
        class="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
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
              <a
                class="font-semibold text-slate-950 transition hover:text-emerald-700"
                :href="repository.html_url"
                rel="noreferrer"
                target="_blank"
              >
                {{ repository.name }}
              </a>
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
        Nothing matches the current filters.
      </div>
    </div>
  </section>
</template>
