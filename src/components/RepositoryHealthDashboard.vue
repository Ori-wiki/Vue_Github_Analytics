<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, HeartPulse } from '@lucide/vue'
import type { GithubRepository } from '../types/github'
import { getRepositoryHealth } from '../utils/analytics'
import { formatDateDistance } from '../utils/format'

const props = defineProps<{
  repositories: GithubRepository[]
}>()

const groups = computed(() => {
  const result = {
    healthy: 0,
    stale: 0,
    attention: 0,
  }

  for (const repository of props.repositories) {
    const health = getRepositoryHealth(repository)

    if (health.status === 'Healthy') result.healthy += 1
    if (health.status === 'Stale') result.stale += 1
    if (health.status === 'Needs attention') result.attention += 1
  }

  return result
})

const staleRepos = computed(() =>
  props.repositories
    .filter((repository) => (Date.now() - new Date(repository.pushed_at).getTime()) / (1000 * 60 * 60 * 24) > 365)
    .slice(0, 5),
)

const problematicRepos = computed(() =>
  [...props.repositories]
    .sort((a, b) => getRepositoryHealth(a).score - getRepositoryHealth(b).score)
    .slice(0, 5),
)
</script>

<template>
  <section class="surface p-5">
    <div class="mb-4 flex items-center gap-2">
      <HeartPulse class="size-5 text-emerald-600" />
      <h2 class="title-lg">Repository health dashboard</h2>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="stat-tile">
        <p class="metric-label">Healthy</p>
        <p class="metric-value">{{ groups.healthy }}</p>
      </div>
      <div class="stat-tile">
        <p class="metric-label">Stale</p>
        <p class="metric-value">{{ groups.stale }}</p>
      </div>
      <div class="stat-tile">
        <p class="metric-label">Needs attention</p>
        <p class="metric-value">{{ groups.attention }}</p>
      </div>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-2">
      <div>
        <h3 class="text-sm font-black text-slate-950">Most problematic</h3>
        <div class="mt-3 space-y-2">
          <div v-for="repository in problematicRepos" :key="repository.id" class="flex justify-between gap-3 text-sm">
            <span class="font-semibold text-slate-700">{{ repository.name }}</span>
            <span class="font-mono font-black text-slate-950">{{ getRepositoryHealth(repository).score }}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 class="flex items-center gap-1 text-sm font-black text-slate-950">
          <AlertTriangle class="size-4 text-amber-500" />
          Stale over 1 year
        </h3>
        <div class="mt-3 space-y-2">
          <div v-for="repository in staleRepos" :key="repository.id" class="flex justify-between gap-3 text-sm">
            <span class="font-semibold text-slate-700">{{ repository.name }}</span>
            <span class="text-slate-500">{{ formatDateDistance(repository.pushed_at) }}</span>
          </div>
          <p v-if="!staleRepos.length" class="text-sm text-slate-500">No stale repositories.</p>
        </div>
      </div>
    </div>
  </section>
</template>
