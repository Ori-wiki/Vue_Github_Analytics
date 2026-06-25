import { computed, ref } from 'vue'
import {
  getGithubCommits,
  getGithubContributors,
  getGithubIssues,
  getGithubReadme,
  getGithubReleases,
  getGithubRepository,
} from '../api/github'
import type {
  AppStatus,
  GithubCommit,
  GithubContributor,
  GithubIssue,
  GithubReadme,
  GithubRelease,
  GithubRepository,
} from '../types/github'
import { getGithubErrorStatus, getStatusMessage } from '../utils/githubErrors'

export function useRepositoryDetail() {
  const repository = ref<GithubRepository | null>(null)
  const readme = ref<GithubReadme | null>(null)
  const releases = ref<GithubRelease[]>([])
  const contributors = ref<GithubContributor[]>([])
  const issues = ref<GithubIssue[]>([])
  const latestCommit = ref<GithubCommit | null>(null)
  const status = ref<AppStatus>('idle')
  const dataWarning = ref('')

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

    status.value = 'loading'
    dataWarning.value = ''

    try {
      repository.value = await getGithubRepository(owner, repo)
      status.value = 'ready'
    } catch (unknownError) {
      repository.value = null
      status.value = getGithubErrorStatus(unknownError)
      return
    }

    const [readmeResult, releasesResult, contributorsResult, issuesResult, commitsResult] =
      await Promise.allSettled([
        getGithubReadme(owner, repo),
        getGithubReleases(owner, repo),
        getGithubContributors(owner, repo),
        getGithubIssues(owner, repo),
        getGithubCommits(owner, repo),
      ])

    readme.value = readmeResult.status === 'fulfilled' ? readmeResult.value : null
    releases.value = releasesResult.status === 'fulfilled' ? releasesResult.value : []
    contributors.value = contributorsResult.status === 'fulfilled' ? contributorsResult.value : []
    issues.value = issuesResult.status === 'fulfilled' ? issuesResult.value : []
    latestCommit.value = commitsResult.status === 'fulfilled' ? commitsResult.value[0] ?? null : null

    if ([readmeResult, releasesResult, contributorsResult, issuesResult, commitsResult].some(
      (result) => result.status === 'rejected',
    )) {
      dataWarning.value = 'Часть данных репозитория временно недоступна из-за лимита API или настроек репозитория.'
    }
  }

  return {
    repository,
    readme,
    readmePreview,
    releases,
    contributors,
    issues,
    issuesByLabel,
    latestCommit,
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
