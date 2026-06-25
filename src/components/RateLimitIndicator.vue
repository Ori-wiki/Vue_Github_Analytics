<script setup lang="ts">
import { Gauge } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useRateLimitStore } from '../stores/rateLimit'

const rateLimitStore = useRateLimitStore()
const { authMode, limit, remaining, resetTime, resource } = storeToRefs(rateLimitStore)
</script>

<template>
  <section class="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-3">
      <div class="grid size-10 place-items-center rounded-md bg-emerald-50 text-emerald-700">
        <Gauge class="size-5" />
      </div>
      <div>
        <h2 class="title-lg">GitHub API limit</h2>
        <p class="muted mt-1 text-sm">
          {{ authMode === 'authenticated' ? 'Authenticated mode' : 'Unauthenticated mode' }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 text-right">
      <div class="surface-soft px-3 py-2">
        <p class="metric-label">Remaining</p>
        <p class="font-mono text-lg font-black text-slate-950">{{ remaining ?? 'n/a' }}</p>
      </div>
      <div class="surface-soft px-3 py-2">
        <p class="metric-label">Limit</p>
        <p class="font-mono text-lg font-black text-slate-950">{{ limit ?? 'n/a' }}</p>
      </div>
      <div class="surface-soft px-3 py-2">
        <p class="metric-label">Reset</p>
        <p class="font-mono text-lg font-black text-slate-950">{{ resetTime }}</p>
      </div>
    </div>

    <p v-if="resource" class="text-xs font-semibold text-slate-500">Resource: {{ resource }}</p>
  </section>
</template>
