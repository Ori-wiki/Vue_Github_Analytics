<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import ActivityChart from './components/charts/ActivityChart.vue'
import CommitChart from './components/charts/CommitChart.vue'
import LanguageChart from './components/charts/LanguageChart.vue'
import ProfileHeader from './components/ProfileHeader.vue'
import RepositoryTable from './components/RepositoryTable.vue'
import SearchBar from './components/SearchBar.vue'
import UserComparison from './components/UserComparison.vue'
import { useGithubAnalyticsStore } from './stores/githubAnalytics'

const store = useGithubAnalyticsStore()
const {
  username,
  compareUsername,
  search,
  language,
  sort,
  user,
  compareUser,
  repositories,
  isLoading,
  error,
  totalStars,
  languages,
  languageOptions,
  contributions,
  commits,
  visibleRepositories,
} = storeToRefs(store)

onMounted(() => {
  void store.loadProfile()
})
</script>

<template>
  <main class="min-h-screen bg-slate-100 text-slate-950">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header class="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-emerald-700">GitHub Analytics</p>
          <h1 class="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Developer intelligence dashboard</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Repositories, stars, followers, languages, contribution estimates, commits, filters, search and comparison.
          </p>
        </div>

        <SearchBar v-model="username" :is-loading="isLoading" @submit="store.loadProfile()" />
      </header>

      <p v-if="error" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </p>

      <div v-if="isLoading && !user" class="grid min-h-96 place-items-center rounded-lg border border-slate-200 bg-white">
        <p class="text-sm font-medium text-slate-500">Loading GitHub profile...</p>
      </div>

      <template v-if="user">
        <ProfileHeader :repositories="repositories.length" :stars="totalStars" :user="user" />

        <section class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <ActivityChart :contributions="contributions" />
          <LanguageChart :languages="languages" />
        </section>

        <section class="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <CommitChart :commits="commits" />
          <UserComparison
            v-model="compareUsername"
            :base-user="user"
            :compare-user="compareUser"
            @compare="store.loadComparison()"
          />
        </section>

        <RepositoryTable
          v-model:language="language"
          v-model:search="search"
          v-model:sort="sort"
          :languages="languageOptions"
          :repositories="visibleRepositories"
        />
      </template>
    </div>
  </main>
</template>
