<script setup lang="ts">
import { computed } from 'vue'
import { ShieldCheck } from '@lucide/vue'
import type { GithubRepository } from '../types/github'

const props = defineProps<{
  repositories: GithubRepository[]
}>()

const withoutLicense = computed(() => props.repositories.filter((repository) => !repository.license))
const archived = computed(() => props.repositories.filter((repository) => repository.archived))
const licenseGroups = computed(() => {
  const map = new Map<string, number>()

  for (const repository of props.repositories) {
    const license = repository.license?.spdx_id ?? 'NOASSERTION'
    map.set(license, (map.get(license) ?? 0) + 1)
  }

  return Array.from(map, ([license, count]) => ({ license, count })).sort((a, b) => b.count - a.count)
})
</script>

<template>
  <section class="surface p-5">
    <div class="mb-4 flex items-center gap-2">
      <ShieldCheck class="size-5 text-emerald-600" />
      <h2 class="title-lg">Security & license insights</h2>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="stat-tile">
        <p class="metric-label">No license</p>
        <p class="metric-value">{{ withoutLicense.length }}</p>
      </div>
      <div class="stat-tile">
        <p class="metric-label">Archived</p>
        <p class="metric-value">{{ archived.length }}</p>
      </div>
      <div class="stat-tile">
        <p class="metric-label">SPDX groups</p>
        <p class="metric-value">{{ licenseGroups.length }}</p>
      </div>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-2">
      <div>
        <h3 class="text-sm font-black text-slate-950">License grouping</h3>
        <div class="mt-3 space-y-2">
          <div v-for="group in licenseGroups.slice(0, 8)" :key="group.license" class="flex justify-between text-sm">
            <span class="font-semibold text-slate-700">{{ group.license }}</span>
            <span class="font-mono font-black text-slate-950">{{ group.count }}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-black text-slate-950">Needs license</h3>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="repository in withoutLicense.slice(0, 10)"
            :key="repository.id"
            class="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800"
          >
            {{ repository.name }}
          </span>
          <p v-if="!withoutLicense.length" class="text-sm text-slate-500">All visible repositories have licenses.</p>
        </div>
      </div>
    </div>
  </section>
</template>
