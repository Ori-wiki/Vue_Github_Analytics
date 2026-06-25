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
  GithubUser,
  GraphqlCommitRepositoryStat,
  GraphqlContributionDay,
} from '../types/github'

type RequestOptions = {
  signal?: AbortSignal
}

const cacheTtl = 5 * 60 * 1000
const cache = new Map<string, { expiresAt: number; value: unknown }>()

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
      per_page: 1,
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
  cache.clear()
}

async function cachedGet<T>(
  url: string,
  params?: Record<string, string | number>,
  options: RequestOptions = {},
) {
  const key = createCacheKey(url, params)
  const cached = cache.get(key)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T
  }

  const { data } = await github.get<T>(url, {
    params,
    signal: options.signal,
  })

  cache.set(key, {
    expiresAt: Date.now() + cacheTtl,
    value: data,
  })

  return data
}

function createCacheKey(url: string, params?: Record<string, string | number>) {
  return `${url}:${JSON.stringify(params ?? {})}:${getGithubToken() ? 'auth' : 'anon'}`
}
