import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getGithubEvents, getGithubRepositories, getGithubUser } from '../api/github'
import type { GithubEvent, GithubRepository, GithubUser, SortMode } from '../types/github'
import {
  filterRepositories,
  getCommitStats,
  getLanguageStats,
  getRecentContributions,
  getTotalStars,
} from '../utils/analytics'

export const useGithubAnalyticsStore = defineStore('githubAnalytics', () => {
  const username = ref('vuejs')
  const compareUsername = ref('')
  const search = ref('')
  const language = ref('all')
  const sort = ref<SortMode>('stars')
  const user = ref<GithubUser | null>(null)
  const compareUser = ref<GithubUser | null>(null)
  const repositories = ref<GithubRepository[]>([])
  const events = ref<GithubEvent[]>([])
  const isLoading = ref(false)
  const error = ref('')

  const totalStars = computed(() => getTotalStars(repositories.value))
  const languages = computed(() => getLanguageStats(repositories.value))
  const languageOptions = computed(() => languages.value.map((item) => item.name))
  const contributions = computed(() => getRecentContributions(events.value))
  const commits = computed(() => getCommitStats(events.value))
  const visibleRepositories = computed(() =>
    filterRepositories(repositories.value, search.value, language.value, sort.value),
  )

  async function loadProfile(targetUsername = username.value) {
    const normalizedUsername = targetUsername.trim()

    if (!normalizedUsername) {
      error.value = 'Enter a GitHub username'
      return
    }

    isLoading.value = true
    error.value = ''

    try {
      const [profile, repos, activity] = await Promise.all([
        getGithubUser(normalizedUsername),
        getGithubRepositories(normalizedUsername),
        getGithubEvents(normalizedUsername),
      ])

      username.value = normalizedUsername
      user.value = profile
      repositories.value = repos
      events.value = activity
      search.value = ''
      language.value = 'all'
    } catch (unknownError) {
      error.value = 'User was not found or GitHub API rate limit was reached'
      user.value = null
      repositories.value = []
      events.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function loadComparison() {
    const normalizedUsername = compareUsername.value.trim()

    if (!normalizedUsername) {
      compareUser.value = null
      return
    }

    compareUser.value = await getGithubUser(normalizedUsername)
  }

  return {
    username,
    compareUsername,
    search,
    language,
    sort,
    user,
    compareUser,
    repositories,
    events,
    isLoading,
    error,
    totalStars,
    languages,
    languageOptions,
    contributions,
    commits,
    visibleRepositories,
    loadProfile,
    loadComparison,
  }
})
