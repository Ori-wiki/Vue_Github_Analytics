import axios from 'axios'
import { getGithubToken } from '../config/env'
import { useRateLimitStore } from '../stores/rateLimit'
import type {
  GithubCommit,
  GithubContributor,
  GithubEvent,
  GithubIssue,
  GithubOrganization,
  GithubReadme,
  GithubRelease,
  GithubRepository,
  GithubSearchRepositoryItem,
  GithubSearchResponse,
  GithubSearchUserItem,
  GithubUser,
  GithubWorkflowRun,
  GraphqlCommitRepositoryStat,
  GraphqlContributionDay,
} from '../types/github'

type RequestOptions = {
  signal?: AbortSignal
}

const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
  },
})

github.interceptors.request.use((config) => {
  const token = getGithubToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (import.meta.env.DEV) {
    const scenario = localStorage.getItem('msw-scenario')

    if (scenario) {
      config.headers['x-msw-scenario'] = scenario
    }
  }

  return config
})

github.interceptors.response.use(
  (response) => {
    useRateLimitStore().updateFromHeaders(response.headers as Record<string, unknown>)
    return response
  },
  (error) => {
    if (error?.response?.headers) {
      useRateLimitStore().updateFromHeaders(error.response.headers as Record<string, unknown>)
    }

    return Promise.reject(error)
  },
)

export async function getGithubUser(username: string, options: RequestOptions = {}) {
  return cachedGet<GithubUser>(`/users/${username}`, undefined, options)
}

export async function getGithubRepositories(username: string, options: RequestOptions = {}) {
  return cachedGet<GithubRepository[]>(
    `/users/${username}/repos`,
    {
      per_page: 100,
      sort: 'updated',
      direction: 'desc',
    },
    options,
  )
}

export async function getGithubOrganization(org: string, options: RequestOptions = {}) {
  return cachedGet<GithubOrganization>(`/orgs/${org}`, undefined, options)
}

export async function getGithubOrganizationRepositories(org: string, options: RequestOptions = {}) {
  return cachedGet<GithubRepository[]>(
    `/orgs/${org}/repos`,
    {
      per_page: 100,
      sort: 'updated',
      direction: 'desc',
    },
    options,
  )
}

export async function getGithubRepository(owner: string, repo: string, options: RequestOptions = {}) {
  return cachedGet<GithubRepository>(`/repos/${owner}/${repo}`, undefined, options)
}

export async function getGithubEvents(username: string, options: RequestOptions = {}) {
  return cachedGet<GithubEvent[]>(
    `/users/${username}/events/public`,
    {
      per_page: 100,
    },
    options,
  )
}

export async function getGithubReadme(owner: string, repo: string, options: RequestOptions = {}) {
  return cachedGet<GithubReadme>(`/repos/${owner}/${repo}/readme`, undefined, options)
}

export async function getGithubReleases(owner: string, repo: string, options: RequestOptions = {}) {
  return cachedGet<GithubRelease[]>(
    `/repos/${owner}/${repo}/releases`,
    {
      per_page: 5,
    },
    options,
  )
}

export async function getGithubContributors(owner: string, repo: string, options: RequestOptions = {}) {
  return cachedGet<GithubContributor[]>(
    `/repos/${owner}/${repo}/contributors`,
    {
      per_page: 6,
    },
    options,
  )
}

export async function getGithubIssues(owner: string, repo: string, options: RequestOptions = {}) {
  return cachedGet<GithubIssue[]>(
    `/repos/${owner}/${repo}/issues`,
    {
      state: 'open',
      per_page: 100,
    },
    options,
  )
}

export async function getGithubCommits(owner: string, repo: string, options: RequestOptions = {}) {
  return cachedGet<GithubCommit[]>(
    `/repos/${owner}/${repo}/commits`,
    {
      per_page: 30,
    },
    options,
  )
}

export async function getGithubWorkflowRuns(owner: string, repo: string, options: RequestOptions = {}) {
  const data = await cachedGet<{ workflow_runs: GithubWorkflowRun[] }>(
    `/repos/${owner}/${repo}/actions/runs`,
    {
      per_page: 5,
    },
    options,
  )

  return data.workflow_runs
}

export async function searchGithubUsers(query: string, options: RequestOptions = {}) {
  return cachedGet<GithubSearchResponse<GithubSearchUserItem>>(
    '/search/users',
    {
      q: query,
      per_page: 12,
    },
    options,
  )
}

export async function searchGithubRepositories(query: string, options: RequestOptions = {}) {
  return cachedGet<GithubSearchResponse<GithubSearchRepositoryItem>>(
    '/search/repositories',
    {
      q: query,
      per_page: 12,
      sort: 'stars',
      order: 'desc',
    },
    options,
  )
}

export async function getContributionCalendar(username: string, options: RequestOptions = {}) {
  const token = getGithubToken()

  if (!token) {
    return null
  }

  const query = `
    query UserContributionCalendar($login: String!) {
      user(login: $login) {
        contributionsCollection {
          commitContributionsByRepository(maxRepositories: 10) {
            repository {
              nameWithOwner
            }
            contributions(first: 1) {
              totalCount
            }
          }
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `

  const { data } = await github.post<{
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            weeks: Array<{
              contributionDays: GraphqlContributionDay[]
            }>
          }
          commitContributionsByRepository: GraphqlCommitRepositoryStat[]
        }
      }
    }
  }>(
    '/graphql',
    {
      query,
      variables: { login: username },
    },
    {
      signal: options.signal,
    },
  )

  const collection = data.data?.user?.contributionsCollection

  if (!collection) {
    return null
  }

  return {
    days: collection.contributionCalendar?.weeks.flatMap((week) => week.contributionDays) ?? [],
    commitRepositories: collection.commitContributionsByRepository ?? [],
  }
}

export function clearGithubCache() {
  // Kept for backward compatibility with older call sites.
}

async function cachedGet<T>(
  url: string,
  params?: Record<string, string | number>,
  options: RequestOptions = {},
) {
  const { data } = await github.get<T>(url, {
    params,
    signal: options.signal,
  })

  return data
}
