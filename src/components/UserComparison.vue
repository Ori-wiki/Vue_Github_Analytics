<script setup lang="ts">
import { GitCompareArrows } from '@lucide/vue'
import type { GithubUser } from '../types/github'
import { formatNumber } from '../utils/format'

defineProps<{
  baseUser: GithubUser
  compareUser: GithubUser | null
}>()

const model = defineModel<string>({ required: true })

defineEmits<{
  compare: []
}>()
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-slate-950">Compare users</h2>
        <p class="text-sm text-slate-500">Quick profile-level comparison</p>
      </div>
      <GitCompareArrows class="size-5 text-emerald-600" />
    </div>

    <form class="flex gap-2" @submit.prevent="$emit('compare')">
      <input
        v-model="model"
        class="h-11 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        placeholder="another username"
        type="search"
      />
      <button class="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700">
        Compare
      </button>
    </form>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <div class="rounded-md border border-slate-200 p-4">
        <p class="text-sm font-semibold text-slate-950">@{{ baseUser.login }}</p>
        <dl class="mt-3 space-y-2 text-sm text-slate-600">
          <div class="flex justify-between gap-4">
            <dt>Followers</dt>
            <dd class="font-semibold">{{ formatNumber(baseUser.followers) }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt>Repos</dt>
            <dd class="font-semibold">{{ formatNumber(baseUser.public_repos) }}</dd>
          </div>
        </dl>
      </div>

      <div class="rounded-md border border-slate-200 p-4">
        <p class="text-sm font-semibold text-slate-950">
          {{ compareUser ? `@${compareUser.login}` : 'Second user' }}
        </p>
        <dl v-if="compareUser" class="mt-3 space-y-2 text-sm text-slate-600">
          <div class="flex justify-between gap-4">
            <dt>Followers</dt>
            <dd class="font-semibold">{{ formatNumber(compareUser.followers) }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt>Repos</dt>
            <dd class="font-semibold">{{ formatNumber(compareUser.public_repos) }}</dd>
          </div>
        </dl>
        <p v-else class="mt-3 text-sm text-slate-500">Enter a username to compare.</p>
      </div>
    </div>
  </section>
</template>
