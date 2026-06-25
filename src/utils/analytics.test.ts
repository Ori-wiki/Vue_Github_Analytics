import { describe, expect, it } from 'vitest'
import {
  filterRepositories,
  getComparisonProfile,
  getCommitStats,
  getLanguageStats,
  getTotalStars,
} from './analytics'
import type { GithubEvent, GithubRepository } from '../types/github'

const repositories = [
  createRepository({ name: 'alpha', language: 'TypeScript', stars: 10, pushedAt: '2026-06-20T00:00:00Z' }),
  createRepository({ name: 'beta', language: 'Vue', stars: 30, pushedAt: '2026-06-22T00:00:00Z' }),
  createRepository({ name: 'gamma', language: 'TypeScript', stars: 5, pushedAt: '2026-06-21T00:00:00Z' }),
]

describe('analytics utils', () => {
  it('counts total stars', () => {
    expect(getTotalStars(repositories)).toBe(45)
  })

  it('groups repositories by language', () => {
    expect(getLanguageStats(repositories)).toEqual([
      { name: 'TypeScript', repositories: 2, stars: 15 },
      { name: 'Vue', repositories: 1, stars: 30 },
    ])
  })

  it('filters and sorts repositories', () => {
    const result = filterRepositories(repositories, 'a', 'all', 'stars')

    expect(result.map((repository) => repository.name)).toEqual(['beta', 'alpha', 'gamma'])
  })

  it('builds commit stats from push events', () => {
    const events: GithubEvent[] = [
      {
        id: '1',
        type: 'PushEvent',
        created_at: '2026-06-25T00:00:00Z',
        repo: { name: 'org/app' },
        payload: { commits: [{ sha: '1', message: 'init' }, { sha: '2', message: 'feat' }] },
      },
      {
        id: '2',
        type: 'WatchEvent',
        created_at: '2026-06-25T00:00:00Z',
        repo: { name: 'org/other' },
        payload: {},
      },
    ]

    expect(getCommitStats(events)).toEqual([{ repo: 'org/app', commits: 2 }])
  })

  it('builds comparison score metrics', () => {
    const profile = getComparisonProfile(
      {
        login: 'owner',
        avatar_url: '',
        html_url: '',
        name: null,
        bio: null,
        company: null,
        location: null,
        blog: '',
        followers: 100,
        following: 1,
        public_repos: 3,
        created_at: '2026-01-01T00:00:00Z',
      },
      repositories,
      [],
    )

    expect(profile.popularityScore).toBeGreaterThan(0)
    expect(profile.maintenanceScore).toBeGreaterThan(0)
    expect(profile.totalScore).toBe(profile.popularityScore + profile.activityScore + profile.maintenanceScore)
  })
})

function createRepository(input: {
  name: string
  language: string
  stars: number
  pushedAt: string
}): GithubRepository {
  return {
    id: input.name.length,
    name: input.name,
    full_name: `owner/${input.name}`,
    html_url: `https://github.com/owner/${input.name}`,
    description: null,
    language: input.language,
    stargazers_count: input.stars,
    forks_count: 0,
    open_issues_count: 0,
    pushed_at: input.pushedAt,
    created_at: input.pushedAt,
    updated_at: input.pushedAt,
  }
}
