import {
  getContributionCalendar,
  getGithubCommits,
  getGithubContributors,
  getGithubEvents,
  getGithubIssues,
  getGithubOrganization,
  getGithubOrganizationRepositories,
  getGithubReadme,
  getGithubReleases,
  getGithubRepositories,
  getGithubRepository,
  getGithubUser,
  getGithubWorkflowRuns,
  searchGithubRepositories,
  searchGithubUsers,
} from '../api/github'
import { githubQueryClient } from './queryClient'

export const githubKeys = {
  all: ['github'] as const,
  user: (username: string) => [...githubKeys.all, 'user', username] as const,
  userRepositories: (username: string) => [...githubKeys.user(username), 'repositories'] as const,
  userEvents: (username: string) => [...githubKeys.user(username), 'events'] as const,
  userContributions: (username: string) => [...githubKeys.user(username), 'contributions'] as const,
  organization: (org: string) => [...githubKeys.all, 'organization', org] as const,
  organizationRepositories: (org: string) => [...githubKeys.organization(org), 'repositories'] as const,
  repository: (owner: string, repo: string) => [...githubKeys.all, 'repository', owner, repo] as const,
  repositoryReadme: (owner: string, repo: string) => [...githubKeys.repository(owner, repo), 'readme'] as const,
  repositoryReleases: (owner: string, repo: string) => [...githubKeys.repository(owner, repo), 'releases'] as const,
  repositoryContributors: (owner: string, repo: string) => [...githubKeys.repository(owner, repo), 'contributors'] as const,
  repositoryIssues: (owner: string, repo: string) => [...githubKeys.repository(owner, repo), 'issues'] as const,
  repositoryCommits: (owner: string, repo: string) => [...githubKeys.repository(owner, repo), 'commits'] as const,
  repositoryWorkflowRuns: (owner: string, repo: string) => [...githubKeys.repository(owner, repo), 'workflow-runs'] as const,
  searchUsers: (query: string) => [...githubKeys.all, 'search', 'users', query] as const,
  searchRepositories: (query: string) => [...githubKeys.all, 'search', 'repositories', query] as const,
}

export function fetchGithubUser(username: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.user(username),
    queryFn: ({ signal }) => getGithubUser(username, { signal }),
  })
}

export function fetchGithubRepositories(username: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.userRepositories(username),
    queryFn: ({ signal }) => getGithubRepositories(username, { signal }),
  })
}

export function fetchGithubEvents(username: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.userEvents(username),
    queryFn: ({ signal }) => getGithubEvents(username, { signal }),
  })
}

export function fetchContributionCalendar(username: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.userContributions(username),
    queryFn: ({ signal }) => getContributionCalendar(username, { signal }),
  })
}

export function fetchGithubOrganization(org: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.organization(org),
    queryFn: ({ signal }) => getGithubOrganization(org, { signal }),
  })
}

export function fetchGithubOrganizationRepositories(org: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.organizationRepositories(org),
    queryFn: ({ signal }) => getGithubOrganizationRepositories(org, { signal }),
  })
}

export function fetchGithubRepository(owner: string, repo: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.repository(owner, repo),
    queryFn: ({ signal }) => getGithubRepository(owner, repo, { signal }),
  })
}

export function fetchGithubReadme(owner: string, repo: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.repositoryReadme(owner, repo),
    queryFn: ({ signal }) => getGithubReadme(owner, repo, { signal }),
  })
}

export function fetchGithubReleases(owner: string, repo: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.repositoryReleases(owner, repo),
    queryFn: ({ signal }) => getGithubReleases(owner, repo, { signal }),
  })
}

export function fetchGithubContributors(owner: string, repo: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.repositoryContributors(owner, repo),
    queryFn: ({ signal }) => getGithubContributors(owner, repo, { signal }),
  })
}

export function fetchGithubIssues(owner: string, repo: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.repositoryIssues(owner, repo),
    queryFn: ({ signal }) => getGithubIssues(owner, repo, { signal }),
  })
}

export function fetchGithubCommits(owner: string, repo: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.repositoryCommits(owner, repo),
    queryFn: ({ signal }) => getGithubCommits(owner, repo, { signal }),
  })
}

export function fetchGithubWorkflowRuns(owner: string, repo: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.repositoryWorkflowRuns(owner, repo),
    queryFn: ({ signal }) => getGithubWorkflowRuns(owner, repo, { signal }),
  })
}

export function fetchGithubSearchUsers(query: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.searchUsers(query),
    queryFn: ({ signal }) => searchGithubUsers(query, { signal }),
  })
}

export function fetchGithubSearchRepositories(query: string) {
  return githubQueryClient.fetchQuery({
    queryKey: githubKeys.searchRepositories(query),
    queryFn: ({ signal }) => searchGithubRepositories(query, { signal }),
  })
}

export function clearGithubQueryCache() {
  githubQueryClient.clear()
}
