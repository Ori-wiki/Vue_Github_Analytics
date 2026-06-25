<script setup lang="ts">
import { computed } from 'vue'
import { GitCompareArrows } from '@lucide/vue'
import type { ComparisonProfile } from '../types/github'
import { formatNumber } from '../utils/format'

const props = defineProps<{
  baseProfile: ComparisonProfile | null
  compareProfile: ComparisonProfile | null
}>()

const model = defineModel<string>({ required: true })

defineEmits<{
  compare: []
}>()

const rows = computed(() => {
  if (!props.baseProfile || !props.compareProfile) {
    return []
  }

  return [
    createNumericRow('Total stars', props.baseProfile.totalStars, props.compareProfile.totalStars),
    createNumericRow('Followers', props.baseProfile.followers, props.compareProfile.followers),
    createNumericRow('Repos', props.baseProfile.repos, props.compareProfile.repos),
    createTextRow(
      'Top language',
      props.baseProfile.topLanguage,
      props.compareProfile.topLanguage,
      props.baseProfile.topLanguageRepos,
      props.compareProfile.topLanguageRepos,
    ),
    createNumericRow('Average stars per repo', props.baseProfile.averageStars, props.compareProfile.averageStars, true),
    createTextRow(
      'Most active day',
      props.baseProfile.mostActiveDay,
      props.compareProfile.mostActiveDay,
      props.baseProfile.mostActiveDayScore,
      props.compareProfile.mostActiveDayScore,
    ),
    createNumericRow('Popularity score', props.baseProfile.popularityScore, props.compareProfile.popularityScore),
    createNumericRow('Activity score', props.baseProfile.activityScore, props.compareProfile.activityScore),
    createNumericRow('Maintenance score', props.baseProfile.maintenanceScore, props.compareProfile.maintenanceScore),
    createNumericRow('Total score', props.baseProfile.totalScore, props.compareProfile.totalScore),
  ]
})

const winnerSummary = computed(() => {
  if (!props.baseProfile || !props.compareProfile) {
    return ''
  }

  if (props.baseProfile.totalScore === props.compareProfile.totalScore) {
    return 'Both profiles are evenly matched.'
  }

  const winner =
    props.baseProfile.totalScore > props.compareProfile.totalScore
      ? props.baseProfile.username
      : props.compareProfile.username

  return `@${winner} wins overall by the combined product score.`
})

function createNumericRow(label: string, left: number, right: number, decimal = false) {
  return {
    label,
    left: decimal ? left.toFixed(1) : formatNumber(left),
    right: decimal ? right.toFixed(1) : formatNumber(right),
    winner: getWinner(left, right),
  }
}

function createTextRow(label: string, left: string, right: string, leftScore: number, rightScore: number) {
  return {
    label,
    left,
    right,
    winner: getWinner(leftScore, rightScore),
  }
}

function getWinner(left: number, right: number) {
  if (left === right) {
    return 'Tie'
  }

  return left > right ? 'User A' : 'User B'
}
</script>

<template>
  <section class="surface p-5">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 class="title-lg">User A vs User B</h2>
        <p class="muted mt-1 text-sm">Compare profile, repository and activity metrics</p>
      </div>
      <div class="grid size-10 place-items-center rounded-md bg-emerald-50 text-emerald-700">
        <GitCompareArrows class="size-5" />
      </div>
    </div>

    <form class="flex gap-2" @submit.prevent="$emit('compare')">
      <input
        v-model="model"
        class="control min-w-0 flex-1 px-3 text-sm"
        placeholder="another username"
        type="search"
      />
      <button class="btn-primary">
        Compare
      </button>
    </form>

    <div v-if="baseProfile && compareProfile" class="mt-5 overflow-x-auto rounded-md border border-slate-200">
      <div class="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
        <div class="surface-soft p-3">
          <p class="metric-label">@{{ baseProfile.username }}</p>
          <p class="metric-value">{{ baseProfile.totalScore }}</p>
        </div>
        <div class="surface-soft p-3">
          <p class="metric-label">Summary</p>
          <p class="mt-2 text-sm font-bold text-slate-950">{{ winnerSummary }}</p>
        </div>
        <div class="surface-soft p-3">
          <p class="metric-label">@{{ compareProfile.username }}</p>
          <p class="metric-value">{{ compareProfile.totalScore }}</p>
        </div>
      </div>

      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3 font-semibold">Metric</th>
            <th class="px-4 py-3 font-semibold">@{{ baseProfile.username }}</th>
            <th class="px-4 py-3 font-semibold">@{{ compareProfile.username }}</th>
            <th class="px-4 py-3 font-semibold">Winner</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="row in rows" :key="row.label">
            <td class="px-4 py-3 font-semibold text-slate-950">{{ row.label }}</td>
            <td class="px-4 py-3 text-slate-600">{{ row.left }}</td>
            <td class="px-4 py-3 text-slate-600">{{ row.right }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-md px-2 py-1 text-xs font-semibold"
                :class="{
                  'bg-emerald-50 text-emerald-700': row.winner === 'User A' || row.winner === 'User B',
                  'bg-slate-100 text-slate-600': row.winner === 'Tie',
                }"
              >
                {{ row.winner }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="mt-5 text-sm text-slate-500">Enter a second username to compare.</p>
  </section>
</template>
