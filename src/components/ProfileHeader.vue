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
  <section class="surface grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.35fr_1fr]">
    <div class="flex flex-col gap-5 sm:flex-row">
      <div class="w-fit rounded-lg border border-slate-200 bg-slate-50 p-2">
        <img
          class="size-24 rounded-md object-cover"
          :alt="`${user.login} avatar`"
          :src="user.avatar_url"
        />
      </div>

      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-black leading-none text-slate-950">{{ user.name ?? user.login }}</h1>
          <a
            class="btn-secondary h-9 px-3"
            :href="user.html_url"
            rel="noreferrer"
            target="_blank"
          >
            @{{ user.login }}
            <ExternalLink class="size-4" />
          </a>
        </div>

        <p class="muted mt-4 max-w-2xl text-sm leading-6">
          {{ user.bio ?? 'No bio yet.' }}
        </p>

        <div class="mt-5 flex flex-wrap gap-2 text-sm text-slate-600">
          <span v-if="user.company" class="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-medium">
            <Building2 class="size-4 text-slate-500" />
            {{ user.company }}
          </span>
          <span v-if="user.location" class="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-medium">
            <MapPin class="size-4 text-slate-500" />
            {{ user.location }}
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-medium">
            <Users class="size-4 text-slate-500" />
            {{ formatNumber(user.followers) }} followers
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
      <div class="stat-tile">
        <p class="metric-label">Repositories</p>
        <p class="metric-value">{{ formatNumber(repositories) }}</p>
      </div>
      <div class="stat-tile">
        <p class="metric-label">Stars</p>
        <p class="metric-value">{{ formatNumber(stars) }}</p>
      </div>
      <div class="stat-tile">
        <p class="metric-label">Following</p>
        <p class="metric-value">{{ formatNumber(user.following) }}</p>
      </div>
      <div class="stat-tile">
        <p class="metric-label">Joined</p>
        <p class="mt-2 text-sm font-extrabold text-slate-950">{{ formatDateDistance(user.created_at) }}</p>
      </div>
    </div>
  </section>
</template>
