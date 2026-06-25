export type GithubUser = {
  login: string
  avatar_url: string
  html_url: string
  name: string | null
  bio: string | null
  company: string | null
  location: string | null
  blog: string
  followers: number
  following: number
  public_repos: number
  created_at: string
}

export type GithubRepository = {
  id: number
  name: string
  owner?: {
    login: string
  }
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  watchers_count?: number
  topics?: string[]
  pushed_at: string
  created_at: string
  updated_at: string
}

export type GithubEvent = {
  id: string
  type: string
  created_at: string
  repo: {
    name: string
  }
  payload: {
    commits?: Array<{
      sha: string
      message: string
    }>
  }
}

export type LanguageStat = {
  name: string
  repositories: number
  stars: number
}

export type ContributionDay = {
  date: string
  count: number
}

export type CommitStat = {
  repo: string
  commits: number
}

export type SortMode = 'stars' | 'updated' | 'name'

export type ComparisonProfile = {
  username: string
  totalStars: number
  followers: number
  repos: number
  topLanguage: string
  topLanguageRepos: number
  averageStars: number
  mostActiveDay: string
  mostActiveDayScore: number
}

export type AppStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'user-not-found'
  | 'rate-limit'
  | 'network-error'
  | 'error'
