import { describe, expect, it } from 'vitest'
import { createRepositoriesCsv } from './exportRepositories'
import type { GithubRepository } from '../types/github'

describe('repository export', () => {
  it('creates escaped CSV content', () => {
    const repositories: GithubRepository[] = [
      {
        id: 1,
        name: 'app',
        full_name: 'owner/app',
        html_url: 'https://github.com/owner/app',
        description: 'hello, "world"',
        language: 'TypeScript',
        stargazers_count: 10,
        forks_count: 2,
        open_issues_count: 1,
        pushed_at: '2026-06-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-06-01T00:00:00Z',
      },
    ]

    expect(createRepositoriesCsv(repositories)).toContain('"hello, ""world"""')
  })
})
