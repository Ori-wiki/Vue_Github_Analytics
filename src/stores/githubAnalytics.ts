import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchContributionCalendar,
  fetchGithubEvents,
  fetchGithubRepositories,
  fetchGithubUser,
} from '../queries/githubQueries'
import type {
  AppStatus,
  CommitStat,
  ContributionDay,
  GithubEvent,
  GithubRepository,
  GithubUser,
  RepoFilters,
  SortMode,
} from '../types/github'
import {
  filterRepositoriesAdvanced,
  getCommitStats,
  getCommitStatsFromGraphql,
  getComparisonProfile,
  getContributionsFromGraphql,
  getLanguageStats,
  getRecentContributions,
  getTotalStars,
} from '../utils/analytics'
import { getGithubErrorMessage, getGithubErrorStatus, getStatusMessage } from '../utils/githubErrors'
import { useFavoritesStore } from './favorites'

export type AnalyticsSource = 'graphql' | 'public-events' | 'none'

export const useGithubAnalyticsStore = defineStore('githubAnalytics', () => {
  const username = ref('vuejs')
  const compareUsername = ref('')
  const search = ref('')
  const language = ref('all')
  const sort = ref<SortMode>('stars')
  const repoFilters = ref<RepoFilters>({
    search: '',
    languages: [],
    minStars: 0,
    license: 'all',
    updatedWithinDays: 'all',
    archived: 'all',
    sort: 'stars',
  })
  const user = ref<GithubUser | null>(null)
  const compareUser = ref<GithubUser | null>(null)
  const repositories = ref<GithubRepository[]>([])
  const compareRepositories = ref<GithubRepository[]>([])
  const events = ref<GithubEvent[]>([])
  const compareEvents = ref<GithubEvent[]>([])
  const graphqlContributions = ref<ContributionDay[]>([])
  const graphqlCommitStats = ref<CommitStat[]>([])
  const status = ref<AppStatus>('idle')
  const repositoriesStatus = ref<AppStatus>('idle')
  const eventsStatus = ref<AppStatus>('idle')
  const compareStatus = ref<AppStatus>('idle')
  const compareRepositoriesStatus = ref<AppStatus>('idle')
  const compareEventsStatus = ref<AppStatus>('idle')
  const dataWarning = ref('')
  const compareError = ref('')
  let profileRequestId = 0
  let comparisonRequestId = 0

  const isLoading = computed(() => status.value === 'loading')
  const error = computed(() => getStatusMessage(status.value))
  const hasRepositories = computed(() => repositories.value.length > 0)
  const contributionSource = computed<AnalyticsSource>(() => {
    if (graphqlContributions.value.length) {
      return 'graphql'
    }

    return events.value.length ? 'public-events' : 'none'
  })
  const commitSource = computed<AnalyticsSource>(() => {
    if (graphqlCommitStats.value.length) {
      return 'graphql'
    }

    return events.value.length ? 'public-events' : 'none'
  })
  const hasPublicEvents = computed(() => contributionSource.value !== 'none')
  const totalStars = computed(() => getTotalStars(repositories.value))
  const languages = computed(() => getLanguageStats(repositories.value))
  const languageOptions = computed(() => languages.value.map((item) => item.name))
  const contributions = computed(() =>
    graphqlContributions.value.length ? graphqlContributions.value : getRecentContributions(events.value),
  )
  const commits = computed(() =>
    graphqlCommitStats.value.length ? graphqlCommitStats.value : getCommitStats(events.value),
  )
  const comparisonProfile = computed(() =>
    user.value ? getComparisonProfile(user.value, repositories.value, events.value) : null,
  )
  const compareProfile = computed(() =>
    compareUser.value
      ? getComparisonProfile(compareUser.value, compareRepositories.value, compareEvents.value)
      : null,
  )
  const visibleRepositories = computed(() => filterRepositoriesAdvanced(repositories.value, repoFilters.value))

  async function loadProfile(targetUsername = username.value) {
    const normalizedUsername = targetUsername.trim()

    if (!normalizedUsername) {
      status.value = 'error'
      return
    }

    const requestId = ++profileRequestId
    status.value = 'loading'
    repositoriesStatus.value = 'idle'
    eventsStatus.value = 'idle'
    dataWarning.value = ''
    graphqlContributions.value = []
    graphqlCommitStats.value = []

    try {
      const profile = await fetchGithubUser(normalizedUsername)

      if (requestId !== profileRequestId) {
        return
      }

      username.value = normalizedUsername
      user.value = profile
      search.value = ''
      language.value = 'all'
      repoFilters.value.search = ''
      repoFilters.value.languages = []
      status.value = 'ready'
      useFavoritesStore().addRecent(normalizedUsername)
    } catch (unknownError) {
      if (requestId !== profileRequestId) {
        return
      }

      status.value = getGithubErrorStatus(unknownError)
      dataWarning.value = getGithubErrorMessage(unknownError)
      user.value = null
      repositories.value = []
      events.value = []
      repositoriesStatus.value = 'idle'
      eventsStatus.value = 'idle'
      return
    }

    const [reposResult, eventsResult, graphqlResult] = await Promise.allSettled([
      fetchGithubRepositories(normalizedUsername),
      fetchGithubEvents(normalizedUsername),
      fetchContributionCalendar(normalizedUsername),
    ])

    if (requestId !== profileRequestId) {
      return
    }

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

    if (graphqlResult.status === 'fulfilled' && graphqlResult.value) {
      graphqlContributions.value = getContributionsFromGraphql(graphqlResult.value.days)
      graphqlCommitStats.value = getCommitStatsFromGraphql(graphqlResult.value.commitRepositories)
    }
  }

  async function loadComparison() {
    const normalizedUsername = compareUsername.value.trim()

    if (!normalizedUsername) {
      clearComparison()
      return
    }

    const requestId = ++comparisonRequestId
    compareError.value = ''
    compareStatus.value = 'loading'
    compareRepositoriesStatus.value = 'idle'
    compareEventsStatus.value = 'idle'

    try {
      const profile = await fetchGithubUser(normalizedUsername)

      if (requestId !== comparisonRequestId) {
        return
      }

      compareUsername.value = normalizedUsername
      compareUser.value = profile
      compareStatus.value = 'ready'
    } catch (unknownError) {
      if (requestId !== comparisonRequestId) {
        return
      }

      compareStatus.value = getGithubErrorStatus(unknownError)
      compareUser.value = null
      compareRepositories.value = []
      compareEvents.value = []
      compareError.value = getGithubErrorMessage(unknownError)
      return
    }

    const [reposResult, eventsResult] = await Promise.allSettled([
      fetchGithubRepositories(normalizedUsername),
      fetchGithubEvents(normalizedUsername),
    ])

    if (requestId !== comparisonRequestId) {
      return
    }

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
    repoFilters,
    user,
    compareUser,
    repositories,
    compareRepositories,
    events,
    compareEvents,
    graphqlContributions,
    graphqlCommitStats,
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
    contributionSource,
    commitSource,
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
