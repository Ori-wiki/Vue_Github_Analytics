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
  archived?: boolean
  license?: {
    name: string
    spdx_id: string
  } | null
  default_branch?: string
}

export type GithubOrganization = {
  login: string
  avatar_url: string
  html_url: string
  name: string | null
  description: string | null
  public_repos: number
  followers: number
  location: string | null
  created_at: string
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

export type GithubReadme = {
  html_url: string
  download_url: string | null
  content: string
  encoding: string
}

export type GithubRelease = {
  id: number
  name: string | null
  tag_name: string
  html_url: string
  published_at: string | null
}

export type GithubContributor = {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

export type GithubIssue = {
  id: number
  title: string
  labels: Array<{
    id: number
    name: string
    color: string
  }>
  pull_request?: unknown
}

export type GithubCommit = {
  sha: string
  html_url: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
}

export type GithubWorkflowRun = {
  id: number
  name: string | null
  html_url: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
}

export type GithubSearchUserItem = {
  id: number
  login: string
  avatar_url: string
  html_url: string
  type: 'User' | 'Organization'
}

export type GithubSearchRepositoryItem = {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  owner: {
    login: string
  }
}

export type GithubSearchResponse<T> = {
  total_count: number
  incomplete_results: boolean
  items: T[]
}

export type AppErrorCode = 'not-found' | 'rate-limit' | 'network' | 'empty' | 'unknown'

export type AppError = {
  code: AppErrorCode
  message: string
  action?: 'retry' | 'add-token' | 'open-github'
}

export type GraphqlContributionDay = {
  date: string
  contributionCount: number
}

export type GraphqlCommitRepositoryStat = {
  repository: {
    nameWithOwner: string
  }
  contributions: {
    totalCount: number
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

export type RepoHealthStatus = 'Healthy' | 'Stale' | 'Needs attention'

export type RepoFilters = {
  search: string
  languages: string[]
  minStars: number
  license: 'all' | 'with' | 'without'
  updatedWithinDays: number | 'all'
  archived: 'all' | 'active' | 'archived'
  sort: SortMode
}

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
  popularityScore: number
  activityScore: number
  maintenanceScore: number
  totalScore: number
}

export type AppStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'user-not-found'
  | 'rate-limit'
  | 'network-error'
  | 'error'
