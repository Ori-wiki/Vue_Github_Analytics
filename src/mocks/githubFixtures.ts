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
  GithubWorkflowRun,
} from '../types/github'

export const githubMockHeaders = {
  'x-ratelimit-limit': '5000',
  'x-ratelimit-remaining': '4990',
  'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
}

export function createMockUser(login: string): GithubUser {
  return {
    login,
    avatar_url: 'https://example.com/avatar.png',
    html_url: `https://github.com/${login}`,
    name: login,
    bio: 'Mock profile',
    company: null,
    location: null,
    blog: '',
    followers: login === 'torvalds' ? 1000 : 500,
    following: 1,
    public_repos: 1,
    created_at: '2020-01-01T00:00:00Z',
  }
}

export function createMockOrganization(login: string): GithubOrganization {
  return {
    login,
    avatar_url: 'https://example.com/org.png',
    html_url: `https://github.com/${login}`,
    name: login,
    description: 'Mock organization',
    public_repos: 1,
    followers: 100,
    location: null,
    created_at: '2020-01-01T00:00:00Z',
  }
}

export function createMockRepository(owner: string, name = 'core'): GithubRepository {
  return {
    id: owner === 'torvalds' ? 2 : 1,
    name,
    owner: { login: owner },
    full_name: `${owner}/${name}`,
    html_url: `https://github.com/${owner}/${name}`,
    description: 'Mock repository',
    language: 'TypeScript',
    stargazers_count: owner === 'torvalds' ? 200 : 100,
    forks_count: 10,
    open_issues_count: 2,
    watchers_count: 100,
    topics: ['vue', 'typescript'],
    pushed_at: new Date().toISOString(),
    created_at: '2020-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    archived: false,
    license: { name: 'MIT', spdx_id: 'MIT' },
    default_branch: 'main',
  }
}

export function createMockEvents(owner: string): GithubEvent[] {
  return [
    {
      id: '1',
      type: 'PushEvent',
      created_at: new Date().toISOString(),
      repo: { name: `${owner}/core` },
      payload: { commits: [{ sha: '1', message: 'feat' }] },
    },
  ]
}

export function createMockReadme(): GithubReadme {
  return {
    html_url: 'https://github.com/vuejs/core/blob/main/README.md',
    download_url: null,
    content: 'IyBWdWUgQ29yZQpNb2NrIFJFQURNRQ==',
    encoding: 'base64',
  }
}

export function createMockReleases(): GithubRelease[] {
  return [
    {
      id: 1,
      name: 'v1.0.0',
      tag_name: 'v1.0.0',
      html_url: 'https://github.com/vuejs/core/releases/tag/v1.0.0',
      published_at: new Date().toISOString(),
    },
  ]
}

export function createMockContributors(): GithubContributor[] {
  return [
    {
      id: 1,
      login: 'core-maintainer',
      avatar_url: 'https://example.com/contributor.png',
      html_url: 'https://github.com/core-maintainer',
      contributions: 42,
    },
  ]
}

export function createMockIssues(): GithubIssue[] {
  return [
    {
      id: 1,
      title: 'Mock issue',
      labels: [{ id: 1, name: 'bug', color: 'ef4444' }],
    },
  ]
}

export function createMockCommits(): GithubCommit[] {
  return Array.from({ length: 6 }, (_, index) => ({
      sha: '1',
      html_url: `https://github.com/vuejs/core/commit/${index + 1}`,
      commit: {
        message: `feat: mock commit ${index + 1}`,
        author: { name: 'Mock', date: new Date(Date.now() - index * 86400000).toISOString() },
      },
    }))
}

export function createMockWorkflowRuns(): GithubWorkflowRun[] {
  return [
    {
      id: 1,
      name: 'CI',
      html_url: 'https://github.com/vuejs/core/actions/runs/1',
      status: 'completed',
      conclusion: 'success',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}
