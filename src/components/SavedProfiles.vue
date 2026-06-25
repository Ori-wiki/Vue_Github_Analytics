<script setup lang="ts">
import { Pin, Star } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useFavoritesStore } from '../stores/favorites'
import { routeNames } from '../router/routes'

defineProps<{
  activeUsername: string
}>()

const favoritesStore = useFavoritesStore()
const { recentProfiles, pinnedProfiles, compareHistory, quickComparePair } = storeToRefs(favoritesStore)
</script>

<template>
  <section v-if="recentProfiles.length || pinnedProfiles.length" class="surface p-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 class="title-lg">Saved profiles</h2>
        <p class="muted mt-1 text-sm">Recent searches, pinned users and quick compare.</p>
      </div>

      <RouterLink
        v-if="quickComparePair.length === 2"
        class="btn-secondary"
        :to="{ name: routeNames.compare, params: { username: quickComparePair[0], compareUsername: quickComparePair[1] } }"
      >
        Quick compare
      </RouterLink>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-3">
      <div>
        <p class="metric-label">Pinned</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <RouterLink
            v-for="profile in pinnedProfiles"
            :key="profile"
            class="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            :to="{ name: routeNames.user, params: { username: profile } }"
          >
            <Pin class="size-3" />
            @{{ profile }}
          </RouterLink>
          <p v-if="!pinnedProfiles.length" class="text-sm text-slate-500">No pinned profiles yet.</p>
        </div>
      </div>

      <div>
        <p class="metric-label">Recent</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <RouterLink
            v-for="profile in recentProfiles"
            :key="profile"
            class="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            :to="{ name: routeNames.user, params: { username: profile } }"
          >
            <Star class="size-3" />
            @{{ profile }}
          </RouterLink>
        </div>
      </div>

      <div>
        <p class="metric-label">Compare history</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <RouterLink
            v-for="pair in compareHistory"
            :key="pair.join(':')"
            class="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            :to="{ name: routeNames.compare, params: { username: pair[0], compareUsername: pair[1] } }"
          >
            @{{ pair[0] }} vs @{{ pair[1] }}
          </RouterLink>
          <p v-if="!compareHistory.length" class="text-sm text-slate-500">No comparisons yet.</p>
        </div>
      </div>
    </div>

    <button
      class="btn-secondary mt-4"
      type="button"
      @click="favoritesStore.togglePinned(activeUsername)"
    >
      {{ favoritesStore.isPinned(activeUsername) ? 'Unpin current profile' : 'Pin current profile' }}
    </button>
  </section>
</template>
