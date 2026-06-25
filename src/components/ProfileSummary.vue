<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles } from '@lucide/vue'
import type { GithubRepository, GithubUser, LanguageStat } from '../types/github'
import { getRepositoryHealth } from '../utils/analytics'
import { formatNumber } from '../utils/format'

const props = defineProps<{
  user: GithubUser
  repositories: GithubRepository[]
  languages: LanguageStat[]
  stars: number
}>()

const summary = computed(() => {
  const topLanguage = props.languages[0]?.name ?? 'unknown languages'
  const staleCount = props.repositories.filter((repository) => getRepositoryHealth(repository).status !== 'Healthy').length
  const healthyCount = props.repositories.length - staleCount

  return `@${props.user.login} is most active in ${topLanguage}, has ${formatNumber(props.repositories.length)} public repositories and ${formatNumber(props.stars)} total stars. ${healthyCount} repositories look healthy, while ${staleCount} may need attention.`
})
</script>

<template>
  <section class="surface p-5">
    <div class="mb-3 flex items-center gap-2">
      <Sparkles class="size-5 text-emerald-600" />
      <h2 class="title-lg">Profile summary</h2>
    </div>
    <p class="text-sm leading-6 text-slate-700">{{ summary }}</p>
  </section>
</template>
