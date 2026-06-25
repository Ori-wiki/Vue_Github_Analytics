<script setup lang="ts">
import { Building2, ExternalLink, MapPin, Users } from '@lucide/vue'
import type { GithubUser } from '../types/github'
import { formatDateDistance, formatNumber } from '../utils/format'

defineProps<{
  user: GithubUser
  repositories: number
  stars: number
}>()
</script>

<template>
  <section class="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1.4fr_1fr]">
    <div class="flex flex-col gap-5 sm:flex-row">
      <img
        class="size-24 rounded-lg border border-slate-200 object-cover"
        :alt="`${user.login} avatar`"
        :src="user.avatar_url"
      />

      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-bold text-slate-950">{{ user.name ?? user.login }}</h1>
          <a
            class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-sm font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
            :href="user.html_url"
            rel="noreferrer"
            target="_blank"
          >
            @{{ user.login }}
            <ExternalLink class="size-4" />
          </a>
        </div>

        <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          {{ user.bio ?? 'No bio yet.' }}
        </p>

        <div class="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
          <span v-if="user.company" class="inline-flex items-center gap-1">
            <Building2 class="size-4" />
            {{ user.company }}
          </span>
          <span v-if="user.location" class="inline-flex items-center gap-1">
            <MapPin class="size-4" />
            {{ user.location }}
          </span>
          <span class="inline-flex items-center gap-1">
            <Users class="size-4" />
            {{ formatNumber(user.followers) }} followers
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
      <div class="rounded-md border border-slate-200 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Repositories</p>
        <p class="mt-2 text-2xl font-bold text-slate-950">{{ formatNumber(repositories) }}</p>
      </div>
      <div class="rounded-md border border-slate-200 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Stars</p>
        <p class="mt-2 text-2xl font-bold text-slate-950">{{ formatNumber(stars) }}</p>
      </div>
      <div class="rounded-md border border-slate-200 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Following</p>
        <p class="mt-2 text-2xl font-bold text-slate-950">{{ formatNumber(user.following) }}</p>
      </div>
      <div class="rounded-md border border-slate-200 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Joined</p>
        <p class="mt-2 text-sm font-semibold text-slate-950">{{ formatDateDistance(user.created_at) }}</p>
      </div>
    </div>
  </section>
</template>
