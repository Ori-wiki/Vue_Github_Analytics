import { format, subDays } from 'date-fns'
import type {
  CommitStat,
  ComparisonProfile,
  ContributionDay,
  GithubEvent,
  GithubRepository,
  GithubUser,
  GraphqlCommitRepositoryStat,
  GraphqlContributionDay,
  LanguageStat,
  RepoFilters,
  RepoHealthStatus,
  SortMode,
} from '../types/github'

export function getTotalStars(repositories: GithubRepository[]) {
  return repositories.reduce((total, repository) => total + repository.stargazers_count, 0)
}

export function getLanguageStats(repositories: GithubRepository[]): LanguageStat[] {
  const map = new Map<string, LanguageStat>()

  for (const repository of repositories) {
    const language = repository.language ?? 'Other'
    const current = map.get(language) ?? { name: language, repositories: 0, stars: 0 }

    current.repositories += 1
    current.stars += repository.stargazers_count
    map.set(language, current)
  }

  return Array.from(map.values()).sort((a, b) => b.repositories - a.repositories)
}

export function getRecentContributions(events: GithubEvent[], days = 28): ContributionDay[] {
  const today = new Date()
  const buckets = new Map<string, number>()

  for (let index = days - 1; index >= 0; index -= 1) {
    buckets.set(format(subDays(today, index), 'yyyy-MM-dd'), 0)
  }

  for (const event of events) {
    const key = event.created_at.slice(0, 10)

    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + getEventWeight(event))
    }
  }

  return Array.from(buckets, ([date, count]) => ({ date, count }))
}

export function getContributionsFromGraphql(days: GraphqlContributionDay[], limit = 84): ContributionDay[] {
  return days
    .slice(-limit)
    .map((day) => ({
      date: day.date,
      count: day.contributionCount,
    }))
}

export function getCommitStats(events: GithubEvent[]): CommitStat[] {
  const map = new Map<string, number>()

  for (const event of events) {
    if (event.type !== 'PushEvent') {
      continue
    }

    map.set(event.repo.name, (map.get(event.repo.name) ?? 0) + (event.payload.commits?.length ?? 0))
  }

  return Array.from(map, ([repo, commits]) => ({ repo, commits }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 8)
}

export function getCommitStatsFromGraphql(stats: GraphqlCommitRepositoryStat[]): CommitStat[] {
  return stats
    .map((item) => ({
      repo: item.repository.nameWithOwner,
      commits: item.contributions.totalCount,
    }))
    .filter((item) => item.commits > 0)
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 8)
}

export function getMostActiveDay(events: GithubEvent[]) {
  const dayCounts = new Map<string, number>()

  for (const event of events) {
    const day = format(new Date(event.created_at), 'EEEE')
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + getEventWeight(event))
  }

  const [day, score] = Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0] ?? [
    'No activity',
    0,
  ]

  return { day, score }
}

export function getComparisonProfile(
  user: GithubUser,
  repositories: GithubRepository[],
  events: GithubEvent[],
): ComparisonProfile {
  const totalStars = getTotalStars(repositories)
  const topLanguage = getLanguageStats(repositories)[0]
  const mostActiveDay = getMostActiveDay(events)

  return {
    username: user.login,
    totalStars,
    followers: user.followers,
    repos: repositories.length,
    topLanguage: topLanguage?.name ?? 'No data',
    topLanguageRepos: topLanguage?.repositories ?? 0,
    averageStars: repositories.length ? totalStars / repositories.length : 0,
    mostActiveDay: mostActiveDay.day,
    mostActiveDayScore: mostActiveDay.score,
    popularityScore: getPopularityScore(user, totalStars),
    activityScore: getActivityScore(events, repositories),
    maintenanceScore: getMaintenanceScore(repositories),
    totalScore:
      getPopularityScore(user, totalStars) +
      getActivityScore(events, repositories) +
      getMaintenanceScore(repositories),
  }
}

export function filterRepositories(
  repositories: GithubRepository[],
  search: string,
  language: string,
  sort: SortMode,
) {
  return filterRepositoriesAdvanced(repositories, {
    search,
    languages: language === 'all' ? [] : [language],
    minStars: 0,
    license: 'all',
    updatedWithinDays: 'all',
    archived: 'all',
    sort,
  })
}

export function filterRepositoriesAdvanced(repositories: GithubRepository[], filters: RepoFilters) {
  return repositories
    .filter((repository) => {
      const normalizedSearch = filters.search.trim().toLowerCase()
      const repositoryLanguage = repository.language ?? 'Other'
      const updatedDays = (Date.now() - new Date(repository.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
      const matchesSearch =
        repository.name.toLowerCase().includes(normalizedSearch) ||
        (repository.description?.toLowerCase().includes(normalizedSearch) ?? false)
      const matchesLanguage = filters.languages.length === 0 || filters.languages.includes(repositoryLanguage)
      const matchesStars = repository.stargazers_count >= filters.minStars
      const matchesLicense =
        filters.license === 'all' ||
        (filters.license === 'with' && Boolean(repository.license)) ||
        (filters.license === 'without' && !repository.license)
      const matchesUpdated =
        filters.updatedWithinDays === 'all' || updatedDays <= filters.updatedWithinDays
      const matchesArchived =
        filters.archived === 'all' ||
        (filters.archived === 'active' && !repository.archived) ||
        (filters.archived === 'archived' && repository.archived)

      return (
        matchesSearch &&
        matchesLanguage &&
        matchesStars &&
        matchesLicense &&
        matchesUpdated &&
        matchesArchived
      )
    })
    .sort((a, b) => {
      if (filters.sort === 'name') {
        return a.name.localeCompare(b.name)
      }

      if (filters.sort === 'updated') {
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      }

      return b.stargazers_count - a.stargazers_count
    })
}

export function getRepositoryHealth(repository: GithubRepository): {
  score: number
  status: RepoHealthStatus
  reasons: string[]
} {
  const daysSincePush = (Date.now() - new Date(repository.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
  const reasons: string[] = []
  let score = 100

  if (daysSincePush > 365) {
    score -= 35
    reasons.push('stale updates')
  } else if (daysSincePush > 120) {
    score -= 18
    reasons.push('quiet recently')
  }

  if (!repository.license) {
    score -= 12
    reasons.push('no license')
  }

  if (repository.open_issues_count > 50) {
    score -= 18
    reasons.push('many open issues')
  } else if (repository.open_issues_count > 15) {
    score -= 8
    reasons.push('some issue load')
  }

  if ((repository.stargazers_count ?? 0) > 100) {
    score += 6
  }

  if (repository.archived) {
    score = Math.min(score, 45)
    reasons.push('archived')
  }

  const boundedScore = Math.max(Math.min(Math.round(score), 100), 0)
  const status: RepoHealthStatus =
    boundedScore >= 75 ? 'Healthy' : boundedScore >= 50 ? 'Stale' : 'Needs attention'

  return {
    score: boundedScore,
    status,
    reasons: reasons.length ? reasons : ['active baseline'],
  }
}

function getEventWeight(event: GithubEvent) {
  if (event.type === 'PushEvent') {
    return Math.max(event.payload.commits?.length ?? 1, 1)
  }

  return 1
}

function getPopularityScore(user: GithubUser, totalStars: number) {
  return Math.round(Math.log10(totalStars + 1) * 24 + Math.log10(user.followers + 1) * 18)
}

function getActivityScore(events: GithubEvent[], repositories: GithubRepository[]) {
  const recentPushes = events.filter((event) => event.type === 'PushEvent').length
  const recentlyUpdated = repositories.filter((repository) => {
    const pushedAt = new Date(repository.pushed_at).getTime()
    const days = (Date.now() - pushedAt) / (1000 * 60 * 60 * 24)
    return days <= 90
  }).length

  return Math.round(recentPushes * 5 + recentlyUpdated * 2)
}

function getMaintenanceScore(repositories: GithubRepository[]) {
  if (!repositories.length) {
    return 0
  }

  const issueLoad = repositories.reduce((total, repository) => total + repository.open_issues_count, 0)
  const repoScore = Math.min(repositories.length * 4, 80)
  const issuePenalty = Math.min(issueLoad * 0.2, 35)

  return Math.max(Math.round(repoScore - issuePenalty), 0)
}
