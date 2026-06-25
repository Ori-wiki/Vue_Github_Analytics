import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getGithubEvents, getGithubRepositories, getGithubUser } from '../api/github'
import type { AppStatus, GithubEvent, GithubRepository, GithubUser, SortMode } from '../types/github'
import {
  filterRepositories,
  getComparisonProfile,
  getCommitStats,
  getLanguageStats,
  getRecentContributions,
  getTotalStars,
} from '../utils/analytics'
import { getGithubErrorMessage, getGithubErrorStatus, getStatusMessage } from '../utils/githubErrors'

export const useGithubAnalyticsStore = defineStore('githubAnalytics', () => {
  const username = ref('vuejs')
  const compareUsername = ref('')
  const search = ref('')
  const language = ref('all')
  const sort = ref<SortMode>('stars')
  const user = ref<GithubUser | null>(null)
  const compareUser = ref<GithubUser | null>(null)
  const repositories = ref<GithubRepository[]>([])
  const compareRepositories = ref<GithubRepository[]>([])
  const events = ref<GithubEvent[]>([])
  const compareEvents = ref<GithubEvent[]>([])
  const status = ref<AppStatus>('idle')
  const repositoriesStatus = ref<AppStatus>('idle')
  const eventsStatus = ref<AppStatus>('idle')
  const compareStatus = ref<AppStatus>('idle')
  const compareRepositoriesStatus = ref<AppStatus>('idle')
  const compareEventsStatus = ref<AppStatus>('idle')
  const dataWarning = ref('')
  const compareError = ref('')

  const isLoading = computed(() => status.value === 'loading')
  const error = computed(() => getStatusMessage(status.value))
  const hasRepositories = computed(() => repositories.value.length > 0)
  const hasPublicEvents = computed(() => events.value.length > 0)
  const totalStars = computed(() => getTotalStars(repositories.value))
  const languages = computed(() => getLanguageStats(repositories.value))
  const languageOptions = computed(() => languages.value.map((item) => item.name))
  const contributions = computed(() => getRecentContributions(events.value))
  const commits = computed(() => getCommitStats(events.value))
  const comparisonProfile = computed(() =>
    user.value ? getComparisonProfile(user.value, repositories.value, events.value) : null,
  )
  const compareProfile = computed(() =>
    compareUser.value
      ? getComparisonProfile(compareUser.value, compareRepositories.value, compareEvents.value)
      : null,
  )
  const visibleRepositories = computed(() =>
    filterRepositories(repositories.value, search.value, language.value, sort.value),
  )

  async function loadProfile(targetUsername = username.value) {
    const normalizedUsername = targetUsername.trim()

    if (!normalizedUsername) {
      status.value = 'error'
      return
    }

    status.value = 'loading'
    repositoriesStatus.value = 'idle'
    eventsStatus.value = 'idle'
    dataWarning.value = ''

    try {
      const profile = await getGithubUser(normalizedUsername)

      username.value = normalizedUsername
      user.value = profile
      search.value = ''
      language.value = 'all'
      status.value = 'ready'
    } catch (unknownError) {
      status.value = getGithubErrorStatus(unknownError)
      dataWarning.value = getGithubErrorMessage(unknownError)
      user.value = null
      repositories.value = []
      events.value = []
      repositoriesStatus.value = 'idle'
      eventsStatus.value = 'idle'
      return
    }

    const [reposResult, eventsResult] = await Promise.allSettled([
      getGithubRepositories(normalizedUsername),
      getGithubEvents(normalizedUsername),
    ])

    if (reposResult.status === 'fulfilled') {
      repositories.value = reposResult.value
      repositoriesStatus.value = 'ready'
    } else {
      repositories.value = []
      repositoriesStatus.value = getGithubErrorStatus(reposResult.reason)
      dataWarning.value = getGithubErrorMessage(
        reposResult.reason,
        'Профиль загружен, но репозитории временно недоступны.',
      )
    }

    if (eventsResult.status === 'fulfilled') {
      events.value = eventsResult.value
      eventsStatus.value = 'ready'
    } else {
      events.value = []
      eventsStatus.value = getGithubErrorStatus(eventsResult.reason)
      dataWarning.value =
        dataWarning.value ||
        getGithubErrorMessage(eventsResult.reason, 'Профиль загружен, но public events временно недоступны.')
    }
  }

  async function loadComparison() {
    const normalizedUsername = compareUsername.value.trim()

    if (!normalizedUsername) {
      compareUser.value = null
      compareRepositories.value = []
      compareEvents.value = []
      compareError.value = ''
      compareRepositoriesStatus.value = 'idle'
      compareEventsStatus.value = 'idle'
      return
    }

    compareError.value = ''
    compareStatus.value = 'loading'
    compareRepositoriesStatus.value = 'idle'
    compareEventsStatus.value = 'idle'

    try {
      const profile = await getGithubUser(normalizedUsername)

      compareUsername.value = normalizedUsername
      compareUser.value = profile
      compareStatus.value = 'ready'
    } catch (unknownError) {
      compareStatus.value = getGithubErrorStatus(unknownError)
      compareUser.value = null
      compareRepositories.value = []
      compareEvents.value = []
      compareError.value = getGithubErrorMessage(unknownError)
      return
    }

    const [reposResult, eventsResult] = await Promise.allSettled([
      getGithubRepositories(normalizedUsername),
      getGithubEvents(normalizedUsername),
    ])

    if (reposResult.status === 'fulfilled') {
      compareRepositories.value = reposResult.value
      compareRepositoriesStatus.value = 'ready'
    } else {
      compareRepositories.value = []
      compareRepositoriesStatus.value = getGithubErrorStatus(reposResult.reason)
      compareError.value = getGithubErrorMessage(
        reposResult.reason,
        'Пользователь для сравнения загружен, но репозитории временно недоступны.',
      )
    }

    if (eventsResult.status === 'fulfilled') {
      compareEvents.value = eventsResult.value
      compareEventsStatus.value = 'ready'
    } else {
      compareEvents.value = []
      compareEventsStatus.value = getGithubErrorStatus(eventsResult.reason)
      compareError.value =
        compareError.value ||
        getGithubErrorMessage(
          eventsResult.reason,
          'Пользователь для сравнения загружен, но public events временно недоступны.',
        )
    }
  }

  function clearComparison() {
    compareUsername.value = ''
    compareUser.value = null
    compareRepositories.value = []
    compareEvents.value = []
    compareStatus.value = 'idle'
    compareRepositoriesStatus.value = 'idle'
    compareEventsStatus.value = 'idle'
    compareError.value = ''
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
    compareRepositories,
    events,
    compareEvents,
    status,
    repositoriesStatus,
    eventsStatus,
    compareStatus,
    compareRepositoriesStatus,
    compareEventsStatus,
    isLoading,
    error,
    dataWarning,
    compareError,
    hasRepositories,
    hasPublicEvents,
    totalStars,
    languages,
    languageOptions,
    contributions,
    commits,
    comparisonProfile,
    compareProfile,
    visibleRepositories,
    loadProfile,
    loadComparison,
    clearComparison,
  }
})
