import { computed, ref } from 'vue'
import {
  fetchGithubCommits,
  fetchGithubContributors,
  fetchGithubIssues,
  fetchGithubReadme,
  fetchGithubReleases,
  fetchGithubRepository,
  fetchGithubWorkflowRuns,
} from '../queries/githubQueries'
import type {
  AppStatus,
  GithubCommit,
  GithubContributor,
  GithubIssue,
  GithubReadme,
  GithubRelease,
  GithubRepository,
  GithubWorkflowRun,
} from '../types/github'
import { getGithubErrorStatus, getStatusMessage } from '../utils/githubErrors'

export function useRepositoryDetail() {
  const repository = ref<GithubRepository | null>(null)
  const readme = ref<GithubReadme | null>(null)
  const releases = ref<GithubRelease[]>([])
  const contributors = ref<GithubContributor[]>([])
  const issues = ref<GithubIssue[]>([])
  const commits = ref<GithubCommit[]>([])
  const latestCommit = ref<GithubCommit | null>(null)
  const workflowRuns = ref<GithubWorkflowRun[]>([])
  const status = ref<AppStatus>('idle')
  const dataWarning = ref('')
  let requestId = 0

  const error = computed(() => getStatusMessage(status.value))
  const readmePreview = computed(() => decodeReadme(readme.value).slice(0, 1200))
  const issuesByLabel = computed(() => {
    const map = new Map<string, number>()

    for (const issue of issues.value.filter((item) => !item.pull_request)) {
      if (!issue.labels.length) {
        map.set('unlabeled', (map.get('unlabeled') ?? 0) + 1)
      }

      for (const label of issue.labels) {
        map.set(label.name, (map.get(label.name) ?? 0) + 1)
      }
    }

    return Array.from(map, ([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  })

  async function loadRepository(owner: string, repo: string) {
    if (!owner || !repo) {
      status.value = 'error'
      return
    }

    const currentRequestId = ++requestId
    status.value = 'loading'
    dataWarning.value = ''

    try {
      repository.value = await fetchGithubRepository(owner, repo)

      if (currentRequestId !== requestId) {
        return
      }

      status.value = 'ready'
    } catch (unknownError) {
      if (currentRequestId !== requestId) {
        return
      }

      repository.value = null
      status.value = getGithubErrorStatus(unknownError)
      return
    }

    const [readmeResult, releasesResult, contributorsResult, issuesResult, commitsResult, workflowsResult] =
      await Promise.allSettled([
        fetchGithubReadme(owner, repo),
        fetchGithubReleases(owner, repo),
        fetchGithubContributors(owner, repo),
        fetchGithubIssues(owner, repo),
        fetchGithubCommits(owner, repo),
        fetchGithubWorkflowRuns(owner, repo),
      ])

    if (currentRequestId !== requestId) {
      return
    }

    readme.value = readmeResult.status === 'fulfilled' ? readmeResult.value : null
    releases.value = releasesResult.status === 'fulfilled' ? releasesResult.value : []
    contributors.value = contributorsResult.status === 'fulfilled' ? contributorsResult.value : []
    issues.value = issuesResult.status === 'fulfilled' ? issuesResult.value : []
    commits.value = commitsResult.status === 'fulfilled' ? commitsResult.value : []
    latestCommit.value = commits.value[0] ?? null
    workflowRuns.value = workflowsResult.status === 'fulfilled' ? workflowsResult.value : []

    if (
      [readmeResult, releasesResult, contributorsResult, issuesResult, commitsResult, workflowsResult].some(
        (result) => result.status === 'rejected',
      )
    ) {
      dataWarning.value =
        'Часть данных репозитория временно недоступна из-за лимита API или настроек репозитория.'
    }
  }

  return {
    repository,
    readme,
    readmePreview,
    releases,
    contributors,
    issues,
    commits,
    issuesByLabel,
    latestCommit,
    workflowRuns,
    status,
    error,
    dataWarning,
    loadRepository,
  }
}

function decodeReadme(readme: GithubReadme | null) {
  if (!readme?.content || readme.encoding !== 'base64') {
    return ''
  }

  try {
    return decodeURIComponent(
      Array.from(atob(readme.content.replace(/\n/g, '')))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
  } catch {
    return ''
  }
}
