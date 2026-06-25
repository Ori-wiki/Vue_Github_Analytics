import { format, subDays } from 'date-fns'
import type {
  CommitStat,
  ComparisonProfile,
  ContributionDay,
  GithubEvent,
  GithubRepository,
  GithubUser,
  LanguageStat,
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
  }
}

export function filterRepositories(
  repositories: GithubRepository[],
  search: string,
  language: string,
  sort: SortMode,
) {
  const normalizedSearch = search.trim().toLowerCase()

  return repositories
    .filter((repository) => {
      const matchesSearch =
        repository.name.toLowerCase().includes(normalizedSearch) ||
        (repository.description?.toLowerCase().includes(normalizedSearch) ?? false)
      const matchesLanguage = language === 'all' || (repository.language ?? 'Other') === language

      return matchesSearch && matchesLanguage
    })
    .sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name)
      }

      if (sort === 'updated') {
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      }

      return b.stargazers_count - a.stargazers_count
    })
}

function getEventWeight(event: GithubEvent) {
  if (event.type === 'PushEvent') {
    return Math.max(event.payload.commits?.length ?? 1, 1)
  }

  return 1
}
